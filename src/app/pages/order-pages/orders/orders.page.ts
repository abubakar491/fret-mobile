import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, Platform, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Preferences } from "@capacitor/preferences";
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { HttpClient } from '@angular/common/http';
import { Browser } from '@capacitor/browser';
import { environment } from '../../../../environments/environment';
import { STATUS, STATUS_ICONS } from '../../../constants/global.constant'
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { UserProvider } from '../../../services/user/user';
import { OrdersProvider } from '../../../services/orders/orders';
import { Order } from '../../../models/order.class';
import { CacheProvider } from '../../../services/cache/cache';
import { LocationTrackerProvider } from '../../../services/location-tracker/location-tracker';
import { DriverService } from '../../../core/services/driver.service';
import { analytics } from '../../../utils/events';
import { AuthService } from '../../../core/services/auth.service';
import { FcmProvider } from '../../../services/fcm/fcm';
import { take, tap } from 'rxjs/operators';
// import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { OrderService } from '../../../services/order.service';
import { Location } from '@angular/common';
import { getDiffTime } from '../../../shared/shared.module';
import { TransferModalComponent } from '../transfer-modal/transfer-modal.component';




const LAST_RESPONSE_TIME = 'LAST_RESPONSE_TIME';

interface appUpdate {
  current: string,
  enabled: boolean,
  url: string,
  maintenanceMsg?: {
    title: string,
    msg: string,
    button: string
  },
  majorMsg?: {
    title: string,
    msg: string,
    button: string
  }
  minorMsg?: {
    title: string,
    msg: string,
    button: string
  }

}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  @ViewChild('searchInput') searchInput;

  _user: any;
  _currentLang = 'fr';
  isLoggedIn: boolean = false;
  STATUS = STATUS;
  STATUS_ICONS = STATUS_ICONS;

  orders = null;

  refresher: any;

  isDev = false;

  trips = [];
  preparedOrders = [];

  nextStatusBtnClass = 'bg-light-blue';
  pleaseWaitText = '';
  loader: any;
  isLoading = false;

  selectedItems = [];
  QRShow = false;
  highlight = {};

  subs = [];
  searchShow = false;
  searchText = '';
  searchTextChanged = new Subject<string>();

  updateUrl = 'https://files.freterium.com/MobileApp/app-update.json' + '?hash_id=' + Math.random();
  newAppUrl = null;
  updateAlert: any;
  timer: number;
  myFiles = [];
  subscription: any;
  modal: any;
  timeoutHandler: NodeJS.Timeout;
  count = 0;

  constructor(private platform: Platform,
    private translateService: TranslateService,
    private cache: CacheProvider,
    private authService: AuthService,
    private user: UserProvider,
    private ordersSP: OrdersProvider, // To be removed
    private locationTracker: LocationTrackerProvider,
    private appVersion: AppVersion,
    public http: HttpClient,
    private alertCtrl: AlertController,
    private fcm: FcmProvider,
    private router: Router,
    private driverService: DriverService,
    public actionSheetController: ActionSheetController,
    public toastCtrl: ToastController,
    private orderService: OrderService,
    private location: Location,
    private modalController: ModalController,
  ) {
    moment.locale('fr');

    this.platform.backButton.subscribeWithPriority(10, async () => {

      console.log('this.router.url', this.router.url)
      if (this.router.url === '/orders') {
        console.log('we are Home!');

        this.selectedItems = [];
        this.highlight = [];

      } else if (this.router.url !== '/orders') {
        await this.location.back();
      }
    });
  }

  ngOnInit() {
    if (this.platform.is('capacitor')) {
      this.checkForUpdate();
    }
    if (environment.environment !== 'production') {
      const diffTime = getDiffTime()
      if (diffTime) {
        this.showToaster(diffTime, 1000);
        console.log('diffTime', diffTime)
      }
    }
  }

  ionViewWillEnter() {
    this._currentLang = this.translateService.getDefaultLang();
    console.log('ionViewWillEnter OrdersListingPage');
    this.loadOrders();
  }

  async transferOrders() {
    const orders = [];
    this.selectedItems.map((o: any) => orders.push(o.id));
    // const transfer_id = '1656484834063-3591-3951'; // for test
    const transfer_id = this.getUniqueId(2);

    const QRvalue = 'FR-ORDERDRIVERTRANSFER:' + btoa(JSON.stringify({
      uuid: transfer_id,
      orders,
      fromDriver: this._user.id,
    }));
    this.QRShow = true;

    this.modal = await this.modalController.create({
      component: TransferModalComponent,
      initialBreakpoint: 1,
      componentProps: {
        QRvalue,
        transfer_id
      }
    });
    await this.modal.present();

    const { data } = await this.modal.onDidDismiss();
    this.modal = null;

    if (data) {
      this.unselectAll();
      this.loadOrders();
    }
  }

  // receiveTransferdOrdersTest(payloadText = 'FR-ORDERDRIVERTRANSFER:eyJ1dWlkIjoiMTY1NjQ4NDgzNDA2My0zNTkxLTM5NTEiLCJvcmRlcnMiOlsiV1luejZlWmR6WnhMSm1CIl0sImZyb20iOiI2eVl6UkducEIxRTFkV0IifQ==') {
  //   if (payloadText.startsWith('FR-ORDERDRIVERTRANSFER:')) {
  //     const payload = JSON.parse(atob(payloadText.replace('FR-ORDERDRIVERTRANSFER:', '')));
  //     console.log('payloadp', payload)
  //     this.orderService.transfer(payload);
  //   }
  // }

  loadOrders() {
    this._user = this.driverService.getDriver();
    console.log('this._user', this._user)
    this.getOrders();
  }

  async userMenuPopover(e) {

    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: this.translateService.instant('mobile.MY_PROFIL'),
          icon: 'person-circle',
          handler: () => {
            analytics.track('AppUserProfile');
            this.router.navigate(['/profile']);
          }
        },
        // {
        //   text: this.translateService.instant('mobile.MY_PREFERENCES'),
        //   icon: 'cog',
        //   handler: () => {
        //     analytics.track('AppUserPreferences');
        //   }
        // },
        {
          text: this.translateService.instant('mobile.LOGOUT'),
          icon: 'power',
          handler: () => {
            analytics.track('AppUserLoggedOut')
            this.logout();
          }
        }
      ]
    });
    await actionSheet.present();
  }

  logout() {
    this.unSubscribeFromTopic();
    this.authService.logout();
    this.stopTracking();
    this.router.navigate(['/login']);
  }

  unSubscribeFromTopic() {
    if (this._user && this._user.id) {
      this.fcm.unsubscribeFromTopic(this._user.id);
    }
  }

  stopTracking() {
    this.locationTracker.onToggleEnabled(false);
  }

  doRefresh(refresher) {
    this.refresher = refresher.target;
    this.getOrders();
  }

  sortOrders(type) {
    switch (type) {
      case 'I': { // Intelligent Sorting
        this.orders.sort((a, b) => {
          const dateA = (a.status < 4) ? a.from.timeslot.starts : a.to.timeslot.starts;
          const dateB = (b.status < 4) ? b.from.timeslot.starts : b.to.timeslot.starts;
          if (dateA > dateB) {
            return 1;
          }
          if (dateA < dateB) {
            return -1;
          } else if (a.status < 4 && b.status < 4 && a.to.timeslot.starts < b.to.timeslot.starts) {
            return 1;
          } else if (a.status < 4 && b.status < 4 && a.to.timeslot.starts > b.to.timeslot.starts) {
            return -1;
          } else if (a.status > 4 && b.status > 4 && a.from.timeslot.starts < b.from.timeslot.starts) {
            return -1;
          } else if (a.status > 4 && b.status > 4 && a.from.timeslot.starts > b.from.timeslot.starts) {
            return 1;
          }
        });
        break;
      }
      default: { break; }
    }
  }

  getOrders() {

    // Setting orders to an empty array at the beginning
    this.orders = [];
  
    // Function to complete refresher
    const completeRefresher = () => {
      if (this.refresher !== undefined) {
        this.refresher.complete();
      }
    };
  
    this.ordersSP.getOrders().subscribe((res: any) => {
      if (res.length) {
        const orders_ids = [];
        console.log('getOrders() res', res);
        res.forEach(order => {
          const orderObj = new Order(order);
          orderObj.setOrderTexts();
          const OTindex = this.orders.push(orderObj);
          this.setOrderIcon(OTindex - 1);
          if (orderObj.status === STATUS.WAITING) {
            orders_ids.push(orderObj.id);
          }
        });
        this.setOrdersTrips();
        this.acceptAllOrders(orders_ids);
        if (orders_ids.length) {
          this.setNewOrderStatus(orders_ids);
        }
        this.sortOrders('I');
        console.log('this.orders In', this.orders);
        this.cache.setValue('orders', res);
      } else {
        // None found. Driver is free for fun :)
        this.cache.setValue('orders', []);
      }
      completeRefresher();
    }, (err: any) => {
      console.error('Get Orders ERROR', err);
      completeRefresher();
    });
  }

  /**
   * Change the order status from 0 to 1 when it's recently created.
   * @param ordersId - Orders id array.
   */
  setNewOrderStatus(ordersId: Array<string>) {
    this.ordersSP.updateStatus(ordersId.toString(), STATUS.CONFIRMED).then((res: any) => {
      if (res && res.data && res.data.length) {
        const ordersByStatus = new Map();
        for (const { id, status } of res.data) {
          ordersByStatus.set(id, { status });
        }

        this.orders = this.orders.map((order, index) => {
          if (ordersByStatus.has(order.id)) {
            const { status } = ordersByStatus.get(order.id);
            order.status = status;
            const orderObj = new Order(order);
            orderObj.setOrderTexts();
            this.setOrderIcon(index);
          }
          return order;
        });
      }
    });
  }

  goToDetails(id, i) {
    this.endCount();
    let order = null;
    this.orders.forEach((o: any) => {
      if (o.id === id) {
        order = o;
      }
    });
    if (order) {
      if (this.selectedItems.length === 0) {
        this.router.navigate([`/orders/${id}/edit`], { state: { order } });
      } else {
        this.onOrderSelected(order);
      }
    }
    this.orderService.storeReturnReasons(id);
  }

  holdCount(item) {
    this.count = 0;
    this.timeoutHandler = setInterval(() => {
      console.log('this.count', this.count)
      if (this.count >= 16) {
        this.endCount();
        this.onHold(item);
      } else {
        ++this.count;
      }
    }, 100);
  }

  endCount() {
    clearTimeout(this.timeoutHandler);
  }

  onHold(item) {
    this.selectedItems = [];
    this.highlight = {};
    this.highlight[item.id] = true;
    this.selectedItems.push(item);
  }

  onOrderSelected(item) {
    //These events happen when the user has already started the multiple select process with the hold feauture
    console.log("select order", item);
    const indexOfElement = this.selectedItems.map((element) => { return element.id }).indexOf(item.id);
    if (indexOfElement > -1) {
      this.highlight[item.id] = false;
      this.selectedItems.splice(indexOfElement, 1);
    } else if (this.selectedItems.length > 0 && indexOfElement === -1) {
      this.highlight[item.id] = true;
      this.selectedItems.push(item);
    }
  }

  detailsCallBack(order) {
    console.log('detailsCallBack Data', order);
    this.orders.forEach((o, i) => {
      if (o.id === order.id) {
        console.log('Order Found');
        this.orders[i].status = order.status;
        console.log('Order Update', this.orders[i]);
      }
    });
  }

  acceptAllOrders(ids) {
    if (ids.length) {
      this.ordersSP.acceptOrders(ids).then((res: any) => {
        console.log('acceptAllOrders Result', res);
        if (res && res.code && res.code === 200) {
          this.orders.forEach((order, i) => {
            if (order.status === STATUS.WAITING) {
              this.orders[i].status = STATUS.CONFIRMED;
            }
          });
        }
      }, (err: any) => {
        console.error('ERROR', err);
      });
    }
  }

  async openQRScanner() {

    // if (!this.platform.is('capacitor')) {
    //   console.log('NOT CAPACITOR')
    //   return;
    // }
    // analytics.track('AppQrCode');

    // // await BarcodeScanner.checkPermission({ force: true });
    // const allowed = await this.checkPermission();

    // if (!allowed) {
    //   this.showToaster('NOT ALLOWED TO USE CAMERA');
    //   return;
    // }
    // document.body.style.display = "none";
    // BarcodeScanner.hideBackground();

    // document.addEventListener('ionBackButton', async (ev) => {
    //   ev.stopPropagation();
    //   BarcodeScanner.stopScan();
    //   document.body.style.display = "block";
    // });

    // const result = await BarcodeScanner.startScan();

    // if (result.hasContent) {
    //   document.body.style.display = "block";

    //   if (result.content.startsWith('FR-ORDER-ID:')) {

    //     const qid = result.content.replace('FR-ORDER-ID:', '');

    //     const orderIndex = this.orders.findIndex(element => {
    //       return element.id === qid;
    //     });

    //     if (orderIndex >= 0) {
    //       this.goToDetails(this.orders[orderIndex].id, orderIndex);
    //     } else {
    //       this.orderService.getOrderById(qid).pipe(take(1))
    //         .subscribe(
    //           (res) => {
    //             const order = new Order(res);
    //             const driverIndex = order.drivers.findIndex(dr => {
    //               return dr.id === this._user.id;
    //             });
    //             if (driverIndex >= 0) {
    //               this.showToaster('This order has already been closed');
    //             } else {
    //               this.showToaster('This order is assigned to another driver');
    //             }
    //           },
    //           (error) => {
    //             this.showToaster('Invalid QR code, please scan Freterium shipping label 002')
    //           }
    //         );
    //     }
    //   } else if (result.content.startsWith('FR-ORDERDRIVERTRANSFER:')) {
    //     const payload = JSON.parse(atob(result.content.replace('FR-ORDERDRIVERTRANSFER:', '')));
    //     // this.receiveTransferdOrders(payload);
    //     this.orderService.transfer(payload);
    //   } else {
    //     this.showToaster('Invalid QR code, please scan Freterium shipping label 001')
    //   }
    // }
  }

  async checkPermission() {
    // return new Promise(async (resolve, reject) => {
    //   const status = await BarcodeScanner.checkPermission({ force: true });
    //   if (status.granted) {
    //     resolve(true);
    //   } else if (status.denied) {
    //     BarcodeScanner.openAppSettings();
    //     resolve(false);
    //   }
    // });
  }

  async showToaster(msg, duration = 5000) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: duration
    });
    toast.present();
  }

  goToDiscussions() {
    this.router.navigate(['/discussions'])
  }

  goToBreakDowns() {
    this.router.navigate(['/breakdowns']);
  }

  setOrderIcon(index = 0) {
    if (this.orders[index].status === STATUS.ONSITE_LOADING) {
      if (this.orders[index].loading_started === '') {
        this.orders[index]['STATUS_ICON'] = STATUS_ICONS[this.orders[index].status];
      } else {
        this.orders[index]['STATUS_ICON'] = STATUS_ICONS['ONSITE_LOADING_STARTED'];
      }
    } else if (this.orders[index].status === STATUS.ONSITE_DELIVERY) {
      if (this.orders[index].delivery_started === '') {
        this.orders[index]['STATUS_ICON'] = STATUS_ICONS[this.orders[index].status];
      } else {
        this.orders[index]['STATUS_ICON'] = STATUS_ICONS['ONSITE_DELIVERY_STARTED'];
      }
    } else {
      this.orders[index]['STATUS_ICON'] = STATUS_ICONS[this.orders[index].status];
    }
  }

  setOrdersTrips() {
    this.preparedOrders = [];
    this.orders.map((order: Order) => {
      if (order.route.route_id) {
        if (!this.preparedOrders.find((po: any) => po.route_id === order.route.route_id)) {
          this.trips['trip_' + order.route.route_id] = this.orders.filter((ord: Order) => ord.route.route_id === order.route.route_id).map(({ id, ref, status, from, to }) => ({ id, ref, status, from, to }));
          this.preparedOrders.push({ route_id: order.route.route_id, is_route: true, orders: this.trips['trip_' + order.route.route_id] });
        }
        order.route['orders'] = this.trips['trip_' + order.route.route_id];
      } else {
        this.preparedOrders.push({ route_id: 0, is_route: false, orders: [order] });
      }
    });
  }

  presentLoading() {
    this.loader.present();
    this.isLoading = true;
  }

  dismissLoading() {
    this.loader.dismiss();
    this.isLoading = false;
  }

  changeStatus(order, status, apply_to_all = false, partial_delivery = false) {
    console.log('Send Status Change request', status, 'partial_delivery', partial_delivery);
    this.presentLoading();
    const apply_to_route = (status !== STATUS.LOADED && status !== STATUS.DELIVERED) || apply_to_all;
    this.ordersSP.updateStatus(order.id, status, apply_to_route, partial_delivery, this._user.id).then((res: any) => {
      console.log('changeStatus Result', res);
      this.dismissLoading();
      if (res.code && res.code === 200) {
        this.nextStatusBtnClass = 'bg-green';

        if (this.platform.is('capacitor')) {
          this.locationTracker.sendUserCurrentGeoLocation(status, order.id);
        }

        this.loadOrders();
        setTimeout(() => {
          this.nextStatusBtnClass = 'bg-light-blue';
        }, 2000);
      } else {
        this.nextStatusBtnClass = 'bg-orange';
        setTimeout(() => {
          this.nextStatusBtnClass = 'bg-light-blue';
        }, 2000);
      }
    }).catch((err: any) => {
      this.dismissLoading();
      this.nextStatusBtnClass = 'bg-red';
      console.error('changeStatus Error', err);
    });
  }

  async confirmStatusChange(order, status) {
    const statusVal = status + 1;
    if (statusVal === 8) {
    } else {
      let msg = '';
      const buttons = [
        {
          text: 'OK',
          cssClass: 'alertConfirm-yes bg-green text-color-white',
          handler: () => {
            console.log('Agree clicked');
            this.changeStatus(order, statusVal);
          }
        }
      ];
      if (order.route.route_id) {
        let relatedOTs = order.route.orders.filter((ord: any) =>
          ord.id !== order.id
          && ord.status === order.status
          && (
            (ord.status < STATUS.LOADED && ord.from.id === order.from.id && ord.from.timeslot.starts === order.from.timeslot.starts)
            || (ord.status >= STATUS.LOADED && ord.to.id === order.to.id && ord.to.timeslot.starts === order.to.timeslot.starts)
          )
        );
        if (relatedOTs.length && ((statusVal === STATUS.LOADED || statusVal === STATUS.DELIVERED))) {
          msg += '<div class="related-orders">';
          msg += '<span class="related-orders-label">Ces ordres de transport sont liés :</span>';
          relatedOTs.map((order: any) => {
            msg += `<span class="related-order-ref">${order.ref}</span>`;
          });
          msg += '</div>';
          msg = '<span class="text-bold">' + relatedOTs.length + '</span>' + this.translateService.instant('mobile.ORDERS_ARE_MAYBE_CONCERNED') + '</span>. '
          buttons[0].text = 'Cet ordre seulement';
          buttons.push({
            text: 'Tous (' + (relatedOTs.length + 1) + ')',
            cssClass: 'alertConfirm-yes confirm-all bg-blue-2 text-color-white',
            handler: () => {
              console.log('Agree for all clicked');
              this.changeStatus(order, statusVal, true);
            }
          });
          buttons.push({
            text: this.translateService.instant(`mobile.CANCEL`),
            cssClass: 'alertConfirm-no text-color-red',
            handler: () => {
              console.log('Disagree clicked');
            }
          });
        } else {
          buttons.unshift({
            text: this.translateService.instant(`mobile.NO`),
            cssClass: 'alertConfirm-no text-color-red',
            handler: () => {
              console.log('Disagree clicked');
            }
          });
        }
      } else {
        buttons.unshift({
          text: this.translateService.instant(`mobile.NO`),
          cssClass: 'alertConfirm-no text-color-red',
          handler: () => {
            console.log('Disagree clicked');
          }
        });
      }
      let confirm = await this.alertCtrl.create({
        header: this.translateService.instant(order.STATUS_QUESTION),
        message: msg,
        cssClass: 'alertConfirm',
        buttons: buttons
      });
      confirm.present();
    }
  }

  unselectAll() {
    this.selectedItems = [];
    this.highlight = [];
  }

  getUniqueId(parts: number): string {
    const stringArr = [Date.now().toString()];
    for (let i = 0; i < parts; i++) {
      // tslint:disable-next-line:no-bitwise
      const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }

  async checkForUpdate() {

    this.http.get(this.updateUrl).subscribe(async (info: appUpdate) => {
      console.log('check for Update ', info)
      this.newAppUrl = info.url;
      if (!info.enabled) {
        console.log('in App not enabled');
        this.presentAlert(info.maintenanceMsg.title, info.maintenanceMsg.msg);
      } else {

        this.newAppUrl = info.url;
        // const versionNumber = '0.4.0';

        const versionNumber = await this.appVersion.getVersionNumber();

        const splittedVersion = versionNumber.split('.').map(str => {
          return Number(str);
        });
        const serverVersion = info.current.split('.').map(str => {
          return Number(str);
        });

        console.log('in Version check - actual', splittedVersion, 'server version', serverVersion);

        if (serverVersion[0] > splittedVersion[0]) {
          this.presentAlert(this.translateService.instant(info.majorMsg.title), this.translateService.instant(info.majorMsg.msg), this.translateService.instant(info.majorMsg.button));
        } else if (serverVersion[0] === splittedVersion[0] && serverVersion[1] > splittedVersion[1]) {
          this.presentAlert(this.translateService.instant(info.majorMsg.title), this.translateService.instant(info.majorMsg.msg), this.translateService.instant(info.majorMsg.button));
        } else if (serverVersion[0] === splittedVersion[0] && serverVersion[1] === splittedVersion[1] && serverVersion[2] > splittedVersion[2]) {
          Preferences.get({ key: LAST_RESPONSE_TIME }).then((lastResponse) => {
            console.log('lastResponse', lastResponse)

            const now = Math.floor(Date.now() / (1000));

            if (!lastResponse.value || (lastResponse.value && now - parseInt(lastResponse.value) >= (1 * 60 * 60))) { // 1h
              Preferences.set({ key: LAST_RESPONSE_TIME, value: now + '' })
              this.presentAlert(this.translateService.instant(info.minorMsg.title), this.translateService.instant(info.minorMsg.msg), this.translateService.instant(info.minorMsg.button), true);
            }
          });

        }
      }
    });
  }

  async presentAlert(header, message, buttonText = '', allowClose = false) {
    const buttons = [];

    if (buttonText != '') {
      buttons.push({
        text: buttonText,
        handler: () => {
          this.openDownloadPage();
          // this.downloadNewVersion();
          return false;
        }
      })
    }
    if (allowClose) {
      buttons.push({
        text: this.translateService.instant('mobile.update.later'),
        role: 'cancel'
      })
    }

    if (!this.updateAlert) {
      this.updateAlert = await this.alertCtrl.create({
        header,
        message,
        buttons,
        backdropDismiss: allowClose
      });
      await this.updateAlert.present();
      this.updateAlert.onDidDismiss(() => {
        this.updateAlert = null;
      });
    }
  }

  openDownloadPage() {
    Browser.open({ url: environment.downloadURL });
  }
}
