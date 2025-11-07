const fs = require('fs');
const path = require('path');

// Đọc file .env
const envPath = path.join(__dirname, '..', '.env');
const appJsonPath = path.join(__dirname, '..', 'app.json');

if (!fs.existsSync(envPath)) {
  console.error('File .env không tồn tại!');
  process.exit(1);
}

// Đọc .env
let envContent = fs.readFileSync(envPath, 'utf8');
// Loại bỏ BOM nếu có
if (envContent.charCodeAt(0) === 0xFEFF) {
  envContent = envContent.slice(1);
}
const envVars = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      // Loại bỏ tất cả ký tự null và ký tự không in được
      const cleanKey = key.trim().replace(/[\0\uFFFD\uFEFF]/g, '').replace(/[^\x20-\x7E]/g, '');
      const cleanValue = valueParts.join('=').trim().replace(/[\0\uFFFD\uFEFF]/g, '').replace(/\r/g, '');
      // Chỉ thêm nếu key chỉ chứa ký tự hợp lệ (chữ, số, _, -)
      if (cleanKey && cleanValue && /^[A-Za-z0-9_]+$/.test(cleanKey)) {
        envVars[cleanKey] = cleanValue;
      }
    }
  }
});

// Đọc app.json
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Cập nhật extra với các biến từ .env
if (!appJson.expo.extra) {
  appJson.expo.extra = {};
}

// Giữ lại các giá trị hiện có (như eas.projectId)
const currentExtra = { ...appJson.expo.extra };

// Xóa các key có ký tự null hoặc không hợp lệ
Object.keys(currentExtra).forEach(key => {
  if (key.includes('\0') || key.includes('')) {
    delete currentExtra[key];
  }
});

// Merge với biến từ .env (chỉ merge các key hợp lệ)
const cleanEnvVars = {};
Object.keys(envVars).forEach(key => {
  // Key đã được validate ở trên, chỉ cần kiểm tra lại
  if (key && /^[A-Za-z0-9_]+$/.test(key)) {
    cleanEnvVars[key] = envVars[key];
  }
});

// Merge: giữ lại eas nếu có, thêm env vars
appJson.expo.extra = {
  ...(currentExtra.eas ? { eas: currentExtra.eas } : {}),
  ...cleanEnvVars
};

// Ghi lại app.json
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2), 'utf8');

console.log('✅ Đã đồng bộ biến môi trường từ .env vào app.json:');
Object.keys(envVars).forEach(key => {
  console.log(`   ${key} = ${envVars[key]}`);
});

