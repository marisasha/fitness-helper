import axios from "axios";
import * as constants from "./constants";
import * as utils from "./utils";

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = utils.LocalStorage.get("userLogin.data.refresh");
  if (!refresh) return null;

  try {
    const res = await axios.post(`${constants.host}/api/token/refresh/`, {
      refresh: refresh,
    });

    const newAccess = res.data.access;
    const newRefresh = res.data.refresh; 

    utils.LocalStorage.set("userLogin.data.access", newAccess);
    utils.LocalStorage.set("userLogin.data.refresh", newRefresh);

    return newAccess;
  } catch (err) {
    window.location.href = "/";
    return null;
  }
}