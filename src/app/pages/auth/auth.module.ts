import { CommonModule } from '@angular/common';
// import { HttpClientModule } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
// import { IonIntlTelInputModule } from 'ion-intl-tel-v2';
import { SharedModule } from '../../shared/shared.module';
import { LoginPage } from './login/login.page';
// import { IonicSelectableModule } from 'ionic-selectable';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';

const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    // HttpClientModule,
    SharedModule,
    // IonicSelectableModule,
    // IonIntlTelInputModule,
    NgxIntlTelInputModule
  ],
  declarations: [LoginPage],
})
export default class AuthModule {}
