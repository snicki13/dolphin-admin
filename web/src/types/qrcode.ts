import type { QRCodeErrorCorrectionLevel } from 'qrcode'

/**
 * QR code configuration item
 * @description related parameters used to configure the QR code
 * -` Margin`: QR code edge
 * -` width`: QR code width
 * -`` ErrorCorrectionLevel`: QR code fault tolerance rate
 * @see
 * - [qrcode](https://www.npmjs.com/package/qrcode)
 */
export interface QRCodeOptions {
  margin?: number
  width?: number
  errorCorrectionLevel?: QRCodeErrorCorrectionLevel
}
