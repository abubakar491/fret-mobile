import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Components } from '@ionic/core';
// import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { ApiProvider } from '../../../services/api/api';
import { OrderService } from '../../../services/order.service';



@Component({
  selector: 'freterium-transfer-modal',
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.scss'],
})
export class TransferModalComponent implements OnInit {

  @Input() modal: Components.IonModal;
  @Input() QRvalue;
  @Input() transfer_id;
  @Output() showPOD = new EventEmitter<string>();

  QRShow = false;
  // QRType: NgxQrcodeElementTypes.URL;
  // QRerrorCorrectionLevel: NgxQrcodeErrorCorrectionLevels.HIGH;
  QRWidth = 250;
  QRMargin = 2;


  reCheckIn = null;
  subscription: any;
  isTransferDone = false;


  constructor(private modalController: ModalController, private orderService: OrderService) { }

  ngOnInit() {
    this.checkTransfer();
  }

  @HostListener('window:popstate') dismissModal() {
    console.log('dismissModal', this.modalController);
    if (this.modalController) {
      this.modalController.dismiss();
      this.modalController = null;
    }
  }


  close() {
    let reload = false;
    this.subscription.unsubscribe();
    if (this.isTransferDone) {
      reload = true;
    }
    this.modal.dismiss(reload);
  }

  checkTransfer() {
    this.reCheckIn = 300;
    this.subscription = interval(2000).subscribe(x => {
      console.log("checkTransfer", this.transfer_id);
      this.orderService.getTransferCheck(this.transfer_id)
        .pipe(take(1))
        .subscribe(res => {
          if (res.status === 1) {
            this.subscription.unsubscribe();
            this.isTransferDone = true;
          }
        }, (err: any) => {
          console.log('err', err)
        });
      this.reCheckIn--;
      if (this.reCheckIn <= 0) {
        this.reCheckIn = null;
        this.subscription.unsubscribe();
        this.close();
      }
    });
  }

}
