import { ref } from 'vue';

// Standard BLE UART / SPP UUIDs used by many thermal printers (like Eppos, Zjiang, etc.)
const PRINTER_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard BLE Printer
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Generic UART
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Other common BLE SPP
  '0000fee7-0000-1000-8000-00805f9b34fb'  // generic
];

export const isBluetoothConnected = ref(false);
export const connectedDeviceName = ref('');

let bluetoothDevice: BluetoothDevice | null = null;
let writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

/**
 * Request Bluetooth device from user and connect to it
 */
export async function connectPrinter(): Promise<boolean> {
  if (!navigator.bluetooth) {
    alert('Browser Anda tidak mendukung Web Bluetooth API. Gunakan Google Chrome atau Edge versi terbaru.');
    return false;
  }

  try {
    console.log('Requesting Bluetooth Device...');
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICE_UUIDS
    });

    if (!bluetoothDevice) return false;

    console.log('Connecting to GATT Server...');
    const server = await bluetoothDevice.gatt?.connect();
    
    if (!server) {
      throw new Error('GATT Server not available');
    }

    // Try to find a valid printing service
    let service: BluetoothRemoteGATTService | null = null;
    let foundUuid = '';
    
    for (const uuid of PRINTER_SERVICE_UUIDS) {
      try {
        service = await server.getPrimaryService(uuid);
        if (service) {
          foundUuid = uuid;
          break;
        }
      } catch (e) {
        // Continue searching
      }
    }

    if (!service) {
      throw new Error('Tidak menemukan service printing (SPP/UART) di perangkat ini. Pastikan Anda memilih perangkat printer yang benar.');
    }

    console.log(`Found service: ${foundUuid}`);
    
    // Find the characteristic to write to
    const characteristics = await service.getCharacteristics();
    for (const char of characteristics) {
      if (char.properties.write || char.properties.writeWithoutResponse) {
        writeCharacteristic = char;
        break;
      }
    }

    if (!writeCharacteristic) {
      throw new Error('Tidak menemukan characteristic untuk menulis data ke printer.');
    }

    // Handle disconnection
    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);

    isBluetoothConnected.value = true;
    connectedDeviceName.value = bluetoothDevice.name || 'Printer Bluetooth';
    return true;

  } catch (error: any) {
    console.error('Bluetooth Connection Error:', error);
    if (error.name !== 'NotFoundError') {
      alert('Gagal menghubungkan ke printer: ' + error.message);
    }
    disconnectPrinter();
    return false;
  }
}

export function disconnectPrinter() {
  if (bluetoothDevice && bluetoothDevice.gatt?.connected) {
    bluetoothDevice.gatt.disconnect();
  }
  onDisconnected();
}

function onDisconnected() {
  isBluetoothConnected.value = false;
  connectedDeviceName.value = '';
  writeCharacteristic = null;
  bluetoothDevice = null;
}

/**
 * Send raw byte data to the printer in chunks
 * BLE has limited packet size (typically 20-512 bytes)
 */
async function sendRawData(data: Uint8Array) {
  if (!writeCharacteristic) {
    throw new Error('Printer belum terhubung.');
  }

  console.log(`Sending ${data.length} bytes to printer...`);
  const CHUNK_SIZE = 20; // Safe limit for BLE (default MTU is 23 bytes)
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    try {
      if (writeCharacteristic.properties.writeWithoutResponse) {
        await writeCharacteristic.writeValueWithoutResponse(chunk);
      } else {
        await writeCharacteristic.writeValue(chunk);
      }
    } catch (e: any) {
      console.warn(`Error writing chunk ${i}:`, e);
      // Try fallback to the other write method
      try {
        await writeCharacteristic.writeValue(chunk);
      } catch (err) {
        console.error('Fallback write failed', err);
      }
    }
    // Small delay to prevent overwhelming the printer buffer
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

// === ESC/POS GENERATOR ===

class EscPosBuilder {
  private buffer: number[] = [];
  
  // 32 chars is standard for 58mm thermal printers (Font A)
  private readonly LINE_WIDTH = 32; 

  init() {
    this.buffer.push(0x1B, 0x40);
    return this;
  }

  alignCenter() {
    this.buffer.push(0x1B, 0x61, 1);
    return this;
  }

  alignLeft() {
    this.buffer.push(0x1B, 0x61, 0);
    return this;
  }

  alignRight() {
    this.buffer.push(0x1B, 0x61, 2);
    return this;
  }

  bold(on: boolean) {
    this.buffer.push(0x1B, 0x45, on ? 1 : 0);
    return this;
  }
  
  doubleHeightWidth(on: boolean) {
    // 0x1B 0x21 n (where n=0x30 is double height and width)
    this.buffer.push(0x1B, 0x21, on ? 0x30 : 0x00);
    return this;
  }

  text(str: string) {
    // Simple ASCII encoding (works for standard indonesian characters)
    for (let i = 0; i < str.length; i++) {
      this.buffer.push(str.charCodeAt(i));
    }
    return this;
  }

  newline() {
    this.buffer.push(0x0A);
    return this;
  }
  
  textLine(str: string) {
    return this.text(str).newline();
  }

  feed(lines: number) {
    this.buffer.push(0x1B, 0x64, lines);
    return this;
  }

  divider() {
    return this.textLine('-'.repeat(this.LINE_WIDTH));
  }
  
  dividerThin() {
    return this.textLine('.'.repeat(this.LINE_WIDTH));
  }

  // Format "Label        Value" to fit exactly 32 chars
  rowTwoColumns(label: string, value: string) {
    let availableSpace = this.LINE_WIDTH - value.length;
    let labelStr = label;
    if (label.length > availableSpace - 1) {
      labelStr = label.substring(0, availableSpace - 1);
    }
    const spaces = ' '.repeat(this.LINE_WIDTH - labelStr.length - value.length);
    return this.textLine(labelStr + spaces + value);
  }

  build(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Format and print transaction receipt
 */
export async function printReceiptBluetooth(transaction: any): Promise<boolean> {
  if (!isBluetoothConnected.value) {
    const connected = await connectPrinter();
    if (!connected) return false;
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('id-ID'); // "10.000" without Rp to save space
  };

  const builder = new EscPosBuilder();
  builder.init();
  
  // Header
  builder.alignCenter().bold(true).doubleHeightWidth(true).textLine('NEXUS POS');
  builder.doubleHeightWidth(false).bold(false);
  builder.textLine('Jl. Jendral Sudirman No. 123');
  builder.textLine('Telp: 08123456789');
  builder.newline();
  
  // Meta
  builder.alignLeft();
  builder.textLine(`No: ${transaction.invoice_number || transaction.id}`);
  builder.textLine(`Tgl: ${new Date(transaction.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}`);
  builder.textLine(`Kasir: ${transaction.cashier_name || 'Admin'}`);
  
  builder.divider();

  // Items
  const items = transaction.items || transaction.transaction_items || [];
  for (const item of items) {
    const itemName = item.product_name || (item.product ? item.product.name : 'Item');
    const qty = item.quantity;
    const price = item.price || item.price_at_time || 0;
    const sub = item.subtotal || (qty * price);
    
    // Print item name (wrap if too long)
    if (itemName.length > 32) {
      builder.textLine(itemName.substring(0, 32));
      builder.textLine(itemName.substring(32));
    } else {
      builder.textLine(itemName);
    }
    
    // Print qty x price and total
    const qtyPrice = `${qty} x ${formatPrice(price)}`;
    const subStr = formatPrice(sub);
    builder.rowTwoColumns(qtyPrice, subStr);
  }

  builder.divider();

  // Totals
  const subtotal = transaction.total_amount - transaction.tax_amount + transaction.discount_amount;
  builder.rowTwoColumns('Subtotal', formatPrice(subtotal));
  
  if (transaction.discount_amount > 0) {
    builder.rowTwoColumns('Diskon', '-' + formatPrice(transaction.discount_amount));
  }
  
  builder.rowTwoColumns('PPN (11%)', formatPrice(transaction.tax_amount));
  
  builder.dividerThin();
  builder.bold(true).rowTwoColumns('TOTAL', formatPrice(transaction.total_amount)).bold(false);
  
  builder.newline();
  const paymentMethod = transaction.payment?.payment_method || 'CASH';
  builder.rowTwoColumns('Metode', paymentMethod);
  
  // Footer
  builder.newline();
  builder.alignCenter();
  builder.textLine('Terima Kasih');
  builder.textLine('Barang yang sudah dibeli');
  builder.textLine('tidak dapat ditukar/dikembalikan');
  
  // Feed paper so it can be torn off cleanly
  builder.feed(4);

  const bytes = builder.build();
  
  try {
    console.log('Starting print job...');
    await sendRawData(bytes);
    console.log('Print job finished');
    return true;
  } catch (error: any) {
    console.error('Print Error:', error);
    alert('Gagal mencetak: ' + error.message);
    return false;
  }
}
