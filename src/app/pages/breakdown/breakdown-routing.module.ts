import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { BreakdownReasonsPage } from './breakdown-reasons/breakdown-reasons.page';

const routes: Routes = [
  {path: '', component: BreakdownReasonsPage, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BreakdownRoutingModule { }
