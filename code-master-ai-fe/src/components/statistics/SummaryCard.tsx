import React from "react";
import dayjs from "dayjs";

type Props = {
  label: string;
  value: string | number;
  sub?: string;
};

export default function SummaryCard({ label, value, sub }: Props) {
  const formatSub = (sub?: string) => {
    if (!sub) return "";

    const dates = sub.split(" - ");

    const isDateRange =
      dates.length === 2 &&
      dates.every((date) => dayjs(date).isValid());

    if (isDateRange) {
      return dates
        .map((date) => dayjs(date).format("DD/MM/YYYY"))
        .join(" - ");
    }

    return sub;
  };

  return (
    <div className="rounded-2xl bg-[#f3f2ef] p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-[#7f9f6b]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold text-[#1f2d27]">
        {value}
      </p>

      {sub ? (
        <p className="mt-1 text-xs text-[#a3b18a]">
          {formatSub(sub)}
        </p>
      ) : null}
    </div>
  );
}