/*
 * @Author: huanghuanrong
 * @Date: 2026-02-10 11:42:03
 * @LastEditTime: 2026-02-10 18:46:20
 * @LastEditors: huanghuanrong
 * @Description: 文件描述
 * @FilePath: \flowa1\postcss.config.js
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
  // 配置 px 转 rem，根字号 16px 时 1rem = 16px
  'postcss-pxtorem': {
    rootValue: 16,   // 根字号
    propList: ['*'], // 所有属性都转换
  },
}
