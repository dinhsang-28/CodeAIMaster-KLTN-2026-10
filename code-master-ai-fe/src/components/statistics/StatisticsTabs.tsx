import React from "react";

type Props = {
  value: "month" | "week";
  onChange: (v: "month" | "week") => void;
};

export default function StatisticsTabs({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-xl bg-[#dad7cd] p-1">
      <button
        className={`rounded-lg px-4 py-2 text-sm font-bold transition ${value === "month" ? "bg-[#3a5a40] text-white" : "text-[#344e41]"}`}
        onClick={() => onChange("month")}
      >
        Theo tháng
      </button>
      <button
        className={`rounded-lg px-4 py-2 text-sm font-bold transition ${value === "week" ? "bg-[#3a5a40] text-white" : "text-[#344e41]"}`}
        onClick={() => onChange("week")}
      >
        Theo tuần hiện tại
      </button>
    </div>
  );
}
