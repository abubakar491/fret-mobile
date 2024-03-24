import { Component, Input } from '@angular/core';
import { NavParams, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { Components } from '@ionic/core';



import { BaseApiService } from './../../core/services/base-api.service';
import { Driver } from './../../core/models';
import { Order } from './../../models';
import { environment } from '../../../environments/environment';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'freterium-order-payments',
  templateUrl: './order-payments.component.html',
  styleUrls: ['./order-payments.component.scss']
})
export class OrderPaymentsComponent {

  @Input() modal: Components.IonModal;
  driver: Driver;
  order: Order;
  payment_method: string;
  amount: number;
  check_ref: string;
  comment: string;
  file: string;
  paymentMethods = 'paymentMethods';
  loading = false;

  constructor(
    private baseApiService: BaseApiService,
    public navParams: NavParams,
    private toastController: ToastController,
    public translateService: TranslateService,
    private mediaService: MediaService,
  ) { }

  ionViewWillEnter() {
    this.order = this.navParams.get('order');
    this.payment_method = this.order.payment_mode || '-';
    this.amount = this.order.units_value || 0;
  }

  postPayment() {
    this.loading = true;
    const payment = {
      paymentMode: this.payment_method,
      reference: this.check_ref,
      comment: this.comment,
      amount: this.amount,
      orders: this.order.id,
      piece: this.file
    };

    this.baseApiService.post(environment.orders.cargoPayment, payment).pipe(take(1)).subscribe(() => {
      this.loading = false;
      this.close(true);
      this.showToaster(this.translateService.instant('mobile.orderPayments.paymentSubmittedWithSuccess'))
    }, (err: any) => {
      this.loading = false;
      let msg = 'error'
      if (err.message) {
        msg = err.message;
      }
      this.showToaster(msg)
    });
  }

  close(isDone = false) {
    this.modal.dismiss(isDone);
  }

  async showToaster(msg, duration = 5000, position = "bottom") {
    const toast = await this.toastController.create({
      message: msg,
      duration: duration,
      position: position as any
    });

    toast.present();
  }

  takePicture() {
    this.mediaService.takePicture().then(res => {
      if (res) {
        this.file = `data:image/jpeg;base64,${res.base64String}`;
      }
    });
  }
}
