import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('🚀 Khởi động Chrome để test UI với Role Admin và Role Giáo viên...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Lắng nghe console log để tự động bắt mã OTP 2FA nếu có
  let currentOtp = null;
  page.on('console', (msg) => {
    const text = msg.text();
    console.log('[Browser Console]:', text);
    const match = text.match(/Mã xác thực OTP 2FA:\s*(\d{6})/);
    if (match) {
      currentOtp = match[1];
      console.log('🔑 Đã bắt được mã OTP:', currentOtp);
    }
  });

  try {
    console.log('--- TEST 1: ĐĂNG NHẬP VỚI ROLE ADMIN THẬT (nguyentuananh11a1.lhpt@gmail.com) ---');
    await page.goto(`${BASE_URL}/dang-nhap`, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1500);

    // Điền form đăng nhập
    await page.type('input[name="email"], input[type="text"], input[type="email"]', 'nguyentuananh11a1.lhpt@gmail.com');
    await sleep(500);
    await page.type('input[name="password"], input[type="password"]', 'Password123@');
    await sleep(500);

    // Click nút Đăng nhập
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
    }
    await sleep(2500);

    // Kiểm tra xem có chuyển sang bước nhập OTP không
    const otpInputs = await page.$$('input[data-otp-index], input[aria-label*="OTP"], input[maxlength="1"]');
    if (otpInputs.length === 6 && currentOtp) {
      console.log('Điền 6 ký tự OTP:', currentOtp);
      for (let i = 0; i < 6; i++) {
        await otpInputs[i].type(currentOtp[i]);
        await sleep(150);
      }
      await sleep(2500);
    }

    console.log('URL hiện tại sau đăng nhập Admin:', page.url());
    await sleep(2000);

    // Kiểm tra trang Dashboard Admin
    console.log('Kiểm tra Dashboard...');
    await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle0' });
    await sleep(2000);

    // Kiểm tra trang Phân quyền Admin & Tab Ma trận
    console.log('Kiểm tra trang Phân quyền & Ma trận phân quyền...');
    await page.goto(`${BASE_URL}/app/phan-quyen`, { waitUntil: 'networkidle0' });
    await sleep(2500);

    // Tìm và click nút "Ma trận phân quyền (4 vai trò)"
    const buttons = await page.$$('button');
    let matrixBtnFound = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Ma trận phân quyền')) {
        console.log('Đã tìm thấy tab Ma trận phân quyền, click vào tab...');
        await btn.click();
        matrixBtnFound = true;
        break;
      }
    }
    await sleep(2500);

    // Kiểm tra bảng ma trận phân quyền
    const matrixTable = await page.$('table');
    if (matrixTable) {
      console.log('✅ Bảng ma trận phân quyền đã hiển thị thành công!');
    } else {
      console.log('⚠️ Không tìm thấy bảng ma trận');
    }
    await sleep(2000);

    // Thử click nút Lưu (Ctrl + S) trong ma trận
    const saveBtns = await page.$$('button');
    for (const sBtn of saveBtns) {
      const sText = await page.evaluate(el => el.textContent, sBtn);
      if (sText && sText.includes('Lưu (Ctrl + S)')) {
        console.log('Click nút Lưu (Ctrl + S) trên ma trận...');
        await sBtn.click();
        break;
      }
    }
    await sleep(2500);

    // Kiểm tra các trang khác của Admin
    console.log('Kiểm tra trang Học viên (/app/hoc-vien)...');
    await page.goto(`${BASE_URL}/app/hoc-vien`, { waitUntil: 'networkidle0' });
    await sleep(2000);

    console.log('Kiểm tra trang Nhật ký hoạt động (/app/nhat-ky)...');
    await page.goto(`${BASE_URL}/app/nhat-ky`, { waitUntil: 'networkidle0' });
    await sleep(2000);

    // Đăng xuất Admin
    console.log('Đăng xuất Admin để chuẩn bị test Role Giáo viên...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${BASE_URL}/dang-nhap`, { waitUntil: 'networkidle0' });
    await sleep(2000);

    // --- TEST 2: ĐĂNG NHẬP VỚI ROLE GIÁO VIÊN THẬT (anhn07929@gmail.com) ---
    console.log('--- TEST 2: ĐĂNG NHẬP VỚI ROLE GIÁO VIÊN THẬT (anhn07929@gmail.com) ---');
    currentOtp = null;
    await page.type('input[name="email"], input[type="text"], input[type="email"]', 'anhn07929@gmail.com');
    await sleep(500);
    await page.type('input[name="password"], input[type="password"]', 'Password123@');
    await sleep(500);

    const submitBtnTeacher = await page.$('button[type="submit"]');
    if (submitBtnTeacher) {
      await submitBtnTeacher.click();
    }
    await sleep(2500);

    const otpInputsTeacher = await page.$$('input[data-otp-index], input[aria-label*="OTP"], input[maxlength="1"]');
    if (otpInputsTeacher.length === 6 && currentOtp) {
      console.log('Điền 6 ký tự OTP Giáo viên:', currentOtp);
      for (let i = 0; i < 6; i++) {
        await otpInputsTeacher[i].type(currentOtp[i]);
        await sleep(150);
      }
      await sleep(2500);
    }

    console.log('URL hiện tại sau đăng nhập Giáo viên:', page.url());
    await sleep(2000);

    // Kiểm tra giao diện Workspace Giáo viên
    console.log('Kiểm tra Dashboard Giáo viên (/app)...');
    await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle0' });
    await sleep(2500);

    console.log('Kiểm tra trang Lớp học (/app/lop-hoc)...');
    await page.goto(`${BASE_URL}/app/lop-hoc`, { waitUntil: 'networkidle0' });
    await sleep(2500);

    console.log('Kiểm tra trang Gói dịch vụ (/app/goi-dich-vu)...');
    await page.goto(`${BASE_URL}/app/goi-dich-vu`, { waitUntil: 'networkidle0' });
    await sleep(2500);

    console.log('Kiểm tra bảo mật RBAC: Giáo viên không được vào trang phân quyền (/app/phan-quyen)...');
    await page.goto(`${BASE_URL}/app/phan-quyen`, { waitUntil: 'networkidle0' });
    await sleep(2500);
    const teacherBlockedUrl = page.url();
    console.log('URL khi giáo viên cố truy cập /app/phan-quyen:', teacherBlockedUrl);

    console.log('🎉 Hoàn tất kiểm thử tự động trên màn hình!');
    await sleep(5000);
  } catch (error) {
    console.error('Lỗi trong quá trình kiểm thử:', error);
  } finally {
    await browser.close();
  }
}

run();

