import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrCodeScannerComponent } from './components/qr-code-scanner.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { QrCodeScannerDirective } from './directives/qr-code-scanner.directive';

@NgModule({
  declarations: [QrCodeScannerComponent, QrCodeScannerDirective],
  imports: [CommonModule, ZXingScannerModule],
  exports: [QrCodeScannerDirective],
})
export class QrCodeScannerModule {}
