// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const commonEnv = {
  production: false,
  apiURL: 'https://dev.api.freterium.com/v2',
  downloadURL: 'https://www.freterium.com/drivers-app',
  uploads: 'api.freterium.com/uploads/commandes/', // TODO:NEED TO CHANGE PER ENVIRONMENT
  environment: 'development',
  sentry_environment: 'development',
  sentry_dsn: "https://b3ecc05008204aa48e50157e457456ca@o447794.ingest.sentry.io/6299261",
  jitsu_api_key: "js.ojvipvh0x5j4l8rfuoci6v.p00luaumlair4rkgm4qfm",
  jitsu_host: "https://events.freterium.com",
  flagsmith_api_key: "VKJzir68qhnVvSFjH8T5sC",
  user: {
    auth: '/authentification',
    refreshToken: '/refresh-token',
    userNotifications: '/notifications',
    markAsRead: '/notification/markasread',
    markAsSeen: '/notification/markasseen',
    userAlerts: '/alerts',
    locations: '/locations',
    version: '/version',
  },
  orders: {
    get: '/order/get', // /?user_id=XX&id=YY
    loadOrder: '/mission', // /?user_id=XX&id=YY
    ordersList: '/missions/list', // /?user_id=XX
    orderAccept: '/missions/accept', // ?user_id=XX&mission_id=YY&comment=Some-Text
    orderAcceptAll: '/missions/accept', // ?user_id=XX&orders_id=YY,ZZ,AA&comment=Some-Text
    orderRefuse: '/missions/refus', // ?user_id=XX&mission_id=YY&comment=Some-Text
    orderStatusGet: '/missions/status/get', // ?user_id=XX&mission_id=YY
    orderStatusUpdate: '/orders/status/set', // ?user_id=XX&mission_id=YY&status=Z&comment=Some-Text
    orderStatusBack: '/status/annul',
    orderReport: '/missions/report', // user_id=57&mission_id=48&comment=test&status=3
    orderSendGeoLocation: '/missions/geo', // ?user_id=XX&mission_id=YY&lat=14.2541&lon=7.1545,
    sendGeoLocations: '/geo', // ?user_id=XX ||| Body : Array of missions with geolocations
    orderAssignByQRKey: '/assignment/direct', // ?user_id=XX&qr_key=XD5F4M&driver_id=123'
    callOffMarkAsRead: '/call_off', // user_id=XX&call_id=XX
    sendPOD: '/order/pod/set', // user_id=XX&mission_id=XX ||| picture[] in body
    ongoingOrders: '/orders', // user_id=XX
    setAttribute: '/orders/set', // user_id, action=loading_started|delivery_started|..., orders_id=123,456
    // user_id, orders_id = 123,456, as = 'not_loaded' || 'returned' || 'postponed' || 'canceled' || 'closed'
    // markAs: '/orders/markas',
    // user_id, orders_id = 123,456, as = 'not_loaded' || 'returned' || 'postponed' || 'canceled' || 'closed'
    markAs: '/order/completed',
    cargoPayment: '/cargopayments',
    paymentModes: '/payment-modes',
    transfer: '/transfer-order',
    transferCheck: '/transfer',
    returnReasons: '/return-reasons'
  },
  discussions: {
    discussions: '/messages',
    markAsRead: '/discussions/status/set', // order_id for specific discussion || empty for all
    getDiscussion: '/discussion', // user_id & order_id
    getMessages: '/message/get', // user_id & order_id
    sendMessage: '/message/send' // user_id, order_id, message & type
  }
}
