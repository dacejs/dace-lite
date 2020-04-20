// eslint-disable-next-line spaced-comment
// import * as helmet from 'react-helmet';

declare namespace NodeJS {
  interface ProcessEnv extends DaceDefaultEnv{
  }
}

interface CreateConfigOptions {
  webpack: any;
  daceConfig: any;
  target: string;
  isDev: boolean;
  program: any;
}

interface DocumentOptions {
  head: ReactHelmet.HelmetData;
  markup: string;
  state: string;
  styleTags: string;
  scriptTags: string;
}

interface DaceDefaultEnv {
  // web server 主机名
  DACE_HOST: string;

  // web server 端口
  DACE_PORT: string;

  // 是否启用服务器端渲染
  DACE_SSR: string;

  // Server 编译时是否压缩文件
  DACE_SERVER_MINIMIZE: string;

  // Client 编译时是否压缩文件
  DACE_CLIENT_MINIMIZE: string;

  // 输出的 script 标签是否使用 crossorigin 属性
  DACE_SCRIPT_CROSSORIGIN: string;

  // 公共包包含的文件，包之间用竖线连接，匹配时使用的是正则匹配
  DACE_VENDORS: string;

  // 静态文件是否使用长期缓存
  DACE_LONG_TERM_CACHING: string;

  // 静态文件长期缓存长度
  DACE_LONG_TERM_CACHING_LENGTH: string;

  // 静态文件目录，多个目录用逗号隔开
  DACE_STATIC: string;

  // 服务器端编译入口文件位置
  DACE_PATH_SERVER_ENTRY: string;

  // 浏览器端编译产物输出目录位置
  DACE_PATH_CLIENT_DIST: string;

  // 服务器端编译产物输出目录位置
  DACE_PATH_SERVER_DIST: string;

  // 客户端编译输出 stats 文件名称
  DACE_STATS_JSON: string;

  // 客户端编译输出 stats 文件位置
  DACE_PATH_STATS_JSON: string;

  // 编译产物对外服务访问使用的 URL
  DACE_PUBLIC_PATH: string;
}


interface DaceConfigOptions {
  modify?: Function
}
