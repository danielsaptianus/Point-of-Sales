const fs = require('fs');
const path = 'c:/laragon/www/Point-of-Sales/frontend/src/components/pos/PaymentModal.vue';
let content = fs.readFileSync(path, 'utf8');

// Replace script section
content = content.replace(/const paymentMethod = ref<'CASH' \| 'QRIS' \| 'TRANSFER'>\('CASH'\);/, 
`const activeTab = ref<'CASH' | 'EWALLET' | 'TRANSFER'>('CASH');
const selectedMethod = ref<string>('CASH');`);

content = content.replace(/paymentMethod\.value/g, 'selectedMethod.value');

// Update reset logic
content = content.replace(/selectedMethod\.value = 'CASH';\s*isProcessing\.value = false;/g, 
`activeTab.value = 'CASH';
      selectedMethod.value = 'CASH';
      isProcessing.value = false;`);

// Update template tabs
content = content.replace(/<div class="payment-tabs">[\s\S]*?<\/div>/, 
`<div class="payment-tabs">
        <button
          class="method-tab"
          :class="{ active: activeTab === 'CASH' }"
          @click="activeTab = 'CASH'; selectedMethod = 'CASH'"
        >
          <Banknote :size="18" />
          <span>Tunai (Cash)</span>
        </button>
        <button
          class="method-tab"
          :class="{ active: activeTab === 'EWALLET' }"
          @click="activeTab = 'EWALLET'; selectedMethod = 'QRIS'"
        >
          <QrCode :size="18" />
          <span>E-Wallet & QRIS</span>
        </button>
        <button
          class="method-tab"
          :class="{ active: activeTab === 'TRANSFER' }"
          @click="activeTab = 'TRANSFER'; selectedMethod = 'BCA_VA'"
        >
          <CreditCard :size="18" />
          <span>Transfer / VA</span>
        </button>
      </div>`);

// Update CASH tab condition
content = content.replace(/v-if="selectedMethod === 'CASH'"/, 'v-if="activeTab === \'CASH\'"');

// Replace QRIS tab body
content = content.replace(/<div v-else-if="selectedMethod === 'QRIS'" class="tab-body qris-tab">[\s\S]*?<!-- Tab Content: TRANSFER -->/,
`<div v-else-if="activeTab === 'EWALLET'" class="tab-body">
        <div class="method-grid">
          <button class="method-card" :class="{ active: selectedMethod === 'QRIS' }" @click="selectedMethod = 'QRIS'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" alt="QRIS" class="method-logo" />
            <span>QRIS Umum</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'GOPAY' }" @click="selectedMethod = 'GOPAY'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg" alt="GoPay" class="method-logo" />
            <span>GoPay</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'SHOPEEPAY' }" @click="selectedMethod = 'SHOPEEPAY'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg" alt="ShopeePay" class="method-logo" />
            <span>ShopeePay</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'OVO' }" @click="selectedMethod = 'OVO'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/OVO_logo.svg" alt="OVO" class="method-logo" />
            <span>OVO</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'DANA' }" @click="selectedMethod = 'DANA'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" alt="DANA" class="method-logo" />
            <span>DANA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'LINKAJA' }" @click="selectedMethod = 'LINKAJA'">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/83/LinkAja.svg" alt="LinkAja" class="method-logo" />
            <span>LinkAja</span>
          </button>
        </div>
      </div>
      <!-- Tab Content: TRANSFER -->`);

// Replace TRANSFER tab body
content = content.replace(/<div v-else class="tab-body transfer-tab">[\s\S]*?<!-- Error Message -->/,
`<div v-else-if="activeTab === 'TRANSFER'" class="tab-body">
        <div class="method-grid">
          <button class="method-card" :class="{ active: selectedMethod === 'BCA_VA' }" @click="selectedMethod = 'BCA_VA'">
            <div class="bank-logo bca">BCA</div>
            <span>BCA VA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'MANDIRI_VA' }" @click="selectedMethod = 'MANDIRI_VA'">
            <div class="bank-logo mandiri">Mandiri</div>
            <span>Mandiri VA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'BNI_VA' }" @click="selectedMethod = 'BNI_VA'">
            <div class="bank-logo bni">BNI</div>
            <span>BNI VA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'BRI_VA' }" @click="selectedMethod = 'BRI_VA'">
            <div class="bank-logo bri">BRI</div>
            <span>BRI VA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'PERMATA_VA' }" @click="selectedMethod = 'PERMATA_VA'">
            <div class="bank-logo permata">Permata</div>
            <span>Permata VA</span>
          </button>
          <button class="method-card" :class="{ active: selectedMethod === 'CIMB_VA' }" @click="selectedMethod = 'CIMB_VA'">
            <div class="bank-logo cimb">CIMB</div>
            <span>CIMB Niaga</span>
          </button>
        </div>
      </div>
      <!-- Error Message -->`);

// Append CSS
const extraCss = `
.method-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.method-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-main);
  font-weight: 600;
  font-size: 0.85rem;
}
.method-card:hover {
  background: var(--bg-card-hover);
}
.method-card.active {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
}
.method-logo {
  width: 40px;
  height: 24px;
  object-fit: contain;
}
.bank-logo {
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: -0.5px;
  font-style: italic;
  width: 40px;
  text-align: center;
}
.bca { color: #0066AE; }
.mandiri { color: #003D79; }
.bni { color: #005E6A; color: #F15A23; } /* BNI uses orange/teal */
.bri { color: #00529C; }
.permata { color: #006885; }
.cimb { color: #8A1538; }
`;
content = content + extraCss;

fs.writeFileSync(path, content);
console.log('Update complete');
