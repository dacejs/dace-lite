import React, { Component } from 'react';
import PropTypes from 'prop-types';

interface GetInitialPropsOptions {
  reducer?: any;
  promise: any;
  defer?: boolean;
}

/**
 * 页面组件渲染前获取数据的装饰器
 * 装饰器会将数据获取的请求代码分别注入到组件的
 * 静态方法 `getInitialProps()` 和生命周期方法 `componentDidMount()`
 * 以简化开发编码
 *
 * @param {object} options
 * @param {function} options.reducer
 * @param {function|[function]} options.promise
 */
// eslint-disable-next-line max-len
export default (options: GetInitialPropsOptions) => (Target: any) => class extends Component<any, any> {
  static propTypes = {
    store: PropTypes.object.isRequired
  };

  constructor(props: any) {
    super(props, Target);
  }

  async componentDidMount() {
    // 该方法在页面浏览器端渲染时会调用
    const { promise } = options;
    if (!promise) {
      throw new Error('getInitialProps must pass in an object containing the key "promise"');
    }
    await promise(this.props);
  }

  /**
   * 服务器端渲染时会先调用该方法获取数据
   * 数据回来后通过 redux 更新 store
   *
   * @param {object} options
   * @param {function} options.reducer 需要动态绑定的 reducer
   * @param {function|[function]} options.promise 获取数据的 fetch 函数
   *
   * @return {Promise}
   */
  static getInitialProps(ctx: any): any {
    // 该方法在页面服务器端渲染时会调用
    const { promise } = options;
    if (!promise) {
      throw new Error('getInitialProps must pass in an object containing the key "promise"');
    }
    return promise(ctx);
  }

  render() {
    return (
      <Target {...this.props} />
    );
  }
};
