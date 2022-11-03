const env = require('@blocklet/sdk/lib/env');
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  ...env,
  chainHost: process.env.CHAIN_HOST || '',
  isDev,
  proxy: isDev ? 'http://127.0.0.1:1080' : undefined, // 设置本地翻墙，否则无法访问 etherscan
  apiTTL: 10 * 60, // 接口缓存时长，单位为秒
};
