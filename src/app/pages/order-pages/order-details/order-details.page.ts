import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { STATUS, STATUS_ICONS } from '../../../constants/global.constant';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'freterium-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss']
})
export class OrderDetailsPage {
  currentLang = 'fr';
  order: any;
  STATUS: any;
  STATUS_ICONS: any;

  constructor(
    private modalController: ModalController,
    private translateService: TranslateService,
    private orderService: OrderService,
    private navParams: NavParams
  ) {
    this.STATUS = STATUS;
    this.STATUS_ICONS = STATUS_ICONS;
  }

  ionViewWillEnter() {
    this.currentLang = this.translateService.getDefaultLang();
    this.order = this.navParams.get('order');
  }

  makeCall(phoneNumber) {
    this.orderService.makeCall(phoneNumber);
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
