/**
 * 在原生的 connect 上再包一层，
 * 避免使用 @connect 装饰器时出现以下 typescript 错误：
 * Unable to resolve signature of class decorator when called
 *
 * @see
 * https://kirainmoe.com/blog/post/some-problems-of-typescript-with-react/
 */

import { connect } from 'react-redux';

export default (mapStateToProps: any, actions: any) => (target: any) => (
  connect(mapStateToProps, actions)(target) as any
);
