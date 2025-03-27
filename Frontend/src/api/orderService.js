import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5002/api", // Update as per backend URL
});

export default instance;
