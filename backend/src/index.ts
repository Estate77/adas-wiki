/**
 * 服务入口
 */
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚗  ADAS-Wiki backend listening on http://localhost:${env.PORT}`);
  console.log(`    ENV: ${env.NODE_ENV}`);
});
