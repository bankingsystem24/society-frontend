import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = sessionStorage.getItem("token");

  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
};

// ================= GET =================

export const apiGet = async (url: string) => {
  const res = await axios.get(`${BASE_URL}${url}`, {
    headers: getHeaders(),
  });

  return res.data;
};

// ================= POST =================

export const apiPost = async (
  url: string,
  data: any
) => {
  const res = await axios.post(
    `${BASE_URL}${url}`,
    data,
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};

// ================= PUT =================

export const apiPut = async (
  url: string,
  data: any
) => {
  const res = await axios.put(
    `${BASE_URL}${url}`,
    data,
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};

// ================= DELETE =================

export const apiDelete = async (url: string) => {
  const res = await axios.delete(
    `${BASE_URL}${url}`,
    {
      headers: getHeaders(),
    }
  );

  return res.data;
};