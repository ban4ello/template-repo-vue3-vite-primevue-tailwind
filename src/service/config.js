// import jsonBig from "json-bigint";

export default {
  // baseURL: 'http://localhost:8000/api/',
  baseURL: `${import.meta.env.VITE_API_HOST}/api/`,
  // baseURL: `${process.env.VITE_API_HOST}${process.env.VITE_API_VERSION_PREFIX}`,
  timeout: 10000,
  // withCredentials: false,
  // responseType: 'text',
  maxContentLength: 2000,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
  maxRedirects: 5
};
