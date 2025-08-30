import Axios from "axios";

const axios = Axios.create({
  baseURL: "http://localhost:3333", // ajuste pro seu backend
});

export default axios;
