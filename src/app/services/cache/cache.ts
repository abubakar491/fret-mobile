import { Injectable } from '@angular/core';
import { Preferences } from "@capacitor/preferences";


/**
 * A simple settings/config class for storing key/value pairs with persistence.
 */
@Injectable()
export class CacheProvider {
  private CACHE_KEY: string = '_cache';

  cache: any = {};

  _defaults: any = {};
  _readyPromise: Promise<any>;

  constructor() {
    // if (defaults) {
    //   this._defaults = defaults;
    // }
  }

  load() {
    return Preferences.get({key: this.CACHE_KEY}).then((value) => {
      if (value) {
        this.cache = value;
        return this._mergeDefaults(this._defaults);
      } else {
        return this.setAll(this._defaults).then((val) => {
          this.cache = val;
        })
      }
    });
  }

  _mergeDefaults(defaults: any) {
    for (let k in defaults) {
      if (!(k in this.cache)) {
        this.cache[k] = defaults[k];
      }
    }
    return this.setAll(this.cache);
  }

  merge(cache: any) {
    for (let k in cache) {
      this.cache[k] = cache[k];
    }
    return this.save();
  }

  setValue(key: string, value: any) {
    this.cache[key] = value;
    return Preferences.set({key: this.CACHE_KEY, value: this.cache});
  }

  setAll(value: any) {
    return Preferences.set({key: this.CACHE_KEY, value: value});
  }

  getValue(key: string) {
    return Preferences.get({key: this.CACHE_KEY})
      .then(cache => {
        return cache[key];
      });
  }

  removeValue(key: string) {
    delete this.cache[key];
    this.setAll(this.cache);
  }

  save() {
    return this.setAll(this.cache);
  }

  get allCache() {
    return this.cache;
  }

  public store(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  public clear(key) {
    localStorage.removeItem(key);
  }
}
