import { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Dispatch } from 'react';
import { Action } from 'redux';

export const FETCH_NAME = 'fetch_name';

export const fetchName = () => async (
  dispatch: Dispatch<any>,
  getState: Action,
  axios: AxiosInstance
) => {
  const axiosConfig: AxiosRequestConfig = {
    // 注意，需要确保该接口可用
    // baseURL: 'http://localhost:8081',
    url: '/api/test',
    method: 'get',
    params: {}
  };
  // console.log('axiosConfig:', axiosConfig);
  const res: AxiosResponse = await axios(axiosConfig);
  const payload = res?.data;

  // return promise;
  return dispatch({
    type: FETCH_NAME,
    payload
  });
};
