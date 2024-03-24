
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../../environments/environment';
import { STATUS, STATUS_ICONS } from '../../constants/global.constant'
import { BehaviorSubject } from 'rxjs';
import { ApiProvider } from '../api/api';
import { UserProvider } from '../user/user';
import { ToastController } from '@ionic/angular';

import { CallNumber } from 'capacitor-call-number';

@Injectable()
export class OrdersProvider {
  _user: any;
  bg_tasks: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  tasksTimer: any = null;

  constructor(private api: ApiProvider, private user: UserProvider, public translateService: TranslateService, public toastCtrl: ToastController) {
    this.user.isLoggedIn().then((data: any) => {
      if (data) {
        this._user = data;
      } else {
        this._user = { id: 0 };
      }
      // this.handleTasks();
      // this.bg_tasks.subscribe((tasks: any) => {
      //   console.log('Tasks have changed', tasks);
      //   this.executeTasks(tasks);
      // })
    }).catch((err: any) => {
      console.log('Error while getting User Data in Orders Provider', err);
    });
  }

  getUserData() {
    if (this._user && this._user.id === 0) {
      this.user.isLoggedIn().then((data: any) => {
        if (data) {
          this._user = data;
        } else {
          this._user = { id: 0 };
        }
      }).catch((err: any) => {
        console.log('Error while getting User Data in Orders Provider', err);
      });
    }
  }

  getOrders() {
    return this.api.get(environment.orders.ordersList);
  }
  getOrder(id, user_id = 0) {
    if (user_id === 0) {
      user_id = this._user.id
    }
    return this.api.get(environment.orders.loadOrder, { id: id });
  }

  updateStatus(order_id, status, apply_to_route = true, partial_delivery = false, user_id = 0, order?) {
    if (!user_id) {
      this.getUserData();
    } else {
      this._user.id = user_id;
    }
    let currentStatus = status - 1;
    if (order) {
      currentStatus = order.status;
    }
    const payload = { orders_id: order_id, status: status, apply_to_route: apply_to_route, partial_delivery: partial_delivery, current_status: currentStatus };
    console.log('updateStatus payload', payload);
    return this.api.post(environment.orders.orderStatusUpdate, '', payload).toPromise();
  }

  sendDriverLocations(mission, lat, lng) {
    this.getUserData();
    return this.api.post(environment.orders.orderSendGeoLocation, '', { mission_id: mission, lat: lat, lon: lng }).toPromise();
  }
  acceptOrders(ids, comment = "Automatic Accept") {
    this.getUserData();
    const orders_ids = ids.join();
    return this.api.post(environment.orders.orderAcceptAll, '', { orders_id: orders_ids, comment: comment, apply_to_route: true }).toPromise();;
  }
  makeCall(phone_number) {
    console.log('Making a call to : ' + phone_number);
    if (phone_number.length) {
      CallNumber.call({ number: phone_number, bypassAppChooser: false })
        .then(res => {
          // this.showToaster('Launched dialer : OK');
        }).catch(err => {
          this.showToaster('Error launching dialer :' + err);
        });
    } else {
      // Show message of Can't make a call
      this.showToaster('Cannot make a call to : ' + phone_number);
    }
  }
  async showToaster(msg, duration = 5000) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: duration
    });
    toast.present();
  }

  markCallOffAsRead(call_id) {
    return this.api.post(environment.orders.callOffMarkAsRead, '', { user_id: this._user.id, call_id: call_id }).toPromise();
  }

  // POD
  sendPOD(orderID, file, updateStatus = false, type = 'POD') {
    this.getUserData();
    if (file) {
      if (updateStatus) {
        // Change order status and add POD
      } else {
        // Add POD file only
        const body = JSON.stringify(file);
        console.log('sendPOD body', body);
        return this.api.post(environment.orders.sendPOD, body, { user_id: this._user.id, mission_id: orderID, type: type }).toPromise();
      }
    }
  }

  // Background Task : On Going orders
  getOngoingOrders(id) {
    this.getUserData();
    return this.api.get(environment.orders.ongoingOrders, { user_id: id });
  }

  // Set attributes
  setAttribute(ordersIDs, attribute, value = '') {
    // return Observable.of(true).toPromise();
    const body = JSON.stringify({});
    return this.api.post(environment.orders.setAttribute, body, {
      user_id: this._user.id,
      orders_id: ordersIDs,
      action: attribute,
      value: value,
      apply_to_route: true
    }).toPromise();
  }

  // Mark Order As
  markAs(state, orders) {
    return this.api.post(environment.orders.markAs, '', { user_id: this._user.id, orders_id: orders, as: state }).toPromise();
  }

  executeTasks(tasks) {
    // console.log('executeTasks on', JSON.parse(JSON.stringify(tasks)));
    let tasks_ongoing = localStorage.getItem('bg_tasks_ongoing');
    tasks_ongoing = (tasks_ongoing) ? JSON.parse(tasks_ongoing) : false;
    if (tasks.length && !tasks_ongoing) {
      localStorage.setItem('bg_tasks_ongoing', "true");
      const tasks_length = tasks.length;
      let tasks_passed = 0;
      // tasks.sort((a, b) => { if (a.type > b.type) { return 1; } else if (a.type < b.type) { return -1; } else { return 0; } });
      for (let i = tasks_length - 1; i >= 0; i--) {
        const task = tasks[i];
        if (typeof task.order_id !== 'undefined' && task.order_id) {
          // Send POD files
          console.log('Sending POD of', task.order_id, task.data);
          // setTimeout(() => {
          //   tasks.splice(i, 1);
          //   tasks_passed++;
          //   if (tasks_passed === tasks_length) { // To make sure all tasks have been processed
          //      // Update Local Storage
          //      localStorage.setItem('bg_tasks', JSON.stringify(tasks));
          //      localStorage.setItem('bg_tasks_ongoing', "false");
          //   }
          // }, 2000);
          this.sendPOD(task.order_id, task.data, false, task.type).then((result: any) => {
            console.log('sendPOD Result', result);
            tasks_passed++;
            if (result && result.code && result.code === 200) {
              // Remove from tasks list
              tasks.splice(i, 1);
            }
            if (tasks_passed === tasks_length) { // To make sure all tasks have been processed
              // Update Local Storage
              localStorage.setItem('bg_tasks', JSON.stringify(tasks));
              localStorage.setItem('bg_tasks_ongoing', "false");
            }
          }).catch((err: any) => {
            console.error('sendPOD Error', err);
            tasks_passed++;
            if (tasks_passed === tasks_length) { // To make sure all tasks have been processed
              // Update Local Storage
              localStorage.setItem('bg_tasks', JSON.stringify(tasks));
              localStorage.setItem('bg_tasks_ongoing', "false");
            }
          });
        } else {
          tasks_passed++;
          if (tasks_passed === tasks_length) { // To make sure all tasks have been processed
            // Update Local Storage
            localStorage.setItem('bg_tasks', JSON.stringify(tasks));
            localStorage.setItem('bg_tasks_ongoing', "false");
          }
        }
      }

    }
  }
}
