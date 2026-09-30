import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // Ces variables seront injectées AU BUILD dans le bundle JS
  // Elles sont lues depuis process.env au moment du build Cloudflare
});