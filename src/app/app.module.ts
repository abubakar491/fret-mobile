import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';


import { registerLocaleData } from '@angular/common';

import localeAr from '@angular/common/locales/ar';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import localeUr from '@angular/common/locales/ur';
import { Preferences } from "@capacitor/preferences";


import AuthModule from './pages/auth/auth.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { createTranslateLoader } from './shared/shared.module';

import { provideAnimations } from '@angular/platform-browser/animations';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    IonicModule.forRoot(),
    BrowserModule,
    CoreModule,
    AuthModule,
    AppRoutingModule,
  ],
  exports: [],
  providers: [
    // { provide: LOCALE_ID, useValue: 'fr' },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideAnimations(),
    importProvidersFrom(HttpClientModule), // or provideHttpClient() in Angular v15
    importProvidersFrom(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }))
  ],
  bootstrap: [AppComponent]

})
export class AppModule {

  constructor(private translateService: TranslateService) {
    Preferences.get({ key: 'lang' }).then((val) => {
      this.translateService.setDefaultLang('en');
      if (val.value) {
        this.translateService.use(val.value);
      } else if (['ar', 'fr', 'en', 'id', 'ur_PK'].indexOf(this.translateService.getBrowserLang()) >= 0) {
        this.translateService.use(this.translateService.getBrowserLang());
      } else {
        this.translateService.use(this.translateService.getDefaultLang());
      }
    });
    [localeAr, localeEn, localeFr, localeUr].forEach(locale => registerLocaleData(locale));
  }
}
