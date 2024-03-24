
import { commonEnv } from "./environment.common";

const env: Partial<typeof commonEnv> = {
  production: true,
  apiURL: 'https://staging.api.freterium.com/v2',
  environment: 'staging',
  sentry_environment: 'staging',
  sentry_dsn: "https://b3ecc05008204aa48e50157e457456ca@o447794.ingest.sentry.io/6299261",
  jitsu_api_key: "js.ojvipvh0x5j4l8rfuoci6v.akt0f8b6lwhg6wfwj89nfh",
  flagsmith_api_key: "if8BHJwS76oqgdQCREgy8v"
};

// Export all settings of common replaced by dev options
export const environment = Object.assign(commonEnv, env);


