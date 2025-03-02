import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getAllSheets = async () => {
  const response = await axios.get(API_URL);
  console.log("hello", response.data);
  return response.data;
};

export const createSheet = async (name) => {
  const response = await axios.post(API_URL, { name });
  return response.data;
};

export const getSheetById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const updateSheet = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};
