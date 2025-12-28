import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sodamusic.app',
  appName: '汽水音乐',
  webDir: 'dist',
  server: {
    // 开发时使用电脑IP，真机可以访问
    // 生产环境删除此配置
    url: 'http://192.168.31.200:5174',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0a0b0f'
  }
};

export default config;
