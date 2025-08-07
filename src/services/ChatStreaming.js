import { useUserStore } from "@/stores/user";
import { useApiKeyStore } from "@/stores/apiKey";
 
const apiKeyStore = useApiKeyStore();

const DIFY_API_KEY = apiKeyStore.getChatKet();
// async generator：每收到 chunk 就 yield 一次
export async function* chatStreaming(data) {
  // 1. 檢查 SSO token
  const userStore = useUserStore();
  const ok = await userStore.ensureValidToken();
  if (!ok) {
    userStore.login();
    throw new Error("Token 已過期，請重新登入");
  }

  // 2. headers
  const headers = {
    "Content-Type": "application/json",
  };
  if (userStore.accessToken) {
    headers["X-User-Token"] = `Bearer ${userStore.accessToken}`;
  }
  if (DIFY_API_KEY) {
    headers["Authorization"] = `Bearer ${DIFY_API_KEY}`;
  }

 const fetchUrl = "/dify/chat-messages";
  const response = await fetch(fetchUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // 以換行分割 (SSE 格式通常每個 event 結尾是 \n 或 \n\n)
    let lines = buffer.split("\n");
    buffer = lines.pop(); // 可能還有沒接完的下一包

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const jsonStr = line.replace("data: ", "");
        const data = JSON.parse(jsonStr);
        yield data; // data.answer
      } catch (e) {
        // parse 失敗就略過
      }
    }
  }
  // 最後剩下的 buffer
  if (buffer && buffer.startsWith("data: ")) {
    try {
      const jsonStr = buffer.replace("data: ", "");
      const data = JSON.parse(jsonStr);
      yield data;
    } catch (e) {}
  }
}

export default {
  chatStreaming,
};
