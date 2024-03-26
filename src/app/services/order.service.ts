import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { CallNumber } from 'capacitor-call-number';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { BaseApiService } from '../core/services/base-api.service';
import { DriverService } from '../core/services/driver.service';
import { Order, PostOrder } from '../models';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(
    private toastController: ToastController,
    private baseApiService: BaseApiService,
    private driverService: DriverService,
    public translateService: TranslateService
  ) {}

  /**
   * Get order by id.
   * @param id - The order id.
   * @returns `Order` Observable.
   */
  getOrderById(id: string): Observable<Order> {
    return this.baseApiService.get(environment.orders.get, { id });
  }

  updateStatus(
    orderId: string,
    status: number,
    applyToRoute = true,
    partialDelivery = false,
    order?: Order,
    order_items: any = ''
  ) {
    let currentStatus = status - 1;
    let external_otp = null;
    if (order) {
      currentStatus = order.status;
      external_otp = order.OTP || null;
    }

    const params = {
      orders_id: orderId,
      status: status,
      apply_to_route: applyToRoute,
      partial_delivery: partialDelivery,
      current_status: currentStatus,
      external_otp: external_otp,
      partial_loading: partialDelivery,
    };
    return this.baseApiService.post<PostOrder>(
      environment.orders.orderStatusUpdate,
      { order_items },
      params
    );
  }

  markAs(state, orders, returnReasonId = null) {
    return this.baseApiService.post(environment.orders.markAs, '', {
      user_id: this.driverService.getDriver().id,
      orders_id: orders,
      as: state,
      return_reason_id: returnReasonId,
    });
  }

  sendPOD(
    orderID,
    file,
    updateStatus = false,
    type = 'POD',
    relatedOrderIds = []
  ) {
    const related_orders_ids = relatedOrderIds.join(',');

    if (file && !updateStatus) {
      const body = JSON.stringify(file);

      // Build the query string
      const queryString = `?user_id=${encodeURIComponent(
        this.driverService.getDriver().id
      )}&mission_id=${encodeURIComponent(orderID)}&type=${encodeURIComponent(
        type
      )}&related_orders_ids=${encodeURIComponent(related_orders_ids)}`;
      // Build the full URL
      const url = `${environment.orders.sendPOD}${queryString}`;

      // Send the POST request
      return this.baseApiService.post(url, body).toPromise();
    }
  }

  makeCall(phoneNumber) {
    console.log('phoneNumber', phoneNumber);
    if (phoneNumber.length) {
      CallNumber.call({ number: phoneNumber, bypassAppChooser: false })
        .then(() => {})
        .catch((err) => this.showToaster(`Error launching dialer :${err}`));
    } else {
      this.showToaster(`Cannot make a call to : ${phoneNumber}`);
    }
  }

  async showToaster(message: string, duration = 5000) {
    const toast = await this.toastController.create({
      message,
      duration,
    });
    toast.present();
  }

  getTransferCheck(id: string): Observable<Order> {
    return this.baseApiService.get(
      environment.orders.transferCheck + '/' + id + '/check'
    );
  }

  transfer(payload) {
    return this.baseApiService
      .post(environment.orders.transfer, {
        ...payload,
        toDriver: this.driverService.getDriver().id,
      })
      .toPromise();
  }

  getStoredReturnReasons() {
    let returnReasons = JSON.parse(localStorage.getItem('return_reasons'));
    returnReasons.map((issue) => {
      issue['message'] = this.translateService.instant(issue.text);
      return issue;
    })
    console.log('returnReasons', returnReasons);
    return returnReasons;
  }

  getReturnReasons(orderId?: string) {
    const queryParams: any = {};
    if (orderId) {
      queryParams['order_id'] = orderId;
    }
    return this.baseApiService.get(`${environment.orders.returnReasons}`, queryParams);
  }
  
  storeReturnReasons(orderId?: string) {
    this.getReturnReasons(orderId)
      .pipe(take(1))
      .subscribe((res) => {
        localStorage.setItem('return_reasons', JSON.stringify(res));
      });
  }  
}
