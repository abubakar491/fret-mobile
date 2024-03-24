export const STATUS = {
    WAITING: 0,
    CONFIRMED: 1,
    ONWAY_LOADING: 2,
    ONSITE_LOADING: 3,
    LOADED: 4,
    ONWAY_DELIVERY: 5,
    ONSITE_DELIVERY: 6,
    DELIVERED: 7
}

export const STATUS_ICONS = {
    WAITING: 'assets/images/icons/icon-waiting-w.png',
    0: 'assets/images/icons/icon-waiting-w.png',
    CONFIRMED: 'assets/images/icons/icon-check-w.png',
    1: 'assets/images/icons/icon-check-w.png',
    ONWAY_LOADING: 'assets/images/icons/icon-truck-onroad-w.png',
    2: 'assets/images/icons/icon-truck-onroad-w.png',
    ONSITE_LOADING: 'assets/images/icons/icon-truck-waiting-w.png',
    3: 'assets/images/icons/icon-truck-waiting-w.png',
    LOADED: 'assets/images/icons/icon-truck-check-w.png',
    4: 'assets/images/icons/icon-truck-check-w.png',
    LEFT_LOADING: 'assets/images/icons/icon-truck-onroad-w.png',
    41: 'assets/images/icons/icon-truck-onroad-w.png',
    ONWAY_DELIVERY: 'assets/images/icons/icon-truck-onroad-w.png',
    5: 'assets/images/icons/icon-truck-onroad-w.png',
    ONSITE_DELIVERY: 'assets/images/icons/icon-truck-waiting-w.png',
    6: 'assets/images/icons/icon-truck-waiting-w.png',
    DELIVERED: 'assets/images/icons/icon-check-w.png',
    7: 'assets/images/icons/icon-check-w.png',
    LEFT_DELIVERY: 'assets/images/icons/icon-truck-onroad-w.png',
    71: 'assets/images/icons/icon-truck-onroad-w.png',
    ONSITE_LOADING_STARTED: 'assets/images/icons/icon-truck-loading-w.png',
    ONSITE_DELIVERY_STARTED: 'assets/images/icons/icon-truck-unloading-w.png',
    NOT_LOADED: 'assets/images/icons/icon-close-w.png',
    RETURNED: 'assets/images/icons/icon-close-w.png',
}

export const STATUS_TEXTS = {
    ONSITE_LOADING_STARTED: { text: 'ORDERS_ONSITE_LOADING_STARTED', question: 'ORDERS_ONSITE_LOADING_STARTED_QUESTION' },
    ONSITE_DELIVERY_STARTED: { text: 'ORDERS_ONSITE_DELIVERY_STARTED', question: 'ORDERS_ONSITE_DELIVERY_STARTED_QUESTION' },
    NOT_LOADED: { text: 'NOT_LOADED', question: '' },
    RETURNED: { text: 'RETURNED', question: '' },
    LEFT_LOADING_SITE: { text: 'ORDERS_LEFT_LOADING', question: 'ORDERS_ONROAD_QUESTION' },
    LEFT_DELIVERY_SITE: { text: 'ORDERS_LEFT_DELIVERY', question: 'ORDERS_ONROAD_QUESTION' },
    0: { text: 'ORDERS_WAITING_CONFIRMATION_STATUS', question: 'ORDERS_CONFIRM_QUESTION' },
    1: { text: 'ORDERS_CONFIRMED_STATUS', question: 'ORDERS_ONROAD_QUESTION' },
    2: { text: 'ORDERS_ONROAD_LOADING_STATUS', question: 'ORDERS_ONSITE_QUESTION' },
    3: { text: 'ORDERS_ONSITE_LOADING_STATUS', question: 'ORDERS_LOADED_QUESTION' },
    4: { text: 'ORDERS_LOADED_STATUS', question: 'ORDERS_ONROAD_QUESTION' },
    41: { text: 'ORDERS_LEFT_LOADING', question: 'ORDERS_ONROAD_QUESTION' },
    5: { text: 'ORDERS_ONROAD_UNLOADING_STATUS', question: 'ORDERS_ONSITE_QUESTION' },
    6: { text: 'ORDERS_ONSITE_UNLOADING_STATUS', question: 'ORDERS_DELIVERED_QUESTION' },
    7: { text: 'ORDERS_DELIVERED_STATUS', question: '' },
    71: { text: 'ORDERS_LEFT_DELIVERY', question: 'ORDERS_ONROAD_QUESTION' },
}
export const NOTIFICATIONS = {
    CALL_OFF_NEW: { title: 'CALL_OFF_NEW', icon: 'notifications', main_action: 'COMING' },
    CALL_OFF_CANCELED: { title: 'CALL_OFF_CANCELED', icon: 'notifications-off', main_action: 'CLOSE' },
    NEW_MESSAGE: { title: 'NEW_MESSAGE', icon: 'chatboxes', main_action: 'OPEN_DISCUSSION' },
    ORDER_ASSIGNED: { title: 'ORDER_ASSIGNED', icon: 'checkmark-circle', main_action: 'CLOSE' },
    ORDER_DIVESTED: { title: 'ORDER_DIVESTED', icon: 'close-circle', main_action: 'CLOSE' },
    LOCATION_SERVICE_OFF: { title: 'LOCATION_SERVICE_OFF', icon: 'pin', main_action: 'ACTIVATE' }
}
