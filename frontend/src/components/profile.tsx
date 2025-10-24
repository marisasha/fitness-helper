import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import * as utils from "../components/utils";

interface JwtPayload {
  user_id: string | number;
  username: string;
  exp: number; // время истечения
  iat: number; // время выпуска
}

export function useUser() {
  const [user, setUser] = useState<JwtPayload | null>(null);

  useEffect(() => {
    // пробуем взять из localStorage
    const accessToken = utils.LocalStorage.get("userLogin.data.access");

    if (accessToken) {
      try {
        const decoded: JwtPayload = jwtDecode(accessToken);
        setUser(decoded);
      } catch (e) {
        console.error("Ошибка при декодировании токена:", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  return user;
}
