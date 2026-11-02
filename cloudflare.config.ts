import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    "name": "ai-laohuangli",
    "compatibilityDate": "2026-10-23",
    "observability": {
      "enabled": true
    },
    "assets": {
      "notFoundHandling": "single-page-application"
    }
  }
});
