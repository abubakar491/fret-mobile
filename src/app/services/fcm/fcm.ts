import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FCM } from "@capacitor-community/fcm";
import { PushNotifications } from "@capacitor/push-notifications";
import * as moment from 'moment';


@Injectable()
export class FcmProvider {

  _isSubscribed: boolean = false;

  constructor(private platform: Platform, public http: HttpClient) {
    console.log('Hello FcmProvider Provider');
    moment.locale('fr');
    if (this.platform.is('capacitor')) {
      PushNotifications.requestPermissions();
      PushNotifications.register();
    }
  }

  async getToken(userID) {
    let token;
    console.log('getToken Called for : ', userID);
    if (this.platform.is('capacitor')) {
      token = await FCM.getToken();
    }

    console.log('token', token);

    if (this.platform.is('ios')) {

    }
  }

  subscribeToTopic(topic) {
    if (this.platform.is('capacitor')) {
      FCM.subscribeTo({ topic }).then((res: any) => {
        console.log('subscribeToTopic Result', res);
        if (res === 'OK') {
          this._isSubscribed = true;
        }
      });
    }
  }
  unsubscribeFromTopic(topic) {
    console.log('unsubscribeFromTopic', topic);

    if (this.platform.is('capacitor')) {
      FCM.unsubscribeFrom({ topic }).then((res: any) => {
        console.log('unsubscribeFromTopic Result', res);
      });
    }
  }

}