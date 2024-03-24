import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RefresherCustomEvent } from '@ionic/angular';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

import { DriverService } from './../../../core/services/driver.service';
import { DiscussionsService } from './../../../services/discussions.service';
import { Discussion, MessageType } from './../../../models';

@Component({
  selector: 'freterium-discussions-list',
  templateUrl: './discussions-list.page.html',
  styleUrls: ['./discussions-list.page.scss']
})
export class DiscussionsListPage {
  driver: any;
  refresher: RefresherCustomEvent;
  discussions: Array<Discussion>;
  currentLang = 'fr';
  messageTypes = MessageType;
  moment = moment;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private driverService: DriverService,
    private discussionsService: DiscussionsService
  ) {
    this.currentLang = this.translateService.currentLang;
    this.moment.locale(this.currentLang);
  }

  ionViewWillEnter() {
    this.driver = this.driverService.getDriver();
    this.getDiscussions();
  }

  getDiscussions() {
    this.discussionsService.getDiscussions().pipe(take(1)).subscribe((result: any) => {
      if (result && result.data) {
        // this.discussions = [];
        this.discussions = result.data;
        this.discussions.forEach(discussion => {
          discussion['text2'] = this.getJsonString(discussion.text)
        });
        console.log('this.discussions', this.discussions)
        if (typeof this.refresher !== 'undefined') {
          this.refresher.target.complete();
        }
      }
    });
  }

  getJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return str;
    }
    return JSON.parse(str);
  }

  doRefresh(refresher) {
    this.refresher = refresher;
    this.getDiscussions();
  }

  /**
   * @todo Open the discussion detail page.
   */
  openDiscussion(orderId: string) {
    this.router.navigate([`/discussions/${orderId}`], { state: { order: { id: orderId } } });
  }
}
