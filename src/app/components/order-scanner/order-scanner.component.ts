import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  Barcode,
  BarcodeScanner,
} from '@capacitor-mlkit/barcode-scanning';
import { ModalController, ToastController } from '@ionic/angular';

interface ProductLineItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  loadedCount: number | null;
  deliveredCount: number;
  value: number;
  customerCurrency: string | null;
  orderedCount: number;
  product: {
    id: string;
    name: string;
    code: string;
    price: number;
    category: string | null;
    scanCode: string | null;
  };
  selectedQuantity: number;
  expectedQuantity: number;
  checked: boolean;
  indeterminate: boolean;
}

interface ScanCount {
  id: string;
  expectedQuantity: number;
  scannedQuantity: number;
}

@Component({
  selector: 'app-order-scanner',
  templateUrl: './order-scanner.component.html',
  styleUrls: ['./order-scanner.component.scss'],
})
export class OrderScannerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('square') squareElement!: ElementRef<HTMLDivElement>;
  @Input() productLineItem: ProductLineItem[];
  private productCountMap: { [productName: string]: ScanCount } = {};

  private scannerListener: any;
  public barcodeArr: any[] = [];
  showNotification = false;
  notificationMessage = '';
  throttling = false;

  constructor(
    private readonly ngZone: NgZone,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.barcodeArr = [];
    this.productLineItem.forEach(item => {
      this.productCountMap[item.product.name] = {
        id: item.id,
        expectedQuantity: item.expectedQuantity,
        scannedQuantity: 0
      };
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.startScan();
    }, 500);
  }

  ngOnDestroy(): void {
    this.stopScan();
    if (this.scannerListener) {
      this.scannerListener.remove();
    }
  }

  private updateDisplayList(): void {
    this.barcodeArr = Object.entries(this.productCountMap).map(([productName, scanData]) => {
      return {
        id: scanData.id,
        name: productName,
        expectedQuantity: scanData.expectedQuantity,
        scannedQuantity: scanData.scannedQuantity,
        isComplete: scanData.scannedQuantity >= scanData.expectedQuantity
      };
    });
  }
  

  getCompletedItemCount(): number {
    return this.barcodeArr.filter((item) => item.isComplete).length;
  }

  closeScanner() {
    // Call this method to close the scanner without completing the scan
    this.modalController.dismiss();
  }

  private startScan(): void {
    document.querySelector('body')?.classList.add('barcode-scanning-active');
    BarcodeScanner.startScan();
    this.scannerListener = this.addScannerListener();
  }

  private addScannerListener(): void {
    let lastInvocationTime = 0;
    const throttleDelay = 1500; // 1500 milliseconds (1.5 seconds) delay

    BarcodeScanner.addListener('barcodeScanned', (event) => {
      if (!this.isBarcodeWithinRectangle(event.barcode)) {
        console.log('Barcode not within the rectangle');
        return;
      }
      this.ngZone.run(() => {
        const currentTime = Date.now();

        // Check if throttling is in effect or not
        if (!this.throttling) {
          const barcodeValue = event.barcode.displayValue;

          // Process the scanned barcode
          this.handleBarcodeScanned(barcodeValue);
          this.throttling = true;
          setTimeout(() => {
            this.throttling = false;
          }, throttleDelay);

          // Update the last invocation time
          lastInvocationTime = currentTime;
        } else {
          console.log('Scan ignored due to throttling');
        }
      });
    });
  }

  handleBarcodeScanned(barcodeValue: string) {
    const scannedProduct = this.productLineItem.find(item => item.product.scanCode === barcodeValue);
    if (!scannedProduct) {
      this.showCustomNotification(`SKU not found in order: ${barcodeValue}`);
      return;
    }

    const tracking = this.productCountMap[scannedProduct.product.name];
    if (tracking.scannedQuantity < tracking.expectedQuantity) {
      // Increment the scanned quantity
      tracking.scannedQuantity++;
      this.showCustomNotification(`Scanned ${scannedProduct.product.name}: ${tracking.scannedQuantity}/${tracking.expectedQuantity}`);
      
      // If reached expected quantity, optionally show a different message
      if (tracking.scannedQuantity === tracking.expectedQuantity) {
        this.showCustomNotification(`${scannedProduct.product.name} quantity fulfilled.`);
      }
    } else {
      this.showCustomNotification(`Expected quantity for ${scannedProduct.product.name} already reached.`);
    }

    // Update the display list after processing the scan
    this.updateDisplayList();
  }

  async showCustomNotification(message: string) {
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.notificationMessage = '';
      this.showNotification = false;
    }, 2000);
  }

  completeOrder() {
    this.modalController.dismiss({
      scannedItems: this.barcodeArr
    });
    this.stopScan();
  }

  private isBarcodeWithinRectangle(barcode: Barcode): boolean {
    const scaledRect = this.getScaledRectangle();
    const detectionCornerPoints = scaledRect
      ? [
          [scaledRect.left, scaledRect.top],
          [scaledRect.left + scaledRect.width, scaledRect.top],
          [
            scaledRect.left + scaledRect.width,
            scaledRect.top + scaledRect.height,
          ],
          [scaledRect.left, scaledRect.top + scaledRect.height],
        ]
      : undefined;

    const cornerPoints = barcode.cornerPoints;
    if (detectionCornerPoints && cornerPoints) {
      return !(
        detectionCornerPoints[0][0] > cornerPoints[0][0] ||
        detectionCornerPoints[0][1] > cornerPoints[0][1] ||
        detectionCornerPoints[1][0] < cornerPoints[1][0] ||
        detectionCornerPoints[1][1] > cornerPoints[1][1] ||
        detectionCornerPoints[2][0] < cornerPoints[2][0] ||
        detectionCornerPoints[2][1] < cornerPoints[2][1] ||
        detectionCornerPoints[3][0] > cornerPoints[3][0] ||
        detectionCornerPoints[3][1] < cornerPoints[3][1]
      );
    }
    return true;
  }

  private getScaledRectangle() {
    const rect = this.squareElement?.nativeElement.getBoundingClientRect();
    //15% margin for each side
    const marginWidth = rect.width * 0.15;
    const marginHeight = rect.height * 0.15;
    //rectangle dimensions to only include the central area
    return {
      left: (rect.left + marginWidth) * window.devicePixelRatio,
      right: (rect.right - marginWidth) * window.devicePixelRatio,
      top: (rect.top + marginHeight) * window.devicePixelRatio,
      bottom: (rect.bottom - marginHeight) * window.devicePixelRatio,
      width: (rect.width - 2 * marginWidth) * window.devicePixelRatio,
      height: (rect.height - 2 * marginHeight) * window.devicePixelRatio,
    };
  }

  private stopScan(): void {
    document.querySelector('body')?.classList.remove('barcode-scanning-active');
    BarcodeScanner.stopScan();
  }
}
