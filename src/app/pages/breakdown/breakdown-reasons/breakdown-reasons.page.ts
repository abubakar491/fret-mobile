import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal, LoadingController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { BaseApiService } from '../../../core/services/base-api.service';
import { DriverService } from '../../../core/services/driver.service';
import { CacheProvider } from '../../../services/cache/cache';

@Component({
  selector: 'freterium-breakdown-reasons',
  templateUrl: './breakdown-reasons.page.html',
  styleUrls: ['./breakdown-reasons.page.scss'],
})
export class BreakdownReasonsPage implements OnInit {

  vehicles: any[] = [];

  breakdownReasons = [];

  currentSection: 'selectVehicle' | 'selectBreakdownReason' = 'selectVehicle';

  isConfirmationModalOpen = false;

  breakdownData = { vehicle: undefined, breakdown: '', description: '' };

  loading: HTMLIonLoadingElement;

  loadingVehicles = false;

  constructor(private router: Router,
    private baseApiService: BaseApiService,
    private driverService: DriverService,
    private toastController: ToastController,
    private loadingCtrl: LoadingController,
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.currentSection = 'selectVehicle';
    this.breakdownData = { vehicle: undefined, breakdown: '', description: '' };
    this.getDriverVehicles();
    this.getBreakdownreasons();
  }

  close() {
    this.router.navigate(['/orders']);
  }

  backToVehicleSection() {
    this.currentSection = 'selectVehicle';
    this.breakdownData.breakdown = '';
    this.breakdownData.description = '';
  }

  closeModal(modal: IonModal) {
    modal.dismiss();
  }

  async getDriverVehicles() {
    if(this.vehicles?.length === 0) {
      this.loadingVehicles = true;
      this.loading = await this.loadingCtrl.create({
        message: this.translate.instant('mobile.breakdowns.loading_vehicles')
      });
      this.loading.present();
    }
    this.baseApiService.get('/vehicles', { paginate: 0, 'mobile_app_driver_ids': this.driverService.getDriver()?.id }).pipe(take(1))
      .subscribe((res: any[]) => {
        this.vehicles = res.map(v => v['0']).filter(v => v.enabled);
        this.loading.dismiss();
        this.loadingVehicles = false;
      }, (err: HttpErrorResponse) => {
        console.error(err.error)
        this.loading.dismiss();
        this.loadingVehicles = false;
      });
  }

  async getBreakdownreasons() {
    this.baseApiService.get('/breakdown-reasons', { paginate: 0 }).pipe(take(1))
    .subscribe((res: any[]) => {
      this.breakdownReasons = res;
    }, (err: HttpErrorResponse) => {
      console.error(err.error);
    });
  }

  async submit(confirmationModal: IonModal) {
    this.loading = await this.loadingCtrl.create();
    this.loading.present();

    this.baseApiService.patch(`/vehicles/${this.breakdownData.vehicle}/disable`, {
      breakdown: this.breakdownData.breakdown,
      description: this.breakdownData.description
     }).pipe(take(1))
      .subscribe(async (res: any) => {
        const toast = await this.toastController.create({
          message: this.translate.instant('mobile.breakdowns.saved_successfully'),
          duration: 1500,
          position: 'top',
          color: 'success',
          icon: ''
        });
        await toast.present();
        confirmationModal.dismiss();
        this.loading.dismiss();
        this.close();
      }, async (err: HttpErrorResponse) => {
        const toast = await this.toastController.create({
          message: `Error: ${err.error ? err.error : ''}`,
          duration: 1500,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
        this.loading.dismiss();
      });
  }
}
