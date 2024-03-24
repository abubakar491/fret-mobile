import { Component, Input, ViewChild } from '@angular/core';
import { ModalController, NavParams, PopoverController, ToastController } from '@ionic/angular';

import * as moment from 'moment';
import { take } from 'rxjs/operators';
import { DiscussionsService } from '../../services/discussions.service';
import { analytics } from '../../utils/events';
import { ReportProblemComponent } from '../report-problem/report-problem.component';

import { Driver } from './../../core/models';
import { ChatMessage, MessageType, Order } from './../../models';
import { MediaService } from './../../services/media.service';
import { Components } from '@ionic/core';

import { OrderScannerComponent } from '../order-scanner/order-scanner.component';
import {
  BarcodeScanner,
} from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'freterium-confirm-loading',
  templateUrl: './confirm-loading.component.html',
  styleUrls: ['./confirm-loading.component.scss'],
})
export class ConfirmLoadingComponent {
  isScannerActive = false;
  scannedItems: any[] = [];
  @Input() modal: Components.IonModal;
  order: Order;
  driver: Driver;
  type: string;
  relatedOrderIds = [];
  PODs = [];
  loading: any;
  showConfirmSendPOD = false;
  productLineItems = [];
  showOrderItems = false;

  // productLineItems = [
  //   {
  //     name: 'abc0',
  //     totalQuantity: 1100,
  //     quantity: 0
  //   },
  //   {
  //     name: 'abc1',
  //     totalQuantity: 1100,
  //     quantity: 0
  //   },
  //   {
  //     name: 'abc2',
  //     totalQuantity: 1100,
  //     quantity: 0
  //   },
  // ]

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private mediaService: MediaService,
    private discussionsService: DiscussionsService,
    private modalController: ModalController,
    private toastController: ToastController,
  ) {}

  ionViewWillEnter() {
    this.order = this.navParams.get('order');
    this.type = this.navParams.get('type');
    this.driver = this.navParams.get('driver');
    this.relatedOrderIds = this.navParams.get('relatedOrderIds');
    this.showOrderItems = this.navParams.get('showOrderItems');

    if ((this.type === 'POD' || this.type === 'POL') && this.order.orderItems) {
      this.productLineItems = this.order.orderItems;
      this.productLineItems.forEach((productLineItem) => {
        productLineItem.selectedQuantity = this.type === 'POD' ?  productLineItem.loadedCount : productLineItem.quantity;
        productLineItem.expectedQuantity = this.type === 'POD' ?  productLineItem.loadedCount : productLineItem.quantity;
        productLineItem.checked = this.type === 'POD' ? (!productLineItem.loadedCount ? false : true) : true;
        productLineItem.indeterminate = false;
      });
    }
  }

  /**
   * @todo Handle photo.
   */
  takePicture(type?) {
    if (type === 'POL') {
      analytics.track('AppOrderPOL');
    } else if (type === 'POD') {
      analytics.track('AppOrderPOD');
    }
    this.mediaService.takePicture().then((res) => {
      if (res) {
        this.PODs.push(`data:image/jpeg;base64,${res.base64String}`);
      }
    });
  }

  async checkBarcodeScannerSupported() {
    if(!BarcodeScanner.isSupported()) {
      const toast = await this.toastController.create({
        message: 'Barcode Scanner is not supported on this device',
        duration: 2000
      });
      toast.present();
      return false;
    }
  }
  async openScanner() {
    const modal = await this.modalController.create({
      component: OrderScannerComponent,
      // cssClass: 'barcode-scanning-modal',
      // showBackdrop: false,
      // You can pass data to the modal if needed:
      componentProps: {
        'productLineItem': this.productLineItems
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      // Handle the data returned from the scanner modal
      this.handleOrderComplete(data.scannedItems);
    }
  }

  handleOrderComplete(scannedItems: any[]) {
    console.log('Completed Order with Items:', scannedItems);
    debugger;
    this.scannedItems = scannedItems;
    this.isScannerActive = false;
  }

  removePicture(index) {
    console.log('index', index);

    this.PODs.splice(index, 1);
  }

  /**
   * @todo Handle send.
   */
  sendPOD(files, changeStatus = false, partial_delivery = false) {
    if (files.length) {
      let tasks: any = localStorage.getItem('bg_tasks');
      const pod_task = {
        type: this.type,
        order_id: this.order.id,
        data: files,
        relatedOrderIds: this.relatedOrderIds,
      };
      if (tasks) {
        tasks = JSON.parse(tasks);
        tasks = Array.isArray(tasks) ? tasks : [];
      } else {
        tasks = [];
      }
      tasks.push(pod_task);
      localStorage.setItem('bg_tasks', JSON.stringify(tasks));
      if (changeStatus) {
        this.goBack(changeStatus, partial_delivery);
      }
    } else if (changeStatus) {
      this.goBack(changeStatus, partial_delivery);
    }
  }

  goBack(flag, partialDelivery = false) {
    const data = {
      changeStatus: flag,
      partial_delivery: partialDelivery,
      productLineItems: this.productLineItems,
    };
    this.modalCtrl.dismiss(data, 'confirm');
  }

  sendPODandChangeStatus(partialDelivery = false, type?) {
    if (type === 'POL') {
      analytics.track('AppOrderLoadingConfirmed');
    } else if (type === 'POD') {
      analytics.track('AppOrderDeliveryConfirmed');
    }

    if (this.PODs.length) {
      this.sendPOD(this.PODs, true, partialDelivery);
    } else {
      this.goBack(true, partialDelivery);
    }
  }

  sendPODandChangeStatusAll(partialDelivery = false, type?) {
    if (this.PODs.length) {
      this.sendPOD(this.PODs, true, partialDelivery);
    } else {
      this.goBack(true, partialDelivery);
    }
  }

  async sendPODandChangeStatusPartial(partialDelivery = false, type?) {
    analytics.track('AppOrderDeliveredPartially');

    const popover = await this.modalCtrl.create({
      cssClass: 'report-problem-container',
      component: ReportProblemComponent,
      componentProps: { order: this.order },
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();

    if (data?.problem) {
      this.showConfirmSendPOD = true;
    } else {
      return;
    }

    const issue = this.makeMsg(MessageType.ISSUE, {
      user_id: this.driver.id,
      user_fullname: this.driver.firstname + ' ' + this.driver.lastname,
      avatar: this.driver.firstname[0] + this.driver.lastname[0],
      order_id: data.orderId,
      content: JSON.stringify(data.problem),
      status: 'pending',
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      user_role: this.driver.role,
      user_client: this.driver.client.id,
    });

    this.discussionsService.sendMsg(issue, null).pipe(take(1)).subscribe();
  }

  confirmSendPODandChangeStatusPartial(partialDelivery = false, type?) {
    analytics.track('AppOrderDeliveredPartially');

    if (this.PODs.length) {
      this.sendPOD(this.PODs, true, partialDelivery);
    } else {
      this.goBack(true, partialDelivery);
    }
  }

  makeMsg(type: `${MessageType}` = 'M', payload: any): ChatMessage {
    const id = Date.now().toString();
    const msg: ChatMessage = {
      id: id,
      userId:
        typeof payload.user_id !== 'undefined'
          ? payload.user_id
          : this.driver.id,
      userName:
        typeof payload.user_fullname !== 'undefined'
          ? payload.user_fullname
          : this.driver.firstname + ' ' + this.driver.lastname,
      userAvatar:
        typeof payload.avatar !== 'undefined'
          ? payload.avatar
          : this.driver.firstname[0] + this.driver.lastname[0],
      orderId:
        typeof payload.order_id !== 'undefined'
          ? payload.order_id
          : this.order.id,
      message: typeof payload.content !== 'undefined' ? payload.content : '',
      status:
        typeof payload.status !== 'undefined' ? payload.status : 'pending',
      type: type,
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      profile:
        typeof payload.user_role !== 'undefined'
          ? payload.user_role
          : this.driver.role,
      company:
        typeof payload.user_client !== 'undefined'
          ? payload.user_client
          : this.driver.client.id,
      file: '',
    };

    return msg;
  }

  close() {
    this.modal.dismiss(false);
  }

  updateQuantity(index, delta) {
    this.productLineItems[index].selectedQuantity += delta;
    this.formatQuantity(index);
  }

  formatQuantity(index) {
    this.productLineItems[index].selectedQuantity = parseFloat(this.productLineItems[index].selectedQuantity.toFixed(2));

    if (this.productLineItems[index].selectedQuantity <= 0) {
      this.productLineItems[index].selectedQuantity = 0;
      this.productLineItems[index].checked = false;
      this.productLineItems[index].indeterminate = false;
    } else if (
      this.productLineItems[index].selectedQuantity >=
      this.productLineItems[index].quantity
    ) {
      this.productLineItems[index].selectedQuantity =
        this.productLineItems[index].quantity;
      this.productLineItems[index].checked = true;
      this.productLineItems[index].indeterminate = false;
    } else {
      this.productLineItems[index].checked = true;
      this.productLineItems[index].indeterminate = true;
    }
  }

  toggleDelivered(index) {
    this.productLineItems[index].indeterminate = false;
    if (!this.productLineItems[index].checked) {
      this.productLineItems[index].selectedQuantity =
        this.productLineItems[index].expectedQuantity;
    } else {
      this.productLineItems[index].selectedQuantity = 0;
    }
  }
}
