import { Component } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpStatusCode } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { LaunchNavigator } from '@awesome-cordova-plugins/launch-navigator/ngx';
import {
  AlertController,
  PopoverController,
  ModalController,
  NavController,
  Platform,
} from '@ionic/angular';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import {
  STATUS,
  STATUS_ICONS,
  STATUS_TEXTS,
} from '../../../constants/global.constant';
import { OrderService } from '../../../services/order.service';
import { Driver } from '../../../core/models';
import { OrderStatus, ChatMessage, MessageType } from '../../../models';
import { OrderConstants } from './../../../constants';
import { DriverService } from './../../../core/services/driver.service';
import { ConfirmLoadingComponent } from './../../../components/confirm-loading/confirm-loading.component';
import { ReportProblemComponent } from './../../../components/report-problem/report-problem.component';
import { OrderPaymentsComponent } from './../../../components/order-payments/order-payments.component';
import { OrderDetailsPage } from '../order-details/order-details.page';
import { DiscussionsService } from './../../../services/discussions.service';
import { Order } from '../../../models/order.class';
import { MediaService } from './../../../services/media.service';
import { analytics } from '../../../utils/events';
import { OtpModalComponent } from '../otp-modal/otp-modal.component';
import { ReturnReasonsComponent } from '../../../components/return-reasons/return-reasons.component';

@Component({
  selector: 'freterium-edit-order',
  templateUrl: './edit-order.page.html',
  styleUrls: ['./edit-order.page.scss'],
})
export class EditOrderPage {
  loading = false;
  nextStatusBtnClass = 'bg-light-blue';
  order: any;
  driver: Driver;
  orderStatus: typeof OrderStatus;
  statusReferences: typeof OrderConstants.STATUSES_REFERENCES;
  subs = [];
  STATUS: any;
  STATUS_ICONS: any;
  STATUS_TEXTS: any;
  nextDestination = 'ORDERS_LIST';
  base64Image = '';
  modal: HTMLIonModalElement;

  constructor(
    private platform: Platform,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private popoverController: PopoverController,
    private modalController: ModalController,
    private navController: NavController,
    private launchNavigator: LaunchNavigator,
    private translateService: TranslateService,
    private driverService: DriverService,
    private orderService: OrderService,
    private discussionsService: DiscussionsService,
    private mediaService: MediaService
  ) {
    this.STATUS = STATUS;
    this.STATUS_ICONS = STATUS_ICONS;
    this.STATUS_TEXTS = STATUS_TEXTS;
    this.orderStatus = OrderStatus;
    this.statusReferences = OrderConstants.STATUSES_REFERENCES;
    this.order = this.router.getCurrentNavigation().extras?.state?.order;
    this.platform.resume.subscribe(() => this.reloadOrder());
    moment.locale(this.translateService.getDefaultLang());
  }

  ionViewWillEnter() {
    this.nextDestination = 'ORDERS_LIST';
    this.getCurrentOrder(this.activatedRoute.snapshot.params.orderId);
    this.getDriver();
  }

  /**
   * Get formatted info start date.
   */
  get startTime(): string {
    const infoStartDate =
      this.order?.status < STATUS.LOADED
        ? this.order?.from?.timeslot?.starts
        : this.order?.to?.timeslot?.starts;

    let lang =
      this.translateService.currentLang !== 'null' &&
        this.translateService.currentLang !== 'id'
        ? this.translateService.currentLang
        : 'en';
    return formatDate(infoStartDate, 'HH:mm', lang);
  }

  setOrderTexts() {
    if (this.order.state && this.order.state.notLoaded) {
      this.order['STATUS_ICON'] = STATUS_ICONS['NOT_LOADED'];
      this.order['STATUS_TEXT'] = STATUS_TEXTS['NOT_LOADED'].text;
      this.order['STATUS_QUESTION'] = STATUS_TEXTS['NOT_LOADED'].question;
      this.order['NEXT_STATUS'] = 'NONE';
    } else if (this.order.state && this.order.state.returned) {
      this.order['STATUS_ICON'] = STATUS_ICONS['RETURNED'];
      this.order['STATUS_TEXT'] = STATUS_TEXTS['RETURNED'].text;
      this.order['STATUS_QUESTION'] = STATUS_TEXTS['RETURNED'].question;
      this.order['NEXT_STATUS'] = 'NONE';
    } else {
      if (this.order.status === STATUS.ONSITE_LOADING) {
        if (this.order.from.has_docks) {
          if (this.order.loading_started === '') {
            this.order['STATUS_ICON'] = STATUS_ICONS[this.order.status];
            this.order['STATUS_TEXT'] = STATUS_TEXTS[3].text;
            this.order['STATUS_QUESTION'] = STATUS_TEXTS[3].question;
            this.order['NEXT_STATUS'] = 'ONSITE_LOADING_STARTED';
          } else {
            this.order['STATUS_ICON'] = STATUS_ICONS['ONSITE_LOADING_STARTED'];
            this.order['STATUS_TEXT'] =
              STATUS_TEXTS['ONSITE_LOADING_STARTED'].text;
            this.order['STATUS_QUESTION'] =
              STATUS_TEXTS['ONSITE_LOADING_STARTED'].question;
            this.order['NEXT_STATUS'] =
              this.order.status < STATUS.DELIVERED
                ? this.order.status + 1
                : STATUS.DELIVERED;
          }
        } else {
          this.order['STATUS_ICON'] = STATUS_ICONS[this.order.status];
          this.order['STATUS_TEXT'] = STATUS_TEXTS[this.order.status].text;
          this.order['STATUS_QUESTION'] =
            'ORDERS_ONSITE_LOADING_STARTED_QUESTION';
          this.order['NEXT_STATUS'] =
            this.order.status < STATUS.DELIVERED
              ? this.order.status + 1
              : STATUS.DELIVERED;
        }
      } else if (this.order.status === STATUS.ONSITE_DELIVERY) {
        if (this.order.to.has_docks) {
          if (this.order.delivery_started === '') {
            this.order['STATUS_ICON'] = STATUS_ICONS[this.order.status];
            this.order['STATUS_TEXT'] = STATUS_TEXTS[6].text;
            this.order['STATUS_QUESTION'] = STATUS_TEXTS[6].question;
            this.order['NEXT_STATUS'] = 'ONSITE_DELIVERY_STARTED';
          } else {
            this.order['STATUS_ICON'] = STATUS_ICONS['ONSITE_DELIVERY_STARTED'];
            this.order['STATUS_TEXT'] =
              STATUS_TEXTS['ONSITE_DELIVERY_STARTED'].text;
            this.order['STATUS_QUESTION'] =
              STATUS_TEXTS['ONSITE_DELIVERY_STARTED'].question;
            this.order['NEXT_STATUS'] =
              this.order.status < STATUS.DELIVERED
                ? this.order.status + 1
                : STATUS.DELIVERED;
          }
        } else {
          this.order['STATUS_ICON'] = STATUS_ICONS[this.order.status];
          this.order['STATUS_TEXT'] = STATUS_TEXTS[this.order.status].text;
          this.order['STATUS_QUESTION'] =
            'ORDERS_ONSITE_DELIVERY_STARTED_QUESTION';
          this.order['NEXT_STATUS'] =
            this.order.status < STATUS.DELIVERED
              ? this.order.status + 1
              : STATUS.DELIVERED;
        }
      } else {
        this.order['STATUS_ICON'] = STATUS_ICONS[this.order.status];
        this.order['STATUS_TEXT'] = STATUS_TEXTS[this.order.status].text;
        this.order['STATUS_QUESTION'] =
          STATUS_TEXTS[this.order.status].question;
        this.order['NEXT_STATUS'] =
          this.order.status < STATUS.DELIVERED
            ? this.order.status + 1
            : STATUS.DELIVERED;
      }
    }
  }

  /**
   *
   * @param id - The order id.
   */
  getCurrentOrder(id: string): void {
    this.orderService
      .getOrderById(id)
      .pipe(take(1))
      .subscribe((res) => {
        const order = new Order(res);
        order.route.orders = this.order?.route?.orders || [];
        this.order = { ...this.order, ...order };
        this.setOrderTexts();
      });
  }

  getDriver(): void {
    this.driver = this.driverService.getDriver();
  }

  confirmStatusChange(status: OrderStatus): void {
    switch (status) {
      case 1: {
        analytics.track('AppOrderLoadingOnRoute');
        break;
      }
      case 2: {
        analytics.track('AppOrderLoadingOnSite');
        break;
      }
      case 3: {
        analytics.track('AppOrderLoaded');
        break;
      }
      case 4: {
        analytics.track('AppOrderDeliveryOnRoute');
        break;
      }
      case 5: {
        analytics.track('AppOrderDeliveryOnSite');
        break;
      }
      case 6: {
        analytics.track('AppOrderDelivered');
        break;
      }
      default:
        break;
    }

    const statusVal = status + 1;
    if (statusVal === 8) {
    } else {
      let msg = '';
      const buttons = [
        {
          text: 'OK',
          cssClass: 'edit-order-alert-ok-btn',
          handler: () => {
            if (statusVal == 4) {
              if (buttons[0].text !== 'OK') {
                analytics.track('AppOrderLoadOnlyOne');
              }
              this.showPOD(status, 'POL', false);
            } else if (statusVal == 7) {
              if (buttons[0].text !== 'OK') {
                analytics.track('AppOrderDeliverOnlyOne');
              }
              this.showPOD(status, 'POD', false);
            } else {
              this.changeStatus(statusVal);
            }
          },
        },
      ];

      if (this.order.route.route_id) {
        if (statusVal === this.orderStatus.DELIVERED && this.order.use_otp) {
          this.checkWithOTP(status);
          return;
        }

        let currentOrder = this.order.route.orders.find(
          (order) => order.id === this.order.id
        );
        let relatedOTs = this.order.route.orders.filter((ord) => {
          return (
            ord.status === currentOrder.status &&
            ord.id !== currentOrder.id &&
            ((status < STATUS.LOADED &&
              ord.status < STATUS.LOADED &&
              ord.from.id === currentOrder.from.id &&
              ord.from.timeslot.starts === currentOrder.from.timeslot.starts) ||
              (status > STATUS.LOADED &&
                ord.status >= STATUS.LOADED &&
                ord.to.id === currentOrder.to.id &&
                ord.to.timeslot.starts === currentOrder.to.timeslot.starts)) &&
            !ord.payment_mode
          );
        });
        const relatedOrderIds = relatedOTs.map((order) => order.id);
        if (
          relatedOTs.length &&
          (statusVal === this.orderStatus.LOADED ||
            statusVal === this.orderStatus.DELIVERED)
        ) {
          msg += '<div class="related-orders">';
          msg +=
            '<span class="related-orders-label">' +
            this.translateService.instant(
              'mobile.editOrder.theseTransportOrdersAreLinked'
            ) +
            '</span>';
          relatedOTs.forEach(
            (order) =>
              (msg += `<span class="related-order-ref">${order.reference}</span>`)
          );
          msg += '</div>';
          msg =
            '<span class="text-bold">' +
            relatedOTs.length +
            '</span>' +
            this.translateService.instant(
              'mobile.editOrder.ordersAreConcerned'
            ) +
            ' <span class="text-bold">' +
            (this.order.status < STATUS.LOADED
              ? this.order.from.name
              : this.order.to.name) +
            '</span>.';
          buttons[0].text = this.translateService.instant(
            'mobile.editOrder.thisOrderOnly'
          );
          buttons.push({
            text:
              this.translateService.instant(`mobile.ALL`) +
              ' (' +
              (relatedOTs.length + 1) +
              ')',
            cssClass: 'edit-order-alert-apply-all-btn',
            handler: () => {
              const showOrderItems = true;
              if (statusVal == 4) {
                analytics.track('AppOrderLoadAll');
                // analytics.track('AppOrderLoadOnlyOne');
                this.showPOD(status, 'POL', true, relatedOrderIds, showOrderItems);
              } else if (statusVal == 7) {
                analytics.track('AppOrderDeliverAll');
                // analytics.track('AppOrderDeliverOnlyOne');
                this.showPOD(status, 'POD', true, relatedOrderIds, showOrderItems);
              } else {
                this.changeStatus(statusVal, true);
              }
            },
          });
          buttons.push({
            text: this.translateService.instant(`mobile.CANCEL`),
            cssClass: 'edit-order-alert-cancel-btn',
            handler: () => {},
          });
        } else {
          buttons.unshift({
            text: this.translateService.instant(`mobile.NO`),
            cssClass: 'edit-order-alert-cancel-btn',
            handler: () => {},
          });
        }
      } else {
        buttons.unshift({
          text: this.translateService.instant(`mobile.NO`),
          cssClass: 'edit-order-alert-cancel-btn',
          handler: () => {},
        });
      }

      this.presentAlert(status, msg, buttons);
    }
  }

  //relatedOTs contains related orderIds, if applyToAll is true, then it will apply to all related orders
  async showPOD(
    status: OrderStatus,
    type = 'POD',
    applyToAll = false,
    relatedOrderIds = [],
    showOrderItems = false
  ) {
    this.modal = await this.modalController.create({
      cssClass: 'confirm-loading-container',
      component: ConfirmLoadingComponent,
      componentProps: {
        order: this.order,
        type: type,
        driver: this.driver,
        relatedOrderIds,
        showOrderItems
      },
    });

    await this.modal.present();

    const { data } = await this.modal.onDidDismiss();
    debugger;
    if (!data && !data?.changeStatus) return;
      const hasUndeliveredLoadedItems = data.productLineItems.some(
        (productLineItem) => productLineItem.selectedQuantity < productLineItem.expectedQuantity
      );
      const isPartialDelivery = data.partial_delivery || hasUndeliveredLoadedItems
    
      const showReturnReasonScreen = data.partial_delivery|| hasUndeliveredLoadedItems;
    
      if (showReturnReasonScreen) {
        await this.showReturnReasonScreen(
          'partial_delivery', 
          type, 
          () => this.changeStatus(
            status + 1,
            applyToAll,
            isPartialDelivery,
            data.productLineItems
          ));
        return;
      }

      this.changeStatus(
        status + 1,
        applyToAll,
        isPartialDelivery,
        data.productLineItems
      );
  }

  async showReturnReasonScreen(state: string, type: string = '', afterReasonSelectedCallback = null) {
    //todo hello
    if (state === 'not_loaded') {
      analytics.track('AppOrderNotLoaded');
    } else if (state === 'returned') {
      analytics.track('AppOrderNotDelivered');
    } else if (state === 'partial_delivery') {
      // return;
    }

    const modal = await this.modalController.create({
      component: ReturnReasonsComponent,
      componentProps: { order: this.order, state, type },
      cssClass: 'freterium-return-reasons-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data.problem && data.problem.type) {
      const issue = this.makeMsg(data.photos.length > 0 ? MessageType.PHOTO : MessageType.ISSUE, {
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
      if(state === 'returned' && data.photos){
        this.sendPOR(data.photos, data.orderId)
      }
      this.discussionsService.sendMsg(issue, data.photos.length > 0 ? data.photos : null).pipe(take(1)).subscribe();
      this.presentLoading();
      switch (state) {
        case 'not_loaded':
        case 'returned':
        case 'postponed': {
          this.orderService
            .markAs(
              state,
              [this.order.id],
              data.problem.return_reason_id || null
            )
            .pipe(take(1))
            .subscribe(
              (res: any) => {
                this.dismissLoading();
                if (res && res.code && res.code === HttpStatusCode.Ok) {
                  this.navController.pop();
                } else {
                  this.dismissLoading();
                }
              },
              () => this.dismissLoading()
            );

          break;
        }
        case 'partial_delivery': {
          if (afterReasonSelectedCallback) {
            afterReasonSelectedCallback();
          }else{
            this.navController.pop();
          }
        }

        default: {
          this.dismissLoading();
        }
      }
    }
  }

  sendPOR(files, orderId) {
    if (files.length) {
      let tasks: any = localStorage.getItem('bg_tasks');
      const pod_task = {
        type: 'POR',
        order_id: orderId,
        data: files
      };
      if (tasks) {
        tasks = JSON.parse(tasks);
        tasks = Array.isArray(tasks) ? tasks : [];
      } else {
        tasks = [];
      }
      tasks.push(pod_task);
      localStorage.setItem('bg_tasks', JSON.stringify(tasks));
    }
  }
  
  async presentAlert(status: OrderStatus, message: string, buttons: any) {
    let confirm = await this.alertController.create({
      header: `${this.translateService.instant(
        `mobile.editOrder.statusLabel.${STATUS_TEXTS[status + 1].text}`
      )} ?`,
      message,
      cssClass: 'edit-order-alert',
      buttons: buttons,
    });

    await confirm.present();
  }

  async checkWithOTP(status: OrderStatus) {
    this.modal = await this.modalController.create({
      component: OtpModalComponent,
      initialBreakpoint: 1,
      componentProps: {
        order: this.order,
      },
    });
    await this.modal.present();

    const { data } = await this.modal.onDidDismiss();
    this.modal = null;

    if (data) {
      this.showPOD(status, 'POD', false);
    }
  }

  changeStatus(
    status: number,
    applyToAll = false,
    partialDelivery = false,
    productLineItems = []
  ) {
    const applyToRoute =
      (status !== this.orderStatus.LOADED &&
        status !== this.orderStatus.DELIVERED) ||
      applyToAll;

    this.presentLoading();

    const order_items = productLineItems.map((productLineItem) => {
      return {
        id: productLineItem.id,
        quantity: productLineItem.selectedQuantity,
      };
    });

    this.orderService
      .updateStatus(
        this.order.id,
        status,
        applyToRoute,
        partialDelivery,
        this.order,
        order_items
      )
      .pipe(take(1))
      .subscribe(
        (result) => {
          this.dismissLoading();
          if (result.code && result.code === HttpStatusCode.Ok) {
            this.order.status =
              result?.data?.[0]?.status ?? result?.sucess?.status;
            this.nextStatusBtnClass = 'bg-green';
            this.updateOrder();

            // @todo - Handle geolocation.

            setTimeout(() => {
              this.nextStatusBtnClass = 'bg-light-blue';
            }, 2000);
          } else {
            this.nextStatusBtnClass = 'bg-orange';
            setTimeout(() => {
              this.nextStatusBtnClass = 'bg-light-blue';
            }, 2000);
          }
        },
        (err) => {
          this.dismissLoading();
          this.nextStatusBtnClass = 'bg-red';
        }
      );
  }

  /**
   * Go back when `order.status` is loaded or delivered.
   */
  updateOrder(): void {
    this.setOrderTexts();
    if (
      this.order.status === this.orderStatus.LOADED ||
      this.order.status === this.orderStatus.DELIVERED
    ) {
      this.navController.pop();
    }
  }
  //red exclamation mark on home screen should show only 'other' reasons.
  async markAs(state: string, infoButton = false) {
    if (state === 'not_loaded') {
      analytics.track('AppOrderNotLoaded');
    } else if (state === 'returned') {
      analytics.track('AppOrderNotDelivered');
    } else if (state === 'partial_delivery') {
      // return;
    }

    const popover = await this.popoverController.create({
      cssClass: 'report-problem-container',
      component: ReportProblemComponent,
      componentProps: { order: this.order, infoButton },
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data.problem && data.problem.type) {
      const issue = this.makeMsg(data.photos.length > 0 ? MessageType.PHOTO : MessageType.ISSUE, {
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

      this.discussionsService.sendMsg(issue, data.photos.length > 0 ? data.photos : null).pipe(take(1)).subscribe();
      this.presentLoading();
      switch (state) {
        case 'not_loaded':
        case 'returned':
        case 'postponed': {
          this.orderService
            .markAs(
              state,
              [this.order.id],
              data.problem.return_reason_id || null
            )
            .pipe(take(1))
            .subscribe(
              (res: any) => {
                this.dismissLoading();
                if (res && res.code && res.code === HttpStatusCode.Ok) {
                  this.navController.pop();
                } else {
                  this.dismissLoading();
                }
              },
              () => this.dismissLoading()
            );

          break;
        }
        case 'partial_delivery': {
          this.navController.pop();
        }

        default: {
          this.dismissLoading();
        }
      }
    }
  }

  /**
   * Get message.
   * @param type - The message type.
   * @param payload - The message contant
   */
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

  presentLoading() {
    this.loading = true;
  }

  dismissLoading() {
    this.loading = false;
  }

  async orderPayments() {
    this.modal = await this.modalController.create({
      component: OrderPaymentsComponent,
      initialBreakpoint: 1,
      componentProps: {
        order: this.order,
      },
    });
    await this.modal.present();

    const { data } = await this.modal.onDidDismiss();
    this.modal = null;

    if (data) {
      this.getCurrentOrder(this.order.id);
    }
  }

  reloadOrder() {
    if (this.order && !this.loading) {
      this.presentLoading();
      this.orderService
        .getOrderById(this.order.id)
        .pipe(take(1))
        .subscribe(
          (res: any) => {
            this.dismissLoading();
            if (res && res.id) {
              this.order = new Order(res);
              this.setOrderTexts();
            }
          },
          () => {
            this.dismissLoading();
          }
        );
    }
  }

  async showOrderDetail() {
    analytics.track('AppOrderViewInformation');
    const modal = await this.modalController.create({
      component: OrderDetailsPage,
      componentProps: { order: this.order },
    });

    modal.present();
  }

  showMakeCall(phoneNumber) {
    this.makeCall(phoneNumber);
  }

  makeCall(phoneNumber) {
    analytics.track('AppOrderContactCall');
    this.orderService.makeCall(phoneNumber);
  }

  takePicture() {
    this.mediaService.takePicture().then((res) => {
      if (res) {
        this.base64Image = `data:image/jpeg;base64,${res.base64String}`;
        this.sendPictureFile(this.base64Image);
      }
    });
  }

  sendPictureFile(file) {
    const id = Date.now().toString();
    const msg: ChatMessage = {
      id: id,
      userId: this.driver.id,
      userName: this.driver.firstname + ' ' + this.driver.lastname,
      userAvatar: this.driver.firstname[0] + this.driver.lastname[0],
      orderId: this.order.id,
      message: '',
      status: 'pending',
      type: MessageType.PHOTO,
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      profile: this.driver.role,
      company: this.driver.client.id,
      file: '',
    };
    this.discussionsService
      .sendMsg(msg, [file])
      .pipe(take(1))
      .subscribe(() => {});
  }

  reportIssue() {
    analytics.track('AppOrderIssue');
    // this.openChat('issue');
    if (
      this.order?.NEXT_STATUS <= STATUS.LOADED ||
      this.order?.NEXT_STATUS === 'ONSITE_LOADING_STARTED'
    ) {
      this.markAs('not_loaded', true);
    } else if (
      this.order?.NEXT_STATUS > STATUS.LOADED ||
      this.order?.NEXT_STATUS === 'ONSITE_DELIVERY_STARTED'
    ) {
      this.markAs('returned', true);
    }
  }

  openChat(action = '') {
    this.nextDestination = 'DISCUSSION_VIEW';
    this.router.navigate([`/discussions/${this.order.id}`], {
      state: { order: this.order, action },
    });
  }

  launchMap(location = 'from') {
    analytics.track('AppOrderNavigate');
    let destination = [];
    switch (location) {
      case 'from': {
        if (this.order.from.geo.lat && this.order.from.geo.lng) {
          destination = [this.order.from.geo.lat, this.order.from.geo.lng];
        }
        break;
      }
      case 'to': {
        if (this.order.to.geo.lat && this.order.to.geo.lng) {
          destination = [this.order.to.geo.lat, this.order.to.geo.lng];
        }
        break;
      }
      case 'auto': {
        destination =
          this.order.status <= STATUS.LOADED
            ? [this.order.from.geo.lat, this.order.from.geo.lng]
            : [this.order.to.geo.lat, this.order.to.geo.lng];
        break;
      }
      default: {
        destination =
          this.order.status <= STATUS.LOADED
            ? [this.order.from.geo.lat, this.order.from.geo.lng]
            : [this.order.to.geo.lat, this.order.to.geo.lng];
        break;
      }
    }

    let options = {
      appSelection: {
        dialogHeaderText: 'Sélecionnez une application',
        cancelButtonText: this.translateService.instant(`mobile.CANCEL`),
        rememberChoice: {
          prompt: {
            headerText: 'Remember your choice?',
            bodyText: 'Use the same app for navigating next time?',
            yesButtonText: this.translateService.instant(`mobile.YES`),
            noButtonText: 'No',
          },
        },
      },
    };
    this.subs['translate-1'] = this.translateService
      .get('mobile.prompt.dialogHeaderText')
      .subscribe(
        (value) => {
          options.appSelection.dialogHeaderText = value;
        },
        (err: any) => {
          console.error('ERROR', err);
        }
      );
    this.subs['translate-2'] = this.translateService
      .get('mobile.prompt.cancelButtonText')
      .subscribe(
        (value) => {
          options.appSelection.cancelButtonText = value;
        },
        (err: any) => {
          console.error('ERROR', err);
        }
      );
    this.subs['translate-3'] = this.translateService
      .get('mobile.prompt.rememberChoice.headerText')
      .subscribe(
        (value) => {
          options.appSelection.rememberChoice.prompt.headerText = value;
        },
        (err: any) => {
          console.error('ERROR', err);
        }
      );
    this.subs['translate-4'] = this.translateService
      .get('mobile.prompt.rememberChoice.bodyText')
      .subscribe(
        (value) => {
          options.appSelection.rememberChoice.prompt.bodyText = value;
        },
        (err: any) => {
          console.error('ERROR', err);
        }
      );
    this.subs['translate-5'] = this.translateService
      .get('mobile.prompt.rememberChoice.yesButtonText')
      .subscribe(
        (value) => {
          options.appSelection.rememberChoice.prompt.yesButtonText = value;
        },
        (err: any) => {
          console.error('ERROR', err);
        }
      );
    this.subs['translate-6'] = this.translateService
      .get('mobile.prompt.rememberChoice.noButtonText')
      .subscribe(
        (value) => {
          options.appSelection.rememberChoice.prompt.noButtonText = value;
        },
        (err: any) => {
          console.error('ERROR', err);
        }
      );

    this.launchNavigator.navigate(destination, options);
  }
}
