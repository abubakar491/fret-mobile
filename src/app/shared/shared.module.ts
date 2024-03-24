import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { FileTransfer } from '@awesome-cordova-plugins/file-transfer/ngx';
import { Media } from '@awesome-cordova-plugins/media/ngx';
import { FcmProvider } from '../services/fcm/fcm';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import BackgroundGeolocation from '@transistorsoft/capacitor-background-geolocation';
import { ApiProvider } from '../services/api/api';
import { LocationTrackerProvider } from '../services/location-tracker/location-tracker';
import { CacheProvider } from '../services/cache/cache';
import { OrdersProvider } from '../services/orders/orders';
import { SettingsProvider } from '../services/settings/settings';
import { UserProvider } from '../services/user/user';




//Sentry
import * as Sentry from "@sentry/capacitor";
import * as SentryAngular from "@sentry/angular-ivy";

// Environment
import { environment } from '../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function getDiffTime() {
  const endDate = new Date();
  if (window["startDate"]) {
    const startDate = window["startDate"];
    window["startDate"] = null;
    return (endDate.getTime() - startDate.getTime()) / 1000 + 's';
  } else {
    return false;
  }
}

Sentry.init(
  {
    dsn: environment.sentry_dsn,
    environment: environment.sentry_environment,
    tracesSampleRate: 1.0,
    integrations: function (integrations) {
      return integrations.filter(function (integration) {
        if (!environment.production) {
          return integration.name !== "Breadcrumbs"
        }
      })
    }
  },
  SentryAngular.init
);


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    TranslateModule,
  ],
  providers: [
    FcmProvider,
    Media,
    File,
    FileTransfer,
    LocationTrackerProvider,
    BackgroundGeolocation,
    ApiProvider,
    AppVersion,
    CacheProvider,
    SettingsProvider,
    UserProvider,
    OrdersProvider,
    { provide: ErrorHandler, useValue: SentryAngular.createErrorHandler() }
  ]
})
export class SharedModule { }
