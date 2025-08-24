import axios from "axios";

const clientServer = axios.create({
  baseURL: "http://localhost:9090/", // Change to your backend API
  headers: {
    "Content-Type": "application/json",
  },
});

export default clientServer;