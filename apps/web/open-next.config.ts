import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // Désactive le cache incrémental (ISR) qui ralentit le build
  incrementalCache: undefined,
  // Désactive la queue qui n'est pas nécessaire en DEV
  queue: undefined,
});