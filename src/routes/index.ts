import express from 'express';
import ssrMiddleware from '../runtime/ssrMiddleware';
import Home from '../pages/home/Home';
import homeReducer from '../pages/home/reducer';
import Basic from '../pages/basic/Basic';
import test from './api/test';

const router = express.Router();
router.get('/', ssrMiddleware({
  Component: Home,
  name: 'home',
  reducer: homeReducer
}));
router.get('/basic', ssrMiddleware({
  Component: Basic,
  name: 'basic'
}));
router.get('/api/test', test);

export default router;
