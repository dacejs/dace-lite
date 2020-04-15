import { createStore, applyMiddleware, Reducer } from 'redux';
import Express from 'express';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import axiosInstance from 'axios';

declare global {
  interface Window { INITIAL_STATE: any; }
}

/**
 * 创建 store
 *
 * @param {object} initialState state 初始值
 * @param {Express.Request} req
 * @return {store}
 */
export default (
  initialReducer: Reducer = (state = {}) => state,
  initialState: object = {},
  req?: Express.Request
) => {
  if (req) {
    axiosInstance.defaults.baseURL = `${req.protocol}://${req.headers.host}`;
    // 透传 headers
    axiosInstance.defaults.headers = {
      ...req.headers
    };
  }

  const middlewares = [thunk.withExtraArgument(axiosInstance)];
  const store: any = createStore(
    initialReducer,
    initialState,
    // TODO: 不打包到线上环境
    composeWithDevTools(applyMiddleware(...middlewares))
  );

  return store;
};
