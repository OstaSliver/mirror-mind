import React from "react";

export default function Likert({
  name, value, onChange
}: { name: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {[0, 1, 2, 3].map(v => (
        <label
          key={v}
          className={[
            "cursor-pointer rounded-full border px-3 py-1",
            value === v ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-50"
          ].join(" ")}
        >
          <input type="radio" className="hidden" name={name} checked={value === v} onChange={() => onChange(v)} />
          {v}
        </label>
      ))}
    </div>
  );
}
