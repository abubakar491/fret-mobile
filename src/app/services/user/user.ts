
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

import { Platform } from '@ionic/angular';
import { ApiProvider } from '../api/api';
import { SettingsProvider } from '../settings/settings';

@Injectable()
export class UserProvider {
  _user: any;

  constructor(private platform: Platform, private api: ApiProvider, public settings: SettingsProvider) { }

  /**
   * Send a POST request to our login endpoint with the data
   * the user entered on the form.
   */
  login(accountInfo: any) {
    console.log(environment.user.auth, accountInfo);
    let seq = this.api.get(environment.user.auth, accountInfo).pipe(share());

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      console.log('res', res);
      if (res.id !== 'undefined' && res.id) {
        res['companyId'] = accountInfo.companyId ? accountInfo.companyId : '';
        this.settings.setValue('user', res);
        this._user = res;

        if (accountInfo.companyId) {
          this.settings.setValue('companyId', accountInfo.companyId);
          console.log("companyId", accountInfo.companyId);
        }
        this._loggedIn(res);
        // this.appCenter.trackEvent('Driver Login', {ID: res.id, NAME: res.firstname + ' ' + res.lastname});
      } else {
      }
    }, err => {
      console.error('ERROR', err);
      // this.appCenter.trackEvent('Driver Login Error', {LOGIN: accountInfo.login});
    });

    return seq;
  }

  /**
   * Send a POST request to our signup endpoint with the data
   * the user entered on the form.
   */

  refreshAccessToken(): any {

    if (this.isLoggedIn()) {
      console.log("Getting Refresh Data", this.getData());


      return new Observable((token) => {

        this.getData().then((data: any) => {
          if (data) {
            this._user = data;

            const refresh_token: string = JSON.parse(this._user.token).refresh_token;
            console.log("refresh_token", refresh_token);
            console.log("_user", this._user);

            this.api.get(environment.user.refreshToken, { refresh_token: refresh_token }).subscribe((newToken: any) => {

              this._user.token = JSON.stringify(newToken.token);
              this.settings.setValue('user', this._user);;
              this._user['companyId'] = data.companyId ? data.companyId : '';
              token.next(newToken);
              console.log("token", token);
            }, () => token.error());
          }
        }).catch((err: any) => {
          console.log('Error User is not LoggedIn', err);
        });


      });
    }
  }

  signup(accountInfo: any) {
    let seq = this.api.post('signup', accountInfo).pipe(share());

    seq.subscribe((res: any) => {
      // If the API returned a successful response, mark the user as logged in
      if (res.status == 'success') {
        this._loggedIn(res);
      }
    }, err => {
      console.error('ERROR', err);
    });

    return seq;
  }

  /**
   * Log the user out, which forgets the session
   */
  logout() {
    this._user = null;
    this.settings.setValue('user', null);
  }

  /**
   * Process a login/signup response to store user data
   */
  _loggedIn(resp) {
    this._user = resp;
    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        // Get a FCM token
        // this.fcm.getToken(this._user.id);
        // this.fcm.subscribeToTopic(this._user.id);
        //console.log('topic',this._user.id);
      }
    });
  }

  isLoggedIn() {
    return this.settings.getValue('user');
  }

  getData() {
    return this.settings.getValue('user');
  }
}
