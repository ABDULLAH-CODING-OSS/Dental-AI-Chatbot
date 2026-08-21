import { CheckCircle } from "lucide-react";

export interface ReceiptData {
  confirmation_number: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  price: number;
  status: string;
}

interface ReceiptCardProps {
  receipt: ReceiptData;
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const statusColors: Record<string, { bg: string; text: string; badge: string }> = {
    pending: { bg: "bg-amber-50", text: "text-amber-900", badge: "bg-amber-100 text-amber-800" },
    confirmed: { bg: "bg-emerald-50", text: "text-emerald-900", badge: "bg-emerald-100 text-emerald-800" },
    completed: { bg: "bg-blue-50", text: "text-blue-900", badge: "bg-blue-100 text-blue-800" },
    cancelled: { bg: "bg-red-50", text: "text-red-900", badge: "bg-red-100 text-red-800" },
  };

  const colors = statusColors[receipt.status.toLowerCase()] || statusColors.pending;

  return (
    <div className={`${colors.bg} border border-slate-200 rounded-xl p-5 w-full max-w-md`}>
      {/* Header with confirmation number */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
        <CheckCircle size={20} className="text-emerald-600 shrink-0" />
        <div>
          <h3 className="font-semibold text-slate-900">Appointment Confirmed</h3>
          <p className="text-xs text-slate-600 mt-0.5">Confirmation #{receipt.confirmation_number}</p>
        </div>
      </div>

      {/* Receipt details */}
      <div className="space-y-3">
        {/* Doctor */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</p>
            <p className={`text-sm font-semibold ${colors.text} mt-1`}>{receipt.doctor}</p>
            <p className="text-xs text-slate-600">{receipt.specialty}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</p>
            <p className={`text-sm font-semibold ${colors.text} mt-1`}>{receipt.date}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</p>
            <p className={`text-sm font-semibold ${colors.text} mt-1`}>{receipt.time}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee</p>
          <p className="text-xl font-bold text-slate-900">${receipt.price.toFixed(2)}</p>
        </div>

        {/* Status badge */}
        <div className="flex justify-center pt-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colors.badge}`}>
            {receipt.status}
          </span>
        </div>
      </div>

      {/* Footer message */}
      <p className="text-xs text-slate-600 text-center mt-4 pt-3 border-t border-slate-200">
        You'll receive a confirmation notification once it's fully processed.
      </p>
    </div>
  );
}
