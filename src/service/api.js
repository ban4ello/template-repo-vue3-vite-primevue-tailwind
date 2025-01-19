import axios from 'axios';
import config from './config';

export default () => {
  const Api = axios.create(config);

  // Api.interceptors.response.use(
  //   (response) => response,
  //   (error) => {
  //     if (error.message === 'Network Error') {
  //       console.log('setError', 'Нет подключения к интернету. Проверьте соединение и перезагрузите страницу.');
  //     }
  //     return Promise.reject(error);
  //   }
  // );
  return Api;
};
