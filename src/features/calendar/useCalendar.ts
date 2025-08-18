import { useMemo } from "react";

export function useCalendar(year?: number, monthIdx?: number) {
  const y = year ?? new Date().getFullYear();
  const m = monthIdx ?? new Date().getMonth();
  const first = new Date(y, m, 1);
  const startDay = (first.getDay() + 6) % 7; // Monday=0
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const cells = useMemo(() => {
    const arr: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < startDay; i++) arr.push({ date: new Date(y, m, i - startDay + 1), inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) arr.push({ date: new Date(y, m, d), inMonth: true });
    while (arr.length % 7 !== 0) arr.push({ date: new Date(y, m + 1, arr.length - (startDay + daysInMonth) + 1), inMonth: false });
    return arr;
  }, [y, m, startDay, daysInMonth]);

  return { year: y, monthIdx: m, cells };
}

// useCalendar.ts
export const keyOf = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;   // ใช้ local date, ไม่ใช้ toISOString()
};

