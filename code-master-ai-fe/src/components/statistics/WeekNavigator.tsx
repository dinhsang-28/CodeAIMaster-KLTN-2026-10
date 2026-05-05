import React from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

type Props = {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onCurrent: () => void;
};

export default function WeekNavigator({ label, onPrev, onNext, onCurrent }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-[#f3f2ef] px-3 py-2">
      <button onClick={onPrev} className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-[#344e41]">
        <LeftOutlined />
      </button>
      <button onClick={onCurrent} className="rounded-lg bg-[#cfd5c2] px-3 py-1 text-sm font-bold text-[#344e41]">
        Hiện tại
      </button>
      <button onClick={onNext} className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-[#344e41]">
        <RightOutlined />
      </button>
      <span className="ml-2 text-xs font-semibold text-[#7f9f6b]">{label}</span>
    </div>
  );
}
