import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { LaunchNavigator } from "@awesome-cordova-plugins/launch-navigator/ngx";
import { IonicModule } from "@ionic/angular";
import { ConfirmLoadingComponent } from "../../components/confirm-loading/confirm-loading.component";
import { OrderPaymentsComponent } from "../../components/order-payments/order-payments.component";
import { ReportProblemComponent } from "../../components/report-problem/report-problem.component";
import { ReturnReasonsComponent } from "../../components/return-reasons/return-reasons.component";
import { AuthGuard } from "../../core/guards/auth.guard";
import { DateAddPipe } from "../../pipes/date-time/date-add.pipe";
import { DateDiffDurationPipe } from "../../pipes/date-time/date-diff-duration.pipe";
import { DateDiffPipe } from "../../pipes/date-time/date-diff.pipe";
import { DateFormatPipe } from "../../pipes/date-time/date-format.pipe";
import { FromNowPipe } from "../../pipes/date-time/from-now.pipe";
import { MinuteToHourPipe } from "../../pipes/date-time/minute-to-hour.pipe";
import { FilterPipe } from "../../pipes/filter.pipe";
import { SharedModule } from "../../shared/shared.module";
import { EditOrderPage } from "./edit-order/edit-order.page";
import { OrderDetailsPage } from "./order-details/order-details.page";
import { OrdersPage } from "./orders/orders.page";
import { OtpModalComponent } from "./otp-modal/otp-modal.component";
import { OrderScannerComponent } from  "../../components/order-scanner/order-scanner.component";


// import { LongPressModule } from 'ionic-long-press';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

import { TransferModalComponent } from "./transfer-modal/transfer-modal.component";
// import { IonicSelectableModule } from 'ionic-selectable';


const routes: Routes = [
    {
        path: '',
        component: OrdersPage,
        canActivate: [AuthGuard]
    },
    {
        path: ':orderId/edit',
        component: EditOrderPage,
        canActivate: [AuthGuard]
    }
]

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        FormsModule,
        // LongPressModule,
        NgxQRCodeModule,
        // IonicSelectableModule
    ],
    declarations: [
        OrdersPage,
        EditOrderPage,
        OrderDetailsPage,
        ReturnReasonsComponent,
        ConfirmLoadingComponent,
        ReportProblemComponent,
        OrderPaymentsComponent,
        OtpModalComponent,
        OrderScannerComponent,
        TransferModalComponent,
        FilterPipe,
        FromNowPipe,
        DateDiffPipe,
        DateDiffDurationPipe,
        DateAddPipe,
        DateFormatPipe,
        MinuteToHourPipe,
    ],
    providers: [
        LaunchNavigator,
    ]
})
export default class OrderPagesModule { }
