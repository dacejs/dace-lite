/**
 * 自定义服务器端渲染模版
 * 可以通过该模版改写首屏的 DOM 结构
 * @param {object} options 传入参数
 * @param {object} options.head helmet 实例，里面包含 title, meta, link, style, script, noscript 等
 * @param {string} options.markup 服务器端渲染生成的 DOM 字符串
 * @param {string} options.state 服务器端渲染生成的 state 经 JSON.stringify() 后的字符串
 * @param {string} options.styleTags @loadable/component 输出的 state 字符串
 * @param {string} options.scriptTags @loadable/component 输出的 state 字符串
 * @return {string} 首屏 HTML
 */

interface DocumentOptions {
  head: ReactHelmet.HelmetData;
  markup: string;
  state: string;
  styleTags: string;
  scriptTags: string;
}

export default ({
  head,
  markup,
  state,
  styleTags,
  scriptTags
}: DocumentOptions): string => {
  const print = (key: string): string => {
    const meta = (head as any)[key];
    if (meta && typeof meta.toString === 'function') {
      return meta.toString();
    }
    return '';
  };

  const metaString = ['title', 'meta', 'link', 'style', 'script', 'noscript']
    .map((key) => print(key))
    .join('');

  return `<!doctype html>
  <html ${print('htmlAttributes')}>
  <head>
    <meta charset="utf-8" />${metaString}${styleTags}
  </head>
  <body ${print('bodyAttributes.toString')}>
    <div id="root">${markup}</div>
    <script>window.INITIAL_STATE=${state};</script>${scriptTags}
  </body>
  </html>`;
};
