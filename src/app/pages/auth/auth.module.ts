import { CommonModule } from '@angular/common';
// import { HttpClientModule } from "@angular/common/http";
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
// import { IonIntlTelInputModule } from 'ion-intl-tel-v2';
import { SharedModule } from '../../shared/shared.module';
import { LoginPage } from './login/login.page';
import { BarcodeScannerComponent } from 'app/components/barcode-scanner/barcode-scanner.component';

// import { IonicSelectableModule } from 'ionic-selectable';

const routes: Routes = [
  {
    path: 'login',
    component: BarcodeScannerComponent,
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
  ],
  declarations: [LoginPage],
})
export default class AuthModule {}
