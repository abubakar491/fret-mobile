import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { DriverService } from '../../core/services/driver.service';

@Component({
  selector: 'freterium-settings',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  _user: any;
  _currentLang: string;
  languges = [
    { id: 'en', text: 'English' },
    { id: 'fr', text: 'Français' },
    { id: 'id', text: 'Indonesia' },
    { id: 'ar', text: 'عربي' },
    { id: 'ur_PK', text: 'اردو' },
  ];
  currentLangText = '';

  constructor(
    public driverService: DriverService,
    private translateService: TranslateService,
    public actionSheetController: ActionSheetController
  ) {
    
    this._currentLang = this.translateService.currentLang;
  }
  
  ngOnInit() {
    this._user = this.driverService.getDriver();
    this.currentLangText = (this.languges.find(o => o.id === this._currentLang))?.text;
  }

  async changeLanguge() {
    const actionSheet = await this.actionSheetController.create({
      buttons: this.languges.map((lang) => {
        return {
          text: lang.text,
          handler: () => {
            this.driverService.changeLanguge(lang.id);
            this.currentLangText = lang.text
          },
        };
      }),
    });
    await actionSheet.present();
  }
}
