import { Component } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

import { Order } from '../../models';
import { Driver } from './../../core/models';
import { OrderService } from '../../services/order.service';
import { DriverService } from '../../core/services/driver.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'freteium-report-problem',
  templateUrl: './report-problem.component.html',
  styleUrls: ['./report-problem.component.scss']
})
export class ReportProblemComponent {
  order: Order;
  infoButton: boolean;
  problem = {
    type: '',
    reason: '',
    return_reason_id: ''
  };
  setOtherReason = false;
  setReason = false;
  issuesList;
  selectedPhotos: string[] = [];
  forcePOR = false;
  driver: Driver;

  constructor(private popoverController: PopoverController, private navParams: NavParams, private orderService: OrderService, private driverService: DriverService, private alertController: AlertController) {}

  ionViewWillEnter() {
    this.order = this.navParams.get('order');
    this.infoButton = this.navParams.get('infoButton');
    this.issuesList = this.orderService.getStoredReturnReasons();
    this.getDriver();
    this.filterIssueList();
  }

  filterIssueList(){
    if (this.infoButton) {
      this.issuesList = this.issuesList.filter(issue => 
        issue.returnReasonsGroups.some(group => group.id === 5)
      );
    }  
  }

  getDriver(): void {
    this.driver = this.driverService.getDriver();
  }

  setProblem(type, id) {
    this.problem.type = type;
    this.problem.return_reason_id = id;
    this.setReason = true;
  }

  async sendProblem() {
    if (this.driver?.client?.forcePOR && this.selectedPhotos.length === 0) {
      const alert = await this.alertController.create({
        header: 'Photo Required',
        message: 'Please upload at least one photo to proceed.',
        buttons: ['OK']
      });

      await alert.present();
      return;
    }
    let data = { problem: this.problem, orderId: this.order.id, photos: this.selectedPhotos };
    this.popoverController.dismiss(data);
    this.selectedPhotos = [];
  }

  closePopover() {
    this.popoverController.dismiss({});
    this.selectedPhotos = [];
  }
}
