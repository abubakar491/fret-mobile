import { jitsuClient } from '@jitsu/sdk-js'
import { environment } from '../../environments/environment';

export const analytics = jitsuClient({
    key: environment.jitsu_api_key,
    tracking_host: environment.jitsu_host,
});