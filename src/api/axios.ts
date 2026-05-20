import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const apiGet = async (url: string) => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${BASE_URL}${url}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res.data;
};