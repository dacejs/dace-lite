import React, { Component } from 'react';
import { Helmet as Head } from 'react-helmet';
import { connect } from 'react-redux';
import { fetchName } from './action';
import getInitialProps from '../../runtime/getInitialProps';

@getInitialProps({
  // reducer,
  promise: (props: any) => {
    console.log('--Home---');
    return props.store.dispatch(fetchName());
  }
})
@connect((state) => state, { fetchName })
export default class extends Component<any, any> {
  render() {
    const { name } = this.props;
    return (
      <>
        <Head>
          <title>Home title</title>
        </Head>
        <h1>Hello, {name}</h1>
      </>
    );
  }
}
