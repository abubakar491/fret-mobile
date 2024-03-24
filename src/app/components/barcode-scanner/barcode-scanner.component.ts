import { Component, NgZone, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import {
  Barcode,
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import { OrderScannerComponent } from '../order-scanner/order-scanner.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'freterium-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.scss'],
})
export class BarcodeScannerComponent implements OnInit {
  public readonly barcodeFormat = BarcodeFormat;
  public readonly lensFacing = LensFacing;

  public formGroup = new UntypedFormGroup({
    formats: new UntypedFormControl([]),
    lensFacing: new UntypedFormControl(LensFacing.Back),
    googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
    googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
  });
  public barcodes: Barcode[] = [];
  public isSupported = false;
  public isPermissionGranted = false;

  constructor(
    private readonly ngZone: NgZone,
    private modalCtrl: ModalController
  ) {}

  public ngOnInit(): void {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    BarcodeScanner.checkPermissions().then((result) => {
      this.isPermissionGranted = result.camera === 'granted';
    });
    BarcodeScanner.removeAllListeners().then(() => {
      BarcodeScanner.addListener(
        'googleBarcodeScannerModuleInstallProgress',
        (event) => {
          this.ngZone.run(() => {
            console.log('googleBarcodeScannerModuleInstallProgress', event);
            const { state, progress } = event;
            this.formGroup.patchValue({
              googleBarcodeScannerModuleInstallState: state,
              googleBarcodeScannerModuleInstallProgress: progress,
            });
          });
        }
      );
    });
  }

  async openScanner() {
    const formats = this.formGroup.get('formats')?.value || [];
    const lensFacing =
      this.formGroup.get('lensFacing')?.value || LensFacing.Back;

    const modal = await this.modalCtrl.create({
      component: OrderScannerComponent,
      // cssClass: 'barcode-scanning-modal',
      // showBackdrop: false,
      // You can pass data to the modal if needed:
      cssClass: 'barcode-scanning-modal',
      showBackdrop: false,
      componentProps: {
        formats: formats,
        lensFacing: lensFacing,
      },
    });

    await modal.present();

    modal.onDidDismiss().then((result) => {
      const barcode: Barcode | undefined = result.data?.barcode;
      if (barcode) {
        this.barcodes = [barcode];
      }
    });
  }

  public async openSettings(): Promise<void> {
    await BarcodeScanner.openSettings();
  }

  public async installGoogleBarcodeScannerModule(): Promise<void> {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  }

  public async requestPermissions(): Promise<void> {
    await BarcodeScanner.requestPermissions();
  }
}
