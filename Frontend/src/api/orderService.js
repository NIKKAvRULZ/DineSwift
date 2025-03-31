import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5003/api/orders", // Update as per backend URL
});

export default instance;
