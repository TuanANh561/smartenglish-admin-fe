import Input from '@/components/ui/Input'
import Switch from '@/components/ui/Switch'

export default function AdminPaymentTab({ settings, onUpdateField }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">Cổng thanh toán & Webhook IPN</h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Cấu hình kết nối cổng thanh toán VNPay, MoMo và địa chỉ nhận webhook tự động.
        </p>
      </div>

      {/* VNPay Box */}
      <div className="rounded-xl border border-line p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-800 text-sm">Cổng VNPay QR / Thẻ ATM</span>
            <span className="rounded bg-red-50 text-red-600 font-mono text-[10px] font-bold px-1.5 py-0.5">
              VNPay
            </span>
          </div>
          <Switch
            checked={settings.payment.vnpayEnabled}
            onChange={(checked) => onUpdateField('payment', 'vnpayEnabled', checked)}
          />
        </div>

        {settings.payment.vnpayEnabled && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-line">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Merchant ID</label>
              <Input
                value={settings.payment.vnpayMerchantId}
                onChange={(e) => onUpdateField('payment', 'vnpayMerchantId', e.target.value)}
                className="mt-0.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Secret Key</label>
              <Input
                type="password"
                value={settings.payment.vnpaySecretKey}
                onChange={(e) => onUpdateField('payment', 'vnpaySecretKey', e.target.value)}
                className="mt-0.5 font-mono text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* MoMo Box */}
      <div className="rounded-xl border border-line p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-800 text-sm">Ví Điện Tử MoMo</span>
            <span className="rounded bg-pink-50 text-pink-600 font-mono text-[10px] font-bold px-1.5 py-0.5">
              MoMo
            </span>
          </div>
          <Switch
            checked={settings.payment.momoEnabled}
            onChange={(checked) => onUpdateField('payment', 'momoEnabled', checked)}
          />
        </div>

        {settings.payment.momoEnabled && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-line">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Partner Code</label>
              <Input
                value={settings.payment.momoPartnerCode}
                onChange={(e) => onUpdateField('payment', 'momoPartnerCode', e.target.value)}
                className="mt-0.5 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Access Key</label>
              <Input
                type="password"
                value={settings.payment.momoAccessKey}
                onChange={(e) => onUpdateField('payment', 'momoAccessKey', e.target.value)}
                className="mt-0.5 font-mono text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Webhook */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
          Payment Webhook IPN Callback URL
        </label>
        <Input
          value={settings.payment.webhookUrl}
          onChange={(e) => onUpdateField('payment', 'webhookUrl', e.target.value)}
          className="font-mono text-xs"
        />
        <p className="text-[11px] text-ink-muted mt-1">
          Đường dẫn nhận thông báo giao dịch thành công để tự động nâng cấp gói Premium cho học viên.
        </p>
      </div>
    </div>
  )
}
