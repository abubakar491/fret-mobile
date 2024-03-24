import { Injectable } from '@angular/core';
import { Preferences } from "@capacitor/preferences";
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { BaseApiService } from './base-api.service';
import { DriverService } from './driver.service';
import { AuthConstants } from '../constants';
import { Credential, Driver } from '../models';
import { analytics } from '../../utils/events';
import { FcmProvider } from '../../services/fcm/fcm';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private baseApiService: BaseApiService, private driverService: DriverService, private fcm: FcmProvider) { }

  /**
   * Handle login.
   * Return the `Driver` object if the authentication is successful,
   * else throw error.
   * @param credential - The driver credential.
   * @returns `Driver` observable.
   */
  login(credential: Credential): Observable<Driver> {
    return this.baseApiService.get<Driver>(environment.user.auth, credential).pipe(
      tap(driver => {
        if (driver?.token) {
          from(Preferences.set({ key: AuthConstants.TOKEN_KEY, value: this.fmtTokenPayload(driver.token) }));
          from(Preferences.set({ key: AuthConstants.USER_KEY, value: JSON.stringify(driver) }));
          this.driverService.setDriver(driver);
          this.fcm.subscribeToTopic(driver.id);
          analytics.track('AppUserLogInSuccesful', driver);
        } else {
          analytics.track('AppUserLogInUnsuccessful')
          throw new Error();
        }
      })
    );
  }

  logout() {
    Preferences.get({ key: 'lang' }).then((val) => {
      Preferences.clear();
      Preferences.set({ key: AuthConstants.LANG_KEY, value: val.value });
    });
  }

  /**
   * Returns true if a token is stored, else false.
   * @returns Boolean observable.
   */
  isAuthentificated(): Observable<boolean> {
    return this.getToken().pipe(map(token => !!token));
  }

  /**
   * Returns true if a token is stored, else false.
   * @returns Boolean observable.
   */
  getToken(): Observable<string> {
    return from(Preferences.get({ key: AuthConstants.TOKEN_KEY })).pipe(map(result => result.value));
  }

  /**
   * Format and get the token.
   * @returns The correct token.
   */
  fmtTokenPayload(token: string): string {
    return JSON.parse(token).access_token;
  }
}
