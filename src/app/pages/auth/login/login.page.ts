import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { ActionSheetController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { take, finalize } from 'rxjs/operators';
import { analytics } from '../../../utils/events';

import { AuthService } from '../../../core/services/auth.service';
import { getDiffTime } from '../../../shared/shared.module';
import { environment } from '../../../../environments/environment';
import { DriverService } from '../../../core/services/driver.service';



@Component({
  selector: 'freterium-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  public loginForm: UntypedFormGroup;
  isPending: boolean;
  versionNumber: string;
  preferredCountries = [
    'ma',
    'ae',
    'us',
    'in',
    'jo',
    'ph'
  ];

  defaultCountryiso = 'us';

  constructor(
    private platform: Platform,
    private fb: UntypedFormBuilder,
    private router: Router,
    private toastController: ToastController,
    private translateService: TranslateService,
    private authService: AuthService,
    private appVersion: AppVersion,
    private driverService: DriverService,
    public actionSheetController: ActionSheetController,
  ) { }

  ngOnInit() {
    this.createLoginForm();
    this.getVersionNumber();
    if (window['defaultCountryiso']) {
      this.defaultCountryiso = window['defaultCountryiso'];
    }

    if (environment.environment !== 'production') {
      const diffTime = getDiffTime()
      if (diffTime) {
        this.presentToast(diffTime);
        console.log('diffTime', diffTime)
      }
    }

  }

  /**
   * Create the form.
   */
  createLoginForm(): void {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * Handle login.
   * Navigate to Home page if the authentication is successful,
   * else call `presentToast()` method.
   */
  login(): void {
    this.isPending = true;
    const form = {
      //   login: encodeURIComponent(this.loginForm.value.login.internationalNumber.replace(/[^\d,+]/g, '')),
      login: this.loginForm.value.login,
      password: this.loginForm.value.password
    }
    console.log('form', form);
    console.log('loginForm.value.login', this.loginForm.value.login);
    this.authService.login(form)
      .pipe(take(1), finalize(() => (this.isPending = false)))
      .subscribe(
        () => this.router.navigate(['/orders']),
        () => this.presentToast(this.translateService.instant('mobile.login.errorMessage'))
      );
  }

  /**
   * Show an error toast.
   */
  async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      position: 'top',
      duration: 1000
    });

    toast.present();
  }

  forgotPassword() {
    analytics.track('AppUserPasswordForgot');
  }

  async getVersionNumber() {
    if (!this.platform.is('capacitor')) {
      console.log('NOT CAPACITOR');
      this.versionNumber = environment.environment
      return;
    }
    this.versionNumber = await this.appVersion.getVersionNumber();

    if (environment.environment !== 'production') {
      this.versionNumber = environment.environment + '-' + this.versionNumber;
    }
  }

  async changeLanguge() {

    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: 'English',
          handler: () => {
            this.driverService.changeLanguge('en');
          }
        },
        {
          text: 'Français',
          handler: () => {
            this.driverService.changeLanguge('fr');
          }
        },
        {
          text: 'Indonesia',
          handler: () => {
            this.driverService.changeLanguge('id');
          }
        },
        {
          text: 'عربي',
          handler: () => {
            this.driverService.changeLanguge('ar');
          }
        },
        {
          text: 'اردو',
          handler: () => {
            this.driverService.changeLanguge('ur_PK');
          }
        },
      ]
    });
    await actionSheet.present();
  }
}
