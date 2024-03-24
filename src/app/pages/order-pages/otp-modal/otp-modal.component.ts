import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Components } from '@ionic/core';
import { interval, Subscription } from 'rxjs';
import { ApiProvider } from '../../../services/api/api';



@Component({
  selector: 'freterium-otp-modal',
  templateUrl: './otp-modal.component.html',
  styleUrls: ['./otp-modal.component.scss'],
})
export class OtpModalComponent implements OnInit {

  @Input() modal: Components.IonModal;
  @Input() order;
  @Output() showPOD = new EventEmitter<string>();

  OTP = ['', '', '', ''];

  resendIn = null;
  private subscription: Subscription;
  OtpError: boolean;


  constructor(private modalController: ModalController, private api: ApiProvider) { }

  ngOnInit() {
    console.log('this.order.OTP', this.order.OTP)
  }

  @HostListener('window:popstate') dismissModal() {
    console.log('dismissModal', this.modalController);
    if (this.modalController) {
      this.modalController.dismiss();
      this.modalController = null;
    }
  }


  otpController(event, next, prev) {

    this.OtpError = null;
    if (this.OTP.join('').length > 3) {
      this.submit();
    }
    if (event.target.value.length < 1 && prev) {
      prev.setFocus()
    }
    else if (next && event.target.value.length > 0) {
      next.setFocus();
    }
    else {
      return 0;
    }
  }

  close() {
    this.modal.dismiss(false);
  }

  submit() {
    if (this.order.OTP === parseInt(this.OTP.join(''))) {
      this.modal.dismiss(true);
    } else {
      this.OtpError = true;
    }
  }

  resendOTP() {
    this.api.get('/orders/' + this.order.uuid + '/send-otp', '', {}).toPromise().then((res) => {
      console.log('resendOTP res', res);
    });

    this.resendIn = 30;

    this.subscription = interval(1000).subscribe(x => {
      this.resendIn--;
      if (this.resendIn <= 0) {
        this.resendIn = null;
        this.subscription.unsubscribe();
      }
    });
  }
}
