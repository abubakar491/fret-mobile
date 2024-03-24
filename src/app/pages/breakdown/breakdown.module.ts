import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BreakdownRoutingModule } from './breakdown-routing.module';
import { BreakdownReasonsPage } from './breakdown-reasons/breakdown-reasons.page';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    BreakdownReasonsPage
  ],
  imports: [
    IonicModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    BreakdownRoutingModule
  ]
})
export class BreakdownModule { }
