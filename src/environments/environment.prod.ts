import { commonEnv } from "./environment.common";

const env: Partial<typeof commonEnv> = {
  production: true,
  apiURL: 'https://api.freterium.com/v2',
  environment: 'production',
  sentry_environment: 'production',
  sentry_dsn: "https://b3ecc05008204aa48e50157e457456ca@o447794.ingest.sentry.io/6299261",
  jitsu_api_key: "js.ojvipvh0x5j4l8rfuoci6v.mn4s0olxecguphbvipryq",
  jitsu_host: "https://events.freterium.com",
  flagsmith_api_key: "4xX5YXf6z9zThivL8Azhx8"
};

// Export all settings of common replaced by dev options
export const environment = Object.assign(commonEnv, env);

