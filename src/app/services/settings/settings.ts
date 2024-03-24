import { Injectable } from '@angular/core';
import { Preferences } from "@capacitor/preferences";

/**
 * A simple settings/config class for storing key/value pairs with persistence.
 */
@Injectable()
export class SettingsProvider {
  private SETTINGS_KEY: string = '_settings';

  settings: any = {};

  _defaults: any = {};
  _readyPromise: Promise<any>;

  constructor() {
    // if (defaults) {
    //   this._defaults = defaults;
    // }
  }

  load() {
    return Preferences.get({key : this.SETTINGS_KEY}).then((value) => {
      if (value) {
        this.settings = value;
        return this._mergeDefaults(this._defaults);
      } else {
        return this.setAll(this._defaults).then((val) => {
          this.settings = val;
        })
      }
    });
  }

  _mergeDefaults(defaults: any) {
    for (let k in defaults) {
      if (!(k in this.settings)) {
        this.settings[k] = defaults[k];
      }
    }
    return this.setAll(this.settings);
  }

  merge(settings: any) {
    for (let k in settings) {
      this.settings[k] = settings[k];
    }
    return this.save();
  }

  setValue(key: string, value: any) {
    this.settings[key] = value;
    return Preferences.set({key : this.SETTINGS_KEY, value : this.settings});
  }

  setAll(value: any) {
    return Preferences.set({key : this.SETTINGS_KEY, value: value});
  }

  getValue(key: string) {
    return Preferences.get({key : this.SETTINGS_KEY})
      .then(settings => {
        if (settings) {
          console.log('settings', settings)
          return settings[key];
        } else {
          return null;
        }
      });
  }

  removeValue(key: string) {
    delete this.settings[key];
    this.setAll(this.settings);
  }

  save() {
    return this.setAll(this.settings);
  }

  get allSettings() {
    return this.settings;
  }
}
