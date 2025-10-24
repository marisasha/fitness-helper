import { refreshAccessToken } from "./token";
import { useNavigate } from "react-router-dom";
import React from "react";
import axios from "axios";
import * as utils from "../components/utils";

// 🔹 Создаёт константы для редьюсера
export function constructorConstant(prefix: string) {
  return {
    load: `load_${prefix}`,
    success: `success_${prefix}`,
    fail: `fail_${prefix}`,
    error: `error_${prefix}`,
    reset: `reset_${prefix}`,
  };
}

// 🔹 Конструктор редьюсера
export function constructorReducer(constant: any) {
  return function (state = {}, action: { type: string; payload: any }) {
    switch (action.type) {
      case constant.load:
        return { load: true };
      case constant.success:
        return { load: false, data: action.payload };
      case constant.fail:
        return { load: false, fail: action.payload };
      case constant.error:
        return { load: false, error: action.payload };
      case constant.reset:
        return { load: false };
      default:
        return state;
    }
  };
}

// 🔹 Проверка срока жизни токена
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (err) {
    console.error("Ошибка парсинга токена", err);
    return true;
  }
}

// 🔹 Получение действительного токена
async function getValidAccessToken(): Promise<string | null> {
  let access = utils.LocalStorage.get("userLogin.data.access");
  if (!access || isTokenExpired(access)) {
    access = await refreshAccessToken();
  }
  return access;
}

// 🔹 Основная функция для запросов
export async function constructorWebAction(
  dispatch: any,
  constant: any,
  url: string,
  method: string = "GET",
  headers: any = {},
  data: any = {},
  timeout: number = 5000,
  isExtra: boolean = false,
  isLoginOrRegister: boolean = false,
) {
  dispatch({ type: constant.load });

  const makeRequest = async (token: string | null) => {
    const config: any = { url, method, timeout };

    // Для обычных запросов добавляем Authorization
    if (!isLoginOrRegister && token) {
      config.headers = { ...headers, Authorization: `Sasha ${token}` };
    } else {
      config.headers = { ...headers };
    }

    if (method.toUpperCase() !== "GET") {
      config.data = data;
    }
    
    return axios(config);
  };

  try {
    let access: string | null = null;
    if (!isLoginOrRegister) {
      access = await getValidAccessToken();
      if (!access) throw new Error("NO_ACCESS");
    }

    let response;
    try {
      response = await makeRequest(access);
    } catch (err: any) {
      // Если токен просрочен между проверкой и запросом
      if (!isLoginOrRegister && err.response?.status === 401) {
        const newAccess = await refreshAccessToken();
        if (!newAccess) throw new Error("Не удалось обновить токен");
        response = await makeRequest(newAccess);
      } else {
        throw err;
      }
    }

    if (response.status === 200 || response.status === 201) {
      dispatch({
        type: constant.success,
        payload: isExtra ? response.data : response.data.data,
      });
    } else {
      dispatch({ type: constant.error, payload: response.statusText });
    }
  } catch (error: any) {
    console.error(`constructorWebAction: ${url} ${method}`, error);
    dispatch({ type: constant.fail, payload: "Свяжитесь с администратором" });
  }
}