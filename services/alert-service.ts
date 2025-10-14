import { CreateAlertPayload } from "@/types/alert";
import axios from "axios";
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const alertService = {
  async createAlert(payload: CreateAlertPayload, accessToken: string) {
    const url = `${BASE_URL}/alert/api/alerts`;
    console.log("요청 URL:", url);
    console.log("요청 데이터:", payload);
    console.log("accessToken:", accessToken?.slice(0, 20) + "...");

    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  },
};
