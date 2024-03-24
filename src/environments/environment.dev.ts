
import { commonEnv } from "./environment.common";

const env: Partial<typeof commonEnv> = {
  production: false,
  apiURL: 'https://dev.api.freterium.com/v2',
  environment: 'development',
  sentry_environment: 'development',
  sentry_dsn: "https://b3ecc05008204aa48e50157e457456ca@o447794.ingest.sentry.io/6299261",
  jitsu_api_key: "js.ojvipvh0x5j4l8rfuoci6v.p00luaumlair4rkgm4qfm",
  flagsmith_api_key: "VKJzir68qhnVvSFjH8T5sC"
};

// Export all settings of common replaced by dev options
export const environment = Object.assign(commonEnv, env);
