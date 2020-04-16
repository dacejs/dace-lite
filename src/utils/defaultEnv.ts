const defaultEnv: DaceDefaultEnv = {
  // web server 主机名
  DACE_HOST: 'localhost',

  // web server 端口
  DACE_PORT: '3000',

  // 编译产物对外服务访问使用的 URL
  DACE_PUBLIC_PATH: '/',

  // 是否启用服务器端渲染
  DACE_SSR: 'true',

  // Server 编译时是否压缩文件
  DACE_SERVER_MINIMIZE: 'true',

  // Client 编译时是否压缩文件
  DACE_CLIENT_MINIMIZE: 'true',

  // 输出的 script 标签是否使用 crossorigin 属性
  DACE_SCRIPT_CROSSORIGIN: 'true',

  // 公共包包含的文件，包之间用竖线连接，匹配时使用的是正则匹配
  DACE_VENDORS: 'react|redux',

  // 静态文件是否使用长期缓存
  DACE_LONG_TERM_CACHING: 'true',

  // 静态文件长期缓存长度
  DACE_LONG_TERM_CACHING_LENGTH: '8',

  // 静态文件目录，多个目录用逗号隔开
  DACE_STATIC: '',

  // 以 `DACE_PATH_` 开头的变量会转换成绝对路径
  // 工程根目录
  DACE_PATH_ROOT: '.',

  // dace 配置文件位置
  // dace-plugin-* 会用到
  DACE_PATH_CONFIG: 'dace.config.js',

  // postcss 配置文件位置
  DACE_PATH_POSTCSS_RC: 'postcss.config.js',

  // profiles 目录位置
  DACE_PATH_PROFILES: 'profiles',

  // src 目录位置
  DACE_PATH_SRC: 'src',

  // pages 目录位置
  DACE_PATH_PAGES: 'src/pages',

  // 服务器端编译入口文件位置
  DACE_PATH_SERVER_ENTRY: 'src/runtime/server.ts',

  // 浏览器端编译产物输出目录位置
  DACE_PATH_CLIENT_DIST: 'prd',

  // 服务器端编译产物输出目录位置
  DACE_PATH_SERVER_DIST: 'dist',

  // 客户端编译输出 stats 文件位置
  DACE_PATH_STATS_JSON: 'prd/stats.json'
};

export default defaultEnv;
