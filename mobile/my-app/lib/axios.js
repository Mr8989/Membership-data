import Axios from "axios";

export const axiosInstance = Axios.create({
    baseURL: process.env.NODE_ENV === "development" ? "http://localhost:5000/api" : "http:// 127.0.0.1 :5000/api",
    withCredentials: true // send cookies to the server  
});

console.log("base url", axiosInstance.defaults.baseURL)
