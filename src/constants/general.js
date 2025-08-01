import ApiService from "@/services/services"; // 傳參數請建立fetchxxxx 將get 前端與後端分開
import {
  CHAT_MESSAGES,
  GET_META,
  GET_CONVERSATIONS,
  GET_CONVERSATION_HISTORY_MESSAGES,
  DELETE_CONVERSATION,
  FILE_UPLOAD,
} from "./server.js";

export const Get_Mata = async (data) => {
  return await ApiService.get(GET_META, data);
};

export const Get_Conversations = async (data) => {
  return await ApiService.get(GET_CONVERSATIONS, data);
};

export const Chat_Messages = async (data) => {
  return await ApiService.post(CHAT_MESSAGES, data);
};

export const Get_conversation_history_messages = async (data) => {
  return await ApiService.get(GET_CONVERSATION_HISTORY_MESSAGES, data);
};



export const Delete_Conversation  = async (data) => {
  return await ApiService.delete(DELETE_CONVERSATION+"/"+data.conversation_id , data);
};

export const File_Upload = async (data) => {
  return await ApiService.post(FILE_UPLOAD, data);
};
