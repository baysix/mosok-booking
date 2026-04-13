import {
  PrayerOrder,
  PRAYER_ORDER_STATUS_LABELS,
  PRAYER_ORDER_STATUS_COLORS,
  getRemainingDays,
  getProgressPercent,
  getDurationLabel,
} from '@/types/prayer.types';

export function PrayerOrderCard({ order }: { order: PrayerOrder }) {
  const remaining = getRemainingDays(order.endDate);
  const progress = getProgressPercent(order.startDate, order.endDate);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700">
            {order.category}
          </span>
          <span className="text-sm font-bold text-gray-900">{order.productName}</span>
          <span className="text-xs text-gray-400">{getDurationLabel(order.durationDays)}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
          PRAYER_ORDER_STATUS_COLORS[order.status]
        }`}>
          {PRAYER_ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {order.beneficiaryName && (
        <p className="text-xs text-gray-500 mb-1">수혜자: {order.beneficiaryName}</p>
      )}

      <p className="text-xs text-gray-400 mb-2">
        {order.startDate} ~ {order.endDate}
        {order.price > 0 && <span className="ml-2">₩{order.price.toLocaleString()}</span>}
      </p>

      {order.wishText && (
        <p className="text-xs text-gray-400 mb-2 truncate">&quot;{order.wishText}&quot;</p>
      )}

      {order.status === 'active' && (
        <div>
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>진행률 {progress}%</span>
            <span>{remaining > 0 ? `${remaining}일 남음` : '만료'}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                remaining <= 7 ? 'bg-red-400' : 'bg-orange-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
