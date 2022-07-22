import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'Site Name',
  mode: 'site',
  // more config: https://d.umijs.org/config
  locales: [['zh-CN', '中文']],
  base: '/note2/',
  publicPath: '/note2/',
});
