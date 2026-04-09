import QRCode from 'qrcode';

const DEFAULT_CONTENT = 'https://github.com/htjworld/qraft';

export function generateQRMatrix(content: string): boolean[][] {
  try {
    const qrData = QRCode.create(content || DEFAULT_CONTENT, {
      errorCorrectionLevel: 'M',
    });
    const { modules } = qrData;
    const { size } = modules;
    const matrix: boolean[][] = [];
    for (let y = 0; y < size; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < size; x++) {
        row.push(modules.get(y, x) === 1);  // get(row, col) — BitMatrix API
      }
      matrix.push(row);
    }
    return matrix;
  } catch {
    return generateQRMatrix(DEFAULT_CONTENT);
  }
}
