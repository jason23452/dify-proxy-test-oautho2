import ApiService from "@/services/services"; // 傳參數請建立fetchxxxx 將get 前端與後端分開
import { CHAT_MESSAGES, GET_META, GET_INFO } from "./server.js";

export const Get_Mata = async (data) => {
  return await ApiService.get(GET_META, data);
};

export const Get_Ifon = async (data) => {
  return await ApiService.get(GET_INFO, data);
};
