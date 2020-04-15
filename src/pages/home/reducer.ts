import { AnyAction } from 'redux';
import { FETCH_NAME } from './action';

export default (state: any, action: AnyAction) => {
  switch (action.type) {
    case FETCH_NAME: {
      return {
        ...state,
        ...action.payload
      };
    }
    default:
      return state;
  }
};
