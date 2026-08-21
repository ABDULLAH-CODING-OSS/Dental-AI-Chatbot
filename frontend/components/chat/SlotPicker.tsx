import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlotPickerProps {
  doctorName: string;
  date: string;
  slots: string[];
  onSlotSelect: (slot: string) => void;
  isLoading?: boolean;
}

export function SlotPicker({ doctorName, date, slots, onSlotSelect, isLoading = false }: SlotPickerProps) {
  if (!slots || slots.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-start gap-3">
          <Clock size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-semibold text-amber-900">No Available Slots</h3>
            <p className="text-sm text-amber-800 mt-1">
              There are no available slots with {doctorName} on {date}. Please choose a different date.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-700">
          Available slots for <span className="text-emerald-600">{doctorName}</span> on{" "}
          <span className="text-emerald-600">{date}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map((slot, index) => (
          <Button
            key={index}
            onClick={() => onSlotSelect(slot)}
            disabled={isLoading}
            className="text-xs py-1.5 px-2.5 h-auto font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer shadow-xs hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Clock size={13} className="mr-1.5" />
            {slot}
          </Button>
        ))}
      </div>

      <p className="text-xs text-slate-500 text-center mt-4">
        Click a time slot to book your appointment
      </p>
    </div>
  );
}
