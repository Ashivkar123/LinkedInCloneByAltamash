import axios from "axios";

export const BASE_URL = "https://linkedinclonebyaltamash.onrender.com";

export const clientServer = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
