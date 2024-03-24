import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { AuthGuard } from "../../core/guards/auth.guard";
import { SharedModule } from "../../shared/shared.module";
import { DiscussionDetailPage } from "./discussion-detail/discussion-detail.page";
import { DiscussionsListPage } from "./discussions-list/discussions-list.page";
import { DateFormatPipe } from "../../pipes/date-time/date-format.pipe";


const routes: Routes = [
    {
        path: '',
        component: DiscussionsListPage,
        canActivate: [AuthGuard]
    },
    {
        path: ':orderId',
        component: DiscussionDetailPage,
        canActivate: [AuthGuard]
    }
]

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forChild(routes),
    ],
    declarations: [
        DiscussionsListPage, 
        DiscussionDetailPage,
        DateFormatPipe
    ]
})
export default class DiscussionPagesModule { }