import { Component, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { Components } from '@ionic/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';

import { Order } from '../../models';
import { Driver } from './../../core/models';
import { OrderService } from '../../services/order.service';
import { DriverService } from '../../core/services/driver.service';
import { MediaService } from './../../services/media.service';
import { ReturnStep } from '../../models/index'

@Component({
  selector: 'freterium-return-reasons',
  templateUrl: './return-reasons.component.html',
  styleUrls: ['./return-reasons.component.scss'],
})
export class ReturnReasonsComponent {
  @Input() modal: Components.IonModal;
  order: Order;
  state: string;
  type: string;
  problem = {
    type: '',
    reason: '',
    return_reason_id: ''
  };
  issuesList;
  issueListOrg;
  selectedPhotos: string[] = [];
  driver: Driver;
  showDropDownOptions = false;
  selectedReason: any;

  constructor(
    private mediaService: MediaService,
    private navParams: NavParams,
    private orderService: OrderService,
    private driverService: DriverService,
    private alertController: AlertController,
    public translateService: TranslateService,
  ) {}

  ionViewWillEnter() {
    this.order = this.navParams.get('order');
    this.type = this.navParams.get('type');
    this.state = this.navParams.get('state');
    this.getDriver();
    this.issuesList = this.orderService.getStoredReturnReasons();
    this.filterIssuesList(); // Filter the issuesList based on the state
  }

  getDriver(): void {
    this.driver = this.driverService.getDriver();
  }

  takePicture(type?) {
    this.mediaService.takePicture().then((res) => {
      if (res) {
        this.selectedPhotos.push(`data:image/jpeg;base64,${res.base64String}`);
      }
    });
  }

  close() {
    this.modal.dismiss(false);
  }

  removePicture(index: number) {
    this.selectedPhotos.splice(index, 1);
  }

  toggleDropDownOptions() {
    this.showDropDownOptions = !this.showDropDownOptions;
  }

  setProblem(event: any) {
    this.problem.type = event?.value?.text;
    this.problem.return_reason_id = event?.value?.id;
    this.showDropDownOptions = false;
  }

  async sendProblem() {
    let header;
    let message;
    if(!this.problem.type){
      header = this.translateService.instant('mobile.returnReason.selectReasonRequired');
      message = this.translateService.instant('mobile.returnReason.selectReasonAlert');
    }

    //if state is not 'partial_delivery' then photo is required
    if (this.state !== 'partial_delivery' && this.driver?.client?.forcePOR && this.selectedPhotos.length === 0) {
      header = this.translateService.instant('mobile.returnReason.selectPhotoRequired');
      message = this.translateService.instant('mobile.returnReason.selectPhoto');
    }

    if(header){
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: ['OK']
      });

      await alert.present();
      return;
    }
    let data = { problem: this.problem, orderId: this.order.id, photos: this.selectedPhotos };
    this.modal.dismiss(data);
    this.selectedPhotos = [];
  }


  filterIssuesList() {
    if (this.state === 'not_loaded') {
      // Show options with id NotLoaded and Other when state is 'not_loaded'
      this.issuesList = this.issuesList.filter(issue =>
        issue.returnReasonsGroups.some(group => group.id === ReturnStep.NotLoaded || group.id === ReturnStep.Other)
      );
    } else if (this.state === 'returned') {
      // Show options with id Returned and Other when state is 'returned'
      this.issuesList = this.issuesList.filter(issue =>
        issue.returnReasonsGroups.some(group => group.id === ReturnStep.Returned || group.id === ReturnStep.Other)
      );
    } else if (this.state === 'partial_delivery' && this.type === 'POD') {
      // Show options with id PartialDelivery and Other when state is 'partial_delivery'
      this.issuesList = this.issuesList.filter(issue =>
        issue.returnReasonsGroups.some(group => group.id === ReturnStep.PartialDelivery || group.id === ReturnStep.Other)
      );
    } else {
      // Default filter condition
      this.issuesList = this.issuesList.filter(issue =>
        issue.returnReasonsGroups.some(group => group.id === ReturnStep.PartialLoaded || group.id === ReturnStep.Other)
      );
    }
  }

  transaltedIssuesList() {
    return this.issuesList?.map(issue => ({...issue, translatedText: this.translateService.instant(issue.text)})) || []
  }
}
