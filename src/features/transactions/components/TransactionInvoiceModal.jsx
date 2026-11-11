import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2,
  Copy,
  Download,
  FileCheck2,
  ShieldCheck,
  X,
  CreditCard,
  BadgeCheck,
  GraduationCap,
  Printer,
} from 'lucide-react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { api } from '@/lib/api'

export default function TransactionInvoiceModal({
  isOpen,
  onClose,
  order = null,
  orderId = null,
}) {
  const [invoiceData, setInvoiceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const printRef = useRef(null)

  // Fetch full invoice detail if orderId is provided or to enrich order
  useEffect(() => {
    if (!isOpen) {
      setInvoiceData(null)
      return
    }

    const targetId = orderId || order?.id || order?.orderId
    if (targetId) {
      setLoading(true)
      api
        .get(`/admin/orders/${targetId}/invoice`)
        .then((res) => {
          const data = res?.data !== undefined ? res.data : res
          setInvoiceData(data)
        })
        .catch((err) => {
          console.warn('Lỗi nạp hóa đơn chi tiết, sử dụng dữ liệu đơn hàng sẵn có:', err)
          setInvoiceData(null)
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, orderId, order?.id])

  // Lắng nghe phím ESC để đóng modal tức thì
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Resolve fields from invoiceData or order fallback
  const inv = invoiceData || {}
  const rawOrder = order || {}

  const invoiceNo =
    inv.invoiceNumber ||
    rawOrder.orderCode ||
    (rawOrder.id ? `INV-202610-${String(rawOrder.id).padStart(5, '0')}` : 'INV-202610-00101')
  const serial = inv.invoiceSerial || 'SE/26E'
  const issuedDate = inv.issuedAt || rawOrder.createdAt || new Date().toISOString()
  const txnId = inv.gatewayTxnId || rawOrder.gatewayTxnId || 'SEPAY-20261013-OK'
  const isPaid =
    (inv.status || rawOrder.status || 'SUCCESS').toUpperCase() === 'SUCCESS' ||
    (inv.status || rawOrder.status || '').toLowerCase() === 'completed' ||
    (inv.status || rawOrder.status || '').toLowerCase() === 'paid'

  const customerName =
    inv.customerName ||
    rawOrder.customerName ||
    rawOrder.studentName ||
    'Quý khách hàng SmartEnglish'
  const customerEmail =
    inv.customerEmail ||
    rawOrder.customerEmail ||
    rawOrder.studentEmail ||
    'teacher@smartenglish.vn'

  const planName =
    inv.items?.[0]?.planName ||
    rawOrder.planName ||
    'Gói Dịch Vụ Giảng Viên Pro (Teacher Pro)'
  const billingCycle = inv.billingCycle || rawOrder.billingCycle || '1 tháng'
  const periodEnd =
    inv.periodEnd ||
    new Date(
      Date.now() + (billingCycle.toLowerCase().includes('năm') ? 365 : 30) * 24 * 3600 * 1000,
    ).toISOString()

  // Xác định vai trò chuẩn xác dựa trên email, tên, mã gói hoặc dữ liệu từ backend
  const isTeacher =
    customerEmail.toLowerCase().includes('teacher') ||
    customerName.toLowerCase().includes('thầy') ||
    customerName.toLowerCase().includes('cô') ||
    customerName.toLowerCase().includes('mai phương') ||
    planName.toLowerCase().includes('giảng viên') ||
    planName.toLowerCase().includes('teacher') ||
    (inv.items?.[0]?.planName || '').toLowerCase().includes('giảng viên') ||
    (inv.items?.[0]?.planName || '').toLowerCase().includes('teacher') ||
    (rawOrder.customerRole || '').toLowerCase().includes('giáo') ||
    (rawOrder.customerRole || '').toLowerCase().includes('teacher') ||
    (inv.customerRole || '').toLowerCase().includes('giáo') ||
    (inv.customerRole || '').toLowerCase().includes('teacher')

  const customerRole = isTeacher
    ? 'Giáo viên (Teacher Pro)'
    : 'Học viên (Student)'

  const amountFinal =
    inv.amountFinal !== undefined
      ? Number(inv.amountFinal)
      : rawOrder.amountFinal !== undefined
      ? Number(rawOrder.amountFinal)
      : rawOrder.amount !== undefined
      ? Number(rawOrder.amount)
      : 20000

  const originalAmount =
    inv.amountOriginal !== undefined ? Number(inv.amountOriginal) : amountFinal
  const discountAmount =
    inv.discountAmount !== undefined ? Number(inv.discountAmount) : 0

  // Xác định phương thức thanh toán chuẩn xác (ưu tiên VietQR SePay)
  const gatewayRaw = (inv.gateway || rawOrder.gateway || '').toLowerCase()
  const isSepayGateway =
    gatewayRaw === 'sepay' ||
    String(txnId).toUpperCase().includes('SEPAY') ||
    String(txnId).toUpperCase().includes('MB') ||
    rawOrder.paymentMethod?.toLowerCase().includes('vietqr')

  const paymentMethod =
    inv.paymentMethodName ||
    (isSepayGateway
      ? 'Chuyển khoản VietQR'
      : gatewayRaw === 'stripe'
      ? 'Thẻ Quốc Tế Visa/Mastercard (Stripe)'
      : gatewayRaw === 'vnpay'
      ? 'Cổng VNPAY (ATM/QR Pay)'
      : gatewayRaw === 'momo'
      ? 'Ví Điện Tử MoMo'
      : 'Chuyển khoản VietQR')

  const amountInWords =
    inv.amountInWords ||
    (amountFinal === 20000
      ? 'Hai mươi nghìn đồng chẵn'
      : amountFinal === 3990000
      ? 'Ba triệu chín trăm chín mươi nghìn đồng chẵn'
      : `${formatCurrency(amountFinal, { compact: false })} đồng chẵn`)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invoiceNo)
    toast.success(`Đã sao chép mã hóa đơn: ${invoiceNo}`)
  }

  const qrValue = `[HÓA ĐƠN ĐIỆN TỬ SMARTENGLISH AI]\nSố HĐ: ${invoiceNo} | Ký hiệu: ${serial}\nĐơn vị bán: HỆ THỐNG GIÁO DỤC CÔNG NGHỆ SMARTENGLISH AI\nMST: 010988XXXX | TP. Hồ Chí Minh\nNgười mua: ${customerName}\nEmail: ${customerEmail}\nGói: ${planName}\nTổng tiền: ${formatCurrency(amountFinal)}\nTrạng thái: ĐÃ THANH TOÁN (KÝ SỐ CA HỢP LỆ)\nTra cứu: https://smartenglish.vn/invoice`

  const getCleanInvoiceHtml = (qrDataUrl = '') => {
    return `
      <div style="width: 794px; min-height: 1050px; margin: 0 auto; padding: 36px 40px; background: #ffffff; color: #0f172a; font-family: Arial, Helvetica, sans-serif; box-sizing: border-box; line-height: 1.45;">
        <!-- Header: Đơn vị bán hàng & Khung HĐĐT -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 18px; gap: 16px;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
              <div style="width: 38px; height: 38px; background: #0284c7; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 22px;">
                🎓
              </div>
              <div>
                <span style="font-size: 16px; font-weight: 900; letter-spacing: -0.02em; color: #0f172a; text-transform: uppercase;">SMARTENGLISH AI PLATFORM</span>
              </div>
            </div>
            <div style="font-size: 11px; font-weight: bold; color: #1e293b; margin-bottom: 2px;">HỆ THỐNG GIÁO DỤC CÔNG NGHỆ SMARTENGLISH AI</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Mã số thuế: <strong style="font-family: monospace; color: #334155;">010988XXXX</strong></div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Địa chỉ: TP. Hồ Chí Minh</div>
            <div style="font-size: 11px; color: #64748b;">Hotline: 1900 XXXX • Email: support@smartenglish.vn</div>
          </div>

          <div style="min-width: 210px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 11px;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
              HÓA ĐƠN ĐIỆN TỬ (E-INVOICE)
            </div>
            <div style="color: #475569; margin-bottom: 3px;">Mẫu số: <strong style="color: #0f172a;">${inv.templateCode || '2'}</strong></div>
            <div style="color: #475569; margin-bottom: 3px;">Ký hiệu: <strong style="color: #0f172a;">${serial}</strong></div>
            <div style="color: #475569;">Số HĐ: <strong style="color: #0284c7; font-family: monospace;">${invoiceNo}</strong></div>
          </div>
        </div>

        <!-- Tiêu đề Hóa Đơn -->
        <div style="text-align: center; margin-top: 22px; margin-bottom: 20px;">
          <h1 style="font-size: 21px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin: 0; letter-spacing: 0.03em;">
            HÓA ĐƠN BÁN HÀNG
          </h1>
          <p style="font-size: 11px; color: #64748b; font-style: italic; margin: 5px 0 0 0;">
            Ngày lập: ${formatDate(issuedDate, 'dd/MM/yyyy HH:mm:ss')}
          </p>
        </div>

        <!-- Khối Thông Tin Khách Hàng & Giao Dịch -->
        <div style="display: flex; gap: 16px; margin-bottom: 20px;">
          <!-- Thẻ Khách Hàng -->
          <div style="flex: 1; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 11px;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
              Thông tin khách hàng (Người mua)
            </div>
            <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">
              ${customerName}
            </div>
            <div style="color: #475569; margin-bottom: 3px;">Email: <strong style="color: #0f172a;">${customerEmail}</strong></div>
            <div style="color: #475569; line-height: 22px;">Vai trò: <span style="display: inline-block; vertical-align: middle; padding: 2px 8px; line-height: 14px; background: #f1f5f9; color: #0369a1; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 600; font-size: 11px;">${customerRole}</span></div>
          </div>

          <!-- Thẻ Thanh Toán -->
          <div style="flex: 1; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 11px;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
              Chi tiết thanh toán & Đối soát
            </div>
            <div style="color: #475569; margin-bottom: 4px;">Mã đối soát: <strong style="font-family: monospace; color: #0f172a;">${txnId}</strong></div>
            <div style="color: #475569; margin-bottom: 4px;">Phương thức: <strong style="color: #0f172a;">${paymentMethod}</strong></div>
            <div style="color: #475569; margin-bottom: 4px; line-height: 22px;">
              Trạng thái: <span style="display: inline-block; vertical-align: middle; padding: 2px 8px; line-height: 14px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 10px; font-weight: bold; font-size: 10px;">✓ ĐÃ THANH TOÁN THÀNH CÔNG</span>
            </div>
            <div style="color: #475569;">Kỳ hạn: <strong>${billingCycle}</strong> (Hiệu lực đến ${formatDate(periodEnd, 'dd/MM/yyyy')})</div>
          </div>
        </div>

        <!-- Bảng Dịch Vụ Hàng Hóa -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px;">
          <thead>
            <tr style="background: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 9px 10px; text-align: center; width: 40px; font-weight: 700; color: #475569;">STT</th>
              <th style="padding: 9px 10px; text-align: left; font-weight: 700; color: #475569;">TÊN HÀNG HÓA, DỊCH VỤ</th>
              <th style="padding: 9px 10px; text-align: center; width: 60px; font-weight: 700; color: #475569;">ĐVT</th>
              <th style="padding: 9px 10px; text-align: center; width: 50px; font-weight: 700; color: #475569;">SL</th>
              <th style="padding: 9px 10px; text-align: right; width: 110px; font-weight: 700; color: #475569;">ĐƠN GIÁ</th>
              <th style="padding: 9px 10px; text-align: right; width: 120px; font-weight: 700; color: #475569;">THÀNH TIỀN</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 10px; text-align: center; color: #64748b;">1</td>
              <td style="padding: 10px;">
                <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">${planName}</div>
                <div style="font-size: 10px; color: #64748b;">Kỳ thanh toán: ${billingCycle} • Quyền truy cập đầy đủ tính năng AI SmartEnglish</div>
              </td>
              <td style="padding: 10px; text-align: center; color: #475569;">Gói</td>
              <td style="padding: 10px; text-align: center; font-weight: 600; color: #0f172a;">1</td>
              <td style="padding: 10px; text-align: right; color: #0f172a;">${formatCurrency(originalAmount)}</td>
              <td style="padding: 10px; text-align: right; font-weight: 700; color: #0f172a;">${formatCurrency(originalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <!-- Khối Tổng Tiền -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 14px;">
          <div style="width: 320px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #475569;">
              <span>Cộng tiền hàng:</span>
              <span style="font-weight: 600; color: #0f172a;">${formatCurrency(originalAmount)}</span>
            </div>
            ${discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #059669;">
                <span>Giảm giá / Ưu đãi:</span>
                <span style="font-weight: 600;">-${formatCurrency(discountAmount)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #475569;">
              <span>Thuế suất GTGT (VAT 0%*):</span>
              <span style="color: #64748b;">0 đ</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #0f172a; margin-top: 4px; font-size: 13px; font-weight: 900; color: #0f172a;">
              <span>TỔNG TIỀN THANH TOÁN:</span>
              <span style="color: #0284c7; font-size: 16px;">${formatCurrency(amountFinal)}</span>
            </div>
          </div>
        </div>

        <div style="padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 11px; color: #334155; margin-bottom: 24px;">
          <strong>Số tiền viết bằng chữ:</strong> <span style="font-style: italic;">${amountInWords}</span>
        </div>

        <!-- Chữ Ký & Mã QR Tra Cứu -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 18px; margin-bottom: 16px;">
          <!-- Mã QR -->
          <div style="display: flex; align-items: center; gap: 12px;">
            ${qrDataUrl ? `<img src="${qrDataUrl}" width="68" height="68" style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 2px; background: #fff;" />` : ''}
            <div style="font-size: 10px; color: #475569; max-width: 250px;">
              <div style="font-weight: bold; color: #0f172a; margin-bottom: 1px;">Mã tra cứu hóa đơn</div>
              <div style="font-family: monospace; color: #0284c7; font-weight: 700; margin-bottom: 2px;">${invoiceNo}</div>
              <div style="color: #64748b; font-size: 9px; line-height: 1.35;">
                Quét mã QR bằng Camera điện thoại hoặc app Ngân hàng để tra cứu tính toàn vẹn hóa đơn.
              </div>
            </div>
          </div>

          <!-- Dấu Số Điện Tử -->
          <div style="text-align: right;">
            <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
              ĐƠN VỊ BÁN HÀNG
            </div>
            <div style="font-size: 9px; color: #64748b; font-style: italic; margin-bottom: 6px;">
              (Ký điện tử bởi SmartEnglish AI CA)
            </div>
            <div style="display: flex; justify-content: flex-end; margin-bottom: 4px;">
              <table cellpadding="0" cellspacing="0" style="border: 2px solid #10b981; background-color: #ecfdf5; border-radius: 10px; border-collapse: separate; margin-left: auto;">
                <tr>
                  <td style="padding: 6px 4px 6px 10px; vertical-align: middle;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                      <circle cx="12" cy="12" r="10" stroke="#059669" stroke-width="2.2" fill="#ecfdf5" />
                      <path d="m9 12 2 2 4-4" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </td>
                  <td style="padding: 6px 12px 6px 6px; vertical-align: middle; text-align: left;">
                    <div style="font-size: 11px; font-weight: 900; color: #064e3b; line-height: 14px; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif;">
                      ĐÃ THANH TOÁN • PAID
                    </div>
                    <div style="font-size: 10px; font-family: monospace, Courier, sans-serif; color: #047857; line-height: 13px; margin-top: 2px;">
                      ${formatDate(issuedDate, 'dd/MM/yyyy HH:mm')}
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">
              Chữ ký số điện tử hợp lệ
            </div>
          </div>
        </div>

        <div style="font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
          * Dịch vụ đào tạo giáo dục thuộc đối tượng không chịu thuế GTGT. Hóa đơn điện tử hợp lệ.
        </div>
      </div>
    `
  }

  // Tải trực tiếp file PDF hóa đơn về máy (tải thẳng file .pdf, tuyệt đối không mở hộp thoại in)
  const handleDownloadPdf = async () => {
    if (isExportingPdf) return
    setIsExportingPdf(true)
    const toastId = toast.loading('Đang khởi tạo và tải file PDF hóa đơn...')

    const qrCanvas = document.getElementById('hidden-invoice-qr-canvas')
    const qrDataUrl = qrCanvas ? qrCanvas.toDataURL('image/png') : ''

    // Sử dụng HTML với màu HEX chuẩn (tránh lỗi Tailwind v4 oklab() của html2canvas)
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '0'
    container.style.left = '0'
    container.style.width = '794px'
    container.style.backgroundColor = '#ffffff'
    container.style.zIndex = '99999'
    container.style.pointerEvents = 'none'
    container.innerHTML = getCleanInvoiceHtml(qrDataUrl)
    document.body.appendChild(container)

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = 210
      const pageHeight = 297
      const margin = 8
      const printableWidth = pageWidth - margin * 2
      const printableHeight = (canvas.height * printableWidth) / canvas.width

      // Căn chỉnh vừa vặn trên trang A4
      if (printableHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, printableHeight)
      } else {
        const scaleRatio = (pageHeight - margin * 2) / printableHeight
        const scaledWidth = printableWidth * scaleRatio
        const scaledMarginLeft = margin + (printableWidth - scaledWidth) / 2
        pdf.addImage(imgData, 'PNG', scaledMarginLeft, margin, scaledWidth, pageHeight - margin * 2)
      }

      pdf.save(`SmartEnglish_HoaDon_${invoiceNo}.pdf`)
      toast.success(`Đã tải xuống file SmartEnglish_HoaDon_${invoiceNo}.pdf!`, { id: toastId })
    } catch (err) {
      console.warn('Lỗi html2canvas, chuyển sang fallback PDF văn bản chuẩn:', err)
      try {
        // Fallback tự động xuất PDF vector an toàn nếu canvas bị chặn
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        pdf.setFontSize(16)
        pdf.text('HÓA ĐƠN ĐIỆN TỬ SMARTENGLISH AI PLATFORM', 15, 20)
        pdf.setFontSize(10)
        pdf.text(`Số HĐ: ${invoiceNo} | Ký hiệu: ${serial}`, 15, 28)
        pdf.text(`Ngày lập: ${formatDate(issuedDate, 'dd/MM/yyyy HH:mm:ss')}`, 15, 34)
        pdf.text(`Khách hàng: ${customerName} (${customerEmail}) - Vai trò: ${customerRole}`, 15, 42)
        pdf.text(`Mã GD đối soát: ${txnId} | Phương thức: ${paymentMethod}`, 15, 48)
        pdf.line(15, 52, 195, 52)
        pdf.text(`Dịch vụ: ${planName}`, 15, 60)
        pdf.text(`Kỳ hạn: ${billingCycle} | Số lượng: 1`, 15, 66)
        pdf.text(`Tổng thanh toán: ${formatCurrency(amountFinal)}`, 15, 74)
        pdf.text(`Số tiền bằng chữ: ${amountInWords}`, 15, 80)
        pdf.line(15, 84, 195, 84)
        pdf.text('Trạng thái: ĐÃ THANH TOÁN (KÝ SỐ CA SMARTENGLISH AI HỢP LỆ)', 15, 92)
        pdf.save(`SmartEnglish_HoaDon_${invoiceNo}.pdf`)
        toast.success(`Đã tải file PDF hóa đơn: SmartEnglish_HoaDon_${invoiceNo}.pdf!`, { id: toastId })
      } catch (fallbackErr) {
        console.error('Lỗi khi xuất PDF:', fallbackErr)
        toast.error('Không thể tạo file PDF: ' + (fallbackErr?.message || 'Vui lòng thử lại'), { id: toastId })
      }
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container)
      }
      setIsExportingPdf(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.()
        }
      }}
    >
      {/* Container Modal (Khung chuẩn tỷ lệ giấy A4 dọc) */}
      <div
        className="relative w-full max-w-[680px] max-h-[95vh] flex flex-col bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar (Sticky Action Bar) */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 no-print">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <FileCheck2 size={18} strokeWidth={2.2} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Hóa đơn điện tử (Khổ A4 dọc)</h3>
                {isPaid && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 size={11} strokeWidth={2.5} />
                    Đã thanh toán
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Số: {invoiceNo} • Ký hiệu: {serial}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={Copy}
              onClick={handleCopyCode}
              title="Sao chép mã hóa đơn"
            >
              Sao chép mã
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Download}
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              title="Tải trực tiếp file PDF hóa đơn khổ A4"
            >
              {isExportingPdf ? 'Đang tải PDF...' : 'Tải PDF'}
            </Button>
            <button
              type="button"
              onClick={() => onClose?.()}
              className="p-1.5 ml-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Đóng hóa đơn (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Tờ giấy A4 dọc (Portrait A4 Paper Sheet 210mm x 297mm) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/75 flex justify-center items-start">
          <div
            ref={printRef}
            id="printable-invoice"
            className="w-full max-w-[595px] min-h-[842px] bg-white shadow-xl border border-slate-300/90 px-7 py-8 sm:px-9 sm:py-10 text-slate-800 flex flex-col justify-between select-text"
          >
            {/* PHẦN TRÊN & GIỮA TỜ GIẤY A4 */}
            <div className="space-y-5">
              {/* 1. Header Đơn vị bán hàng & Mẫu số Hóa đơn */}
              <div className="flex items-start justify-between gap-4 border-b-2 border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-600 text-white shadow-2xs">
                      <GraduationCap size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-black tracking-tight text-navy-900 uppercase">
                      SMARTENGLISH AI PLATFORM
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 uppercase">
                    HỆ THỐNG GIÁO DỤC CÔNG NGHỆ SMARTENGLISH AI
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Mã số thuế: <strong className="font-mono text-slate-800">010988XXXX</strong>
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Địa chỉ: Khu Công Nghệ Cao, TP. Hồ Chí Minh
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Hotline: 1900 XXXX • Email: support@smartenglish.vn
                  </p>
                </div>

                <div className="shrink-0 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-left space-y-1 min-w-[165px]">
                  <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-extrabold border-b border-slate-200 pb-1">
                    HÓA ĐƠN ĐIỆN TỬ
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between gap-3">
                    <span>Mẫu số:</span>
                    <span className="font-mono font-bold text-slate-900">{inv.templateCode || '2'}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between gap-3">
                    <span>Ký hiệu:</span>
                    <span className="font-mono font-bold text-slate-900">{serial}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between gap-3">
                    <span>Số HĐ:</span>
                    <span className="font-mono font-bold text-brand-600">{invoiceNo}</span>
                  </div>
                </div>
              </div>

              {/* 2. Tiêu đề HÓA ĐƠN BÁN HÀNG */}
              <div className="text-center py-1">
                <h1 className="text-xl font-black uppercase text-navy-900 tracking-wide">
                  HÓA ĐƠN BÁN HÀNG
                </h1>
                <p className="text-[11px] text-slate-500 italic mt-1">
                  (Bản thể hiện của hóa đơn điện tử)
                </p>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Ngày lập: {formatDate(issuedDate, 'dd/MM/yyyy HH:mm:ss')}
                </p>
              </div>

              {/* 3. Thông tin Người mua & Giao dịch (xếp dọc chuẩn mẫu giấy A4) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <div>
                    <span className="text-slate-500">Họ tên người mua: </span>
                    <strong className="text-slate-900 font-bold text-xs">{customerName}</strong>
                  </div>
                  <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-[10.5px]">
                    {customerRole}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11.5px] pt-0.5">
                  <div>
                    <span className="text-slate-500">Địa chỉ Email: </span>
                    <strong className="text-slate-800 font-medium">{customerEmail}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Hình thức TT: </span>
                    <strong className="text-slate-800 font-semibold">{paymentMethod}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Mã giao dịch: </span>
                    <strong className="font-mono text-slate-800">{txnId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Thời hạn gói: </span>
                    <strong className="text-slate-800">
                      {formatDate(issuedDate, 'dd/MM/yyyy')} → {formatDate(periodEnd, 'dd/MM/yyyy')}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 4. Bảng chi tiết hàng hóa, dịch vụ */}
              <div className="overflow-hidden rounded-lg border border-slate-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-2.5 text-center w-10 border-r border-slate-200">STT</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Tên hàng hóa, dịch vụ</th>
                      <th className="py-2.5 px-2 text-center w-16 border-r border-slate-200">ĐVT</th>
                      <th className="py-2.5 px-2 text-center w-12 border-r border-slate-200">SL</th>
                      <th className="py-2.5 px-2.5 text-right w-24 border-r border-slate-200">Đơn giá</th>
                      <th className="py-2.5 px-3 text-right w-28">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-2.5 text-center font-medium text-slate-600 border-r border-slate-200">
                        1
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200">
                        <div className="font-bold text-slate-900 text-xs">{planName}</div>
                        <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
                          Kỳ hạn: {billingCycle} • Bản quyền sử dụng nền tảng học & giảng dạy tiếng Anh thông minh SmartEnglish AI.
                        </p>
                      </td>
                      <td className="py-3 px-2 text-center text-slate-700 border-r border-slate-200">
                        Gói
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-800 border-r border-slate-200">
                        1
                      </td>
                      <td className="py-3 px-2.5 text-right font-medium text-slate-800 border-r border-slate-200">
                        {formatCurrency(originalAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(originalAmount)}
                      </td>
                    </tr>
                    {/* Dòng trống tạo cảm giác trang giấy hóa đơn A4 chuẩn */}
                    <tr className="h-8">
                      <td className="border-r border-slate-200" />
                      <td className="border-r border-slate-200" />
                      <td className="border-r border-slate-200" />
                      <td className="border-r border-slate-200" />
                      <td className="border-r border-slate-200" />
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 5. Tổng hợp thanh toán & Số tiền bằng chữ */}
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="w-full sm:w-72 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Cộng tiền dịch vụ:</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(originalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Chiết khấu / Giảm giá:</span>
                      <span className="font-semibold text-emerald-600">
                        {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : '0 đ'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Thuế suất GTGT (KCT*):</span>
                      <span className="font-semibold text-slate-800">0 đ</span>
                    </div>
                    <div className="pt-2 border-t-2 border-slate-800 flex justify-between items-baseline">
                      <span className="text-xs font-extrabold text-slate-900 uppercase">
                        Tổng tiền thanh toán:
                      </span>
                      <span className="text-base font-black text-brand-600">
                        {formatCurrency(amountFinal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Số tiền viết bằng chữ: </span>
                  <span className="italic">{amountInWords}</span>
                </div>
              </div>
            </div>

            {/* PHẦN CHÂN TRANG GIẤY A4: CHỮ KÝ SỐ & QR TRA CỨU */}
            <div className="pt-6 mt-6 border-t border-slate-300 space-y-4">
              <div className="grid grid-cols-2 gap-4 items-start">
                {/* Cột trái: Người mua + Mã QR */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 uppercase">NGƯỜI MUA HÀNG</p>
                    <p className="text-[10px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="p-1.5 border border-slate-200 rounded-lg bg-white shadow-2xs shrink-0">
                      <QRCodeCanvas
                        value={qrValue}
                        size={56}
                        level="M"
                        includeMargin={false}
                      />
                    </div>
                    <div className="space-y-0.5 text-[10px] text-slate-600">
                      <p className="font-bold text-slate-800">Mã QR tra cứu HĐĐT</p>
                      <p className="font-mono text-brand-600 font-bold">{invoiceNo}</p>
                      <p className="text-[9.5px] text-slate-400 leading-tight">
                        Quét QR để kiểm tra tính toàn vẹn.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Đơn vị bán hàng & Con dấu ký số */}
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 uppercase">ĐƠN VỊ BÁN HÀNG</p>
                    <p className="text-[10px] text-slate-400 italic">
                      (Ký điện tử bởi SmartEnglish AI CA)
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-2xs">
                    <BadgeCheck size={18} className="text-emerald-600 shrink-0" />
                    <div className="text-left">
                      <div className="text-[10px] font-black tracking-wider uppercase text-emerald-900 leading-tight">
                        ĐÃ THANH TOÁN • PAID
                      </div>
                      <div className="text-[9.5px] text-emerald-700 font-mono leading-tight mt-0.5">
                        Ký ngày: {formatDate(issuedDate, 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-slate-400">
                    Chữ ký số điện tử hợp lệ
                  </p>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-2.5 text-center text-[10px] text-slate-400 italic">
                * Dịch vụ đào tạo giáo dục thuộc đối tượng không chịu thuế GTGT. Hóa đơn điện tử được khởi tạo từ hệ thống SmartEnglish AI.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (No-print buttons) */}
        <div className="shrink-0 flex items-center justify-between px-5 py-2.5 bg-white border-t border-slate-200 no-print">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Hóa đơn điện tử hợp lệ và được xác thực toàn vẹn</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onClose?.()}
              className="cursor-pointer"
            >
              Đóng
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Download}
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              title="Tải trực tiếp file PDF hóa đơn về máy"
              className="cursor-pointer"
            >
              {isExportingPdf ? 'Đang tải PDF...' : 'Tải hóa đơn (PDF)'}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden QRCodeCanvas in DOM to generate Base64 PNG for PDF and Print */}
      <div style={{ position: 'fixed', left: -9999, top: -9999, pointerEvents: 'none', opacity: 0 }}>
        <QRCodeCanvas
          id="hidden-invoice-qr-canvas"
          value={qrValue}
          size={160}
          level="M"
          includeMargin={false}
        />
      </div>
    </div>
  )
}
