import { OrderStatusReference } from "../models";

export class OrderConstants {
  static readonly STATUSES_REFERENCES = new Map<string | number, OrderStatusReference>([
    ['WAITING', { icon: 'assets/images/icons/icon-waiting-w.png' }],
    [0, {
      icon: 'assets/images/icons/icon-waiting-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_WAITING_CONFIRMATION_STATUS'
    }],
    ['CONFIRMED', { icon: 'assets/images/icons/icon-check-w.png' }],
    [1, {
      icon: 'assets/images/icons/icon-check-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_CONFIRMED_STATUS'
    }],
    ['ONWAY_LOADING', {
      icon: 'assets/images/icons/icon-truck-onroad-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_ONROAD_LOADING_STATUS'
    }],
    [2, {
      icon: 'assets/images/icons/icon-truck-onroad-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_ONROAD_LOADING_STATUS'
    }],
    ['ONSITE_LOADING', {
      icon: 'assets/images/icons/icon-truck-waiting-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_ONSITE_LOADING_STATUS',
      nextStatus: 'ONSITE_LOADING_STARTED'
    }],
    [3, {
      icon: 'assets/images/icons/icon-truck-waiting-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_ONSITE_LOADING_STATUS'
    }],
    ['LOADED', { icon: 'assets/images/icons/icon-truck-check-w.png' }],
    [4, {
      icon: 'assets/images/icons/icon-truck-check-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_LOADED_STATUS'
    }],
    ['LEFT_LOADING', { icon: 'assets/images/icons/icon-truck-onroad-w.png' }],
    [41, {
      icon: 'assets/images/icons/icon-truck-onroad-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_LEFT_LOADING'
    }],
    ['ONWAY_DELIVERY', { icon: 'assets/images/icons/icon-truck-onroad-w.png' }],
    [5, {
      icon: 'assets/images/icons/icon-truck-onroad-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_ONROAD_UNLOADING_STATUS'
    }],
    ['ONSITE_DELIVERY', {
      icon: 'assets/images/icons/icon-truck-waiting-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_ONSITE_UNLOADING_STATUS',
      nextStatus: 'ONSITE_DELIVERY_STARTED'
    }],
    [6, {
      icon: 'assets/images/icons/icon-truck-waiting-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_ONSITE_UNLOADING_STATUS'
    }],
    ['DELIVERED', { icon: 'assets/images/icons/icon-check-w.png' }],
    [7, {
      icon: 'assets/images/icons/icon-check-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_DELIVERED_STATUS'
    }],
    ['LEFT_DELIVERY', { icon: 'assets/images/icons/icon-truck-onroad-w.png' }],
    [71, {
      icon: 'assets/images/icons/icon-truck-onroad-w.png',
      text: 'mobile.editOrder.statusLabel.ORDERS_LEFT_DELIVERY'
    }],
    ['ONSITE_LOADING_STARTED', {
      text: 'mobile.editOrder.statusLabel.ORDERS_ONSITE_LOADING_STARTED',
      icon: 'assets/images/icons/icon-truck-loading-w.png'
    }],
    ['ONSITE_DELIVERY_STARTED', {
      text: 'mobile.editOrder.statusLabel.ORDERS_ONSITE_DELIVERY_STARTED',
      icon: 'assets/images/icons/icon-truck-unloading-w.png'
    }],
    ['NOT_LOADED', {
      text: 'mobile.editOrder.statusLabel.NOT_LOADED',
      icon: 'assets/images/icons/icon-close-w.png'
    }],
    ['RETURNED', {
      text: 'mobile.editOrder.statusLabel.RETURNED',
      icon: 'assets/images/icons/icon-close-w.png'
    }],
    ['LEFT_LOADING_SITE', { text: 'mobile.editOrder.statusLabel.ORDERS_LEFT_LOADING' }],
    ['LEFT_DELIVERY_SITE', { text: 'mobile.editOrder.statusLabel.ORDERS_LEFT_DELIVERY' }]
  ]);
}
