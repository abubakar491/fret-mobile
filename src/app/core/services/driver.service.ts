import { Injectable } from "@angular/core";
import { Preferences } from "@capacitor/preferences";
import { TranslateService } from "@ngx-translate/core";
import { from } from "rxjs";
import { take } from "rxjs/operators";

import { AuthConstants } from "../constants";
import { Driver } from "../models";

@Injectable({ providedIn: 'root' })
export class DriverService {
  driver: Driver;

  constructor(private translateService: TranslateService) {
    from(Preferences.get({ key: AuthConstants.USER_KEY }))
      .pipe(take(1))
      .subscribe(rawDriver => (this.setDriver(JSON.parse(rawDriver.value))));
  }

  /**
   * Set current driver to `this.driver`.
   * @param driver - Current driver.
   */
  setDriver(driver: Driver) {
    this.driver = driver;
  }

  /**
   * Get current driver.
   */
  getDriver() {
    return this.driver;
  }

  changeLanguge(lang) {
    this.translateService.use(lang);
    Preferences.set({ key: AuthConstants.LANG_KEY, value: lang });
  }

  setCurrentLanguge() {
    Preferences.get({ key: AuthConstants.LANG_KEY }).then((val) => {
      this.translateService.use(val.value);
    })
  }

  async getCurrentLanguge() {
    return await Preferences.get({ key: AuthConstants.LANG_KEY })
  }
}
