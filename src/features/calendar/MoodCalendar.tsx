// import React, { useCallback, useMemo, useState } from "react";
// import { Calendar as CalIcon, ChevronLeft, ChevronRight, MessageCircleHeart } from "lucide-react";
// import { Card, CardHeader } from "../../components/ui/Card";
// import { Button } from "../../components/ui/Button";
// import { IconButton } from "../../components/ui/IconButton";
// import { useCalendar, keyOf } from "./useCalendar";

// const moods = [
//   { key: 0, label: "อารมณ์ปกติ มีความสุข สดใส สบายใจ", color: "bg-emerald-500" },
//   { key: 1, label: "เริ่มรู้สึกหดหู่ เบื่อ ๆ เซ็ง ๆ", color: "bg-lime-500" },
//   { key: 2, label: "อารมณ์เศร้า เหนื่อยง่าย หมดแรงใจ เป็นบางเวลา", color: "bg-yellow-400" },
//   { key: 3, label: "รู้สึกเศร้าชัดเจน ไม่ค่อยอยากทำอะไร", color: "bg-amber-500" },
//   { key: 4, label: "เศร้ามาก รู้สึกไร้ค่า สิ้นหวัง ใช้ชีวิตลำบาก", color: "bg-orange-500" },
//   { key: 5, label: "จมดิ่งในความเศร้า ร้องไห้ง่าย ควบคุมอารมณ์ไม่ได้", color: "bg-red-500" },
//   { key: 6, label: "รู้สึกมืดหม่น สิ้นหวังสุด ๆ ไม่อยากใช้ชีวิตอยู่", color: "bg-rose-600" },
// ];

// // เทียบวันแบบ local
// const sameDay = (a: Date, b: Date) =>
//   a.getFullYear() === b.getFullYear() &&
//   a.getMonth() === b.getMonth() &&
//   a.getDate() === b.getDate();

// export default function MoodCalendar({
//   onOpenChat, onOpenQ11
// }: { onOpenChat: () => void; onOpenQ11: () => void }) {
//   const [cursor, setCursor] = useState<Date>(() => new Date());
//   const [selected, setSelected] = useState<Date | null>(() => new Date());
//   const [moodMap, setMoodMap] = useState<Record<string, number>>({});
//   const [openPicker, setOpenPicker] = useState(false);

//   const { year, monthIdx, cells } = useCalendar(cursor.getFullYear(), cursor.getMonth());
//   const monthName = useMemo(
//     () => new Intl.DateTimeFormat("th-TH", { month: "long" }).format(new Date(year, monthIdx, 1)),
//     [year, monthIdx]
//   );

//   const changeMonth = useCallback((delta: number) => {
//     setCursor(new Date(year, monthIdx + delta, 1));
//   }, [year, monthIdx]);

//   // บันทึกได้เฉพาะ "วันนี้"
//   const setMoodForSelected = useCallback((level: number) => {
//     if (!selected || !sameDay(selected, new Date())) return;
//     setMoodMap((s) => ({ ...s, [keyOf(selected)]: level }));
//     setOpenPicker(false);
//   }, [selected]);


//   return (
//     <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
//       <Card>
//         <CardHeader
//           title={<div className="flex items-center gap-2"><CalIcon className="size-5" />ปฏิทินอารมณ์</div>}
//           description="กดที่วันที่ปัจจุบันเพื่อประเมินอารมณ์"
//         />
//         <div className="p-6">
//           <div className="mb-4 flex items-center justify-between">
//             <IconButton ariaLabel="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft className="size-4" /></IconButton>
//             <div className="font-medium">{monthName} {year + 543}</div>
//             <IconButton ariaLabel="Next month" onClick={() => changeMonth(1)}><ChevronRight className="size-4" /></IconButton>
//           </div>

//           <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 mb-2">
//             {["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"].map(d => <div key={d} className="py-1">{d}</div>)}
//           </div>

//           <div className="grid grid-cols-7 gap-2">
//             {cells.map(({ date, inMonth }) => {
//               const k = keyOf(date);
//               const moodLevel = moodMap[k];

//               const isToday = sameDay(date, new Date());
//               const isSelectedOther = !isToday && selected && keyOf(selected) === k;

//               const base = "size-10 rounded-full grid place-items-center text-sm transition ring-1";
//               const todayCls = "bg-slate-900 text-white ring-slate-900 hover:bg-slate-900 cursor-pointer";      // วันนี้ = ดำค้าง
//               const selectedOtherCls = "bg-slate-100 text-slate-900 ring-slate-300 hover:bg-slate-100";          // วันอื่นที่ถูกเลือก = เทาอ่อน
//               const normalInMonth = "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 cursor-default";   // วันทั่วไปในเดือน
//               const outMonth = "bg-white text-slate-400 ring-slate-200 opacity-60 cursor-default";               // วันนอกเดือน

//               return (
//                 <button
//                   key={k}
//                   onClick={() => { setSelected(date); if (isToday) setOpenPicker(true); }} // เปิด modal ได้เฉพาะวันนี้
//                   aria-label={`เลือกวันที่ ${date.toLocaleDateString('th-TH')}`}
//                   aria-current={isToday ? "date" : undefined}
//                   className={[
//                     base,
//                     isToday ? todayCls : isSelectedOther ? selectedOtherCls : (inMonth ? normalInMonth : outMonth)
//                   ].join(" ")}
//                 >
//                   <div className="flex flex-col items-center gap-1">
//                     <div>{date.getDate()}</div>
//                     {moodLevel !== undefined && (
//                       <span className={["h-1.5 w-6 rounded-full", moods[moodLevel].color].join(" ")} />
//                     )}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>


//           <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
//             {moods.map(m => (
//               <div key={m.key} className="flex items-center gap-2">
//                 <span className={["h-2 w-4 rounded", m.color].join(" ")}></span>
//                 <span>{m.key}</span>
//               </div>
//             ))}
//           </div>

//           <div className="mt-6 flex gap-2">
//             <Button onClick={onOpenChat}><MessageCircleHeart className="size-4 mr-2" />ห้องแชทใจดวงน้อย</Button>
//             <Button variant="outline" onClick={onOpenQ11}>ทำแบบประเมิน 11Q</Button>
//           </div>
//         </div>
//       </Card>

//       <Card>
//         <CardHeader title="วันที่ที่เลือก" description="แสดงผลการเลือกระดับอารมณ์" />
//         <div className="p-6">
//           <div className="rounded-2xl border p-4 text-sm text-slate-600 min-h-24">
//             {selected ? (
//               <div>
//                 วันที่ {selected.toLocaleDateString("th-TH")}<br />
//                 ระดับอารมณ์: {moodMap[keyOf(selected)] ?? "ยังไม่ได้เลือก"}
//               </div>
//             ) : "ยังไม่ได้เลือกวันที่"}
//           </div>
//         </div>
//       </Card>

//       {openPicker && (
//         <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4" role="dialog" aria-modal="true">
//           <div className="w-full max-w-lg rounded-3xl bg-white p-4">
//             <div className="text-lg font-medium mb-3">เลือกระดับอารมณ์</div>
//             <div className="grid gap-2">
//               {moods.map(m => (
//                 <button key={m.key} onClick={() => setMoodForSelected(m.key)} className="flex items-center gap-3 rounded-2xl border p-3 hover:bg-slate-50 text-left">
//                   <span className={["h-3 w-3 rounded", m.color].join(" ")}></span>
//                   <div>
//                     <div className="font-medium">ระดับ {m.key}</div>
//                     <div className="text-xs text-slate-500">{m.label}</div>
//                   </div>
//                 </button>
//               ))}
//             </div>
//             <div className="flex justify-end mt-3">
//               <Button onClick={() => setOpenPicker(false)}>ปิด</Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "../../lib/api";
import { Calendar as CalIcon, ChevronLeft, ChevronRight, MessageCircleHeart } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { IconButton } from "../../components/ui/IconButton";
import { useCalendar, keyOf } from "./useCalendar";
import { a } from "framer-motion/client";

const moods = [
  { key: 0, label: "อารมณ์ปกติ มีความสุข สดใส สบายใจ", color: "bg-emerald-500" },
  { key: 1, label: "เริ่มรู้สึกหดหู่ เบื่อ ๆ เซ็ง ๆ", color: "bg-lime-500" },
  { key: 2, label: "อารมณ์เศร้า เหนื่อยง่าย หมดแรงใจ เป็นบางเวลา", color: "bg-yellow-400" },
  { key: 3, label: "รู้สึกเศร้าชัดเจน ไม่ค่อยอยากทำอะไร", color: "bg-amber-500" },
  { key: 4, label: "เศร้ามาก รู้สึกไร้ค่า สิ้นหวัง ใช้ชีวิตลำบาก", color: "bg-orange-500" },
  { key: 5, label: "จมดิ่งในความเศร้า ร้องไห้ง่าย ควบคุมอารมณ์ไม่ได้", color: "bg-red-500" },
  { key: 6, label: "รู้สึกมืดหม่น สิ้นหวังสุด ๆ ไม่อยากใช้ชีวิตอยู่", color: "bg-rose-600" },
];

// เทียบวันแบบ local
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// ---- ตั้งค่าผู้ใช้สำหรับ header (ภายหลังค่อยต่อ auth จริง) ----
// const USER_ID = "demo0";
// const apiHeaders = { "X-User-Id": USER_ID };

export default function MoodCalendar({
  onOpenChat, onOpenQ11
}: { onOpenChat: () => void; onOpenQ11: () => void }) {
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const [selected, setSelected] = useState<Date | null>(() => new Date());
  const [moodMap, setMoodMap] = useState<Record<string, number>>({});
  const [openPicker, setOpenPicker] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);

  const { year, monthIdx, cells } = useCalendar(cursor.getFullYear(), cursor.getMonth());
  const monthName = useMemo(
    () => new Intl.DateTimeFormat("th-TH", { month: "long" }).format(new Date(year, monthIdx, 1)),
    [year, monthIdx]
  );

  const changeMonth = useCallback((delta: number) => {
    setCursor(new Date(year, monthIdx + delta, 1));
  }, [year, monthIdx]);

  // โหลด moods ของเดือนที่แสดงอยู่ (MVP: ยิงทีละวัน)
  // useEffect(() => {
  //   const load = async () => {
  //     setLoadingMonth(true);
  //     try {
  //       const inMonthDates = cells.filter(c => c.inMonth).map(c => c.date);
  //       const results = await Promise.allSettled(
  //         inMonthDates.map(d =>
  //           axios.get<{ date: string; level: number | null }>("/api/moods", {
  //             headers: apiHeaders,
  //             params: { date: keyOf(d) }
  //           })
  //         )
  //       );
  //       const next: Record<string, number> = {};
  //       results.forEach(r => {
  //         if (r.status === "fulfilled") {
  //           const { date, level } = r.value.data;
  //           if (level !== null && level !== undefined) next[date] = level;
  //         }
  //       });
  //       setMoodMap(next);
  //     } finally {
  //       setLoadingMonth(false);
  //     }
  //   };
  //   load();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [year, monthIdx]);

  useEffect(() => {
  let ok = true;
  const load = async () => {
    setLoadingMonth(true);
    try {
      const res = await api.get("/api/moods/month", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { year, month: monthIdx + 1 },
      });
      if (!ok) return;
      setMoodMap(res.data?.data ?? {});   // { "YYYY-MM-DD": level }
    } finally {
      if (ok) setLoadingMonth(false);
    }
  };
  load();
  return () => { ok = false };
}, [year, monthIdx]);

  // บันทึกได้เฉพาะ "วันนี้"
  const setMoodForSelected = useCallback(async (level: number) => {
    if (!selected || !sameDay(selected, new Date())) return;
    const dateKey = keyOf(selected);

    // optimistic update
    setMoodMap((s) => ({ ...s, [dateKey]: level }));
    setOpenPicker(false);

    try {
      await api.put("/api/moods", { date: dateKey, level }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
    } catch {
      // rollback ถ้าพลาด
      setMoodMap((s) => {
        const clone = { ...s };
        delete clone[dateKey];
        return clone;
      });
      alert("บันทึกไม่สำเร็จ");
    }
  }, [selected]);

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader
          title={<div className="flex items-center gap-2"><CalIcon className="size-5" />ปฏิทินอารมณ์</div>}
          description="กดที่วันที่ปัจจุบันเพื่อประเมินอารมณ์"
        />
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <IconButton ariaLabel="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft className="size-4" /></IconButton>
            <div className="font-medium">{monthName} {year + 543}</div>
            <IconButton ariaLabel="Next month" onClick={() => changeMonth(1)}><ChevronRight className="size-4" /></IconButton>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-500 mb-2">
            {["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"].map(d => <div key={d} className="py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map(({ date, inMonth }) => {
              const k = keyOf(date);
              const moodLevel = moodMap[k];

              const isToday = sameDay(date, new Date());
              const isSelectedOther = !isToday && selected && keyOf(selected) === k;

              const base = "size-10 rounded-full grid place-items-center text-sm transition ring-1";
              const todayCls = "bg-slate-900 text-white ring-slate-900 hover:bg-slate-900 cursor-pointer";      // วันนี้ = ดำค้าง
              const selectedOtherCls = "bg-slate-100 text-slate-900 ring-slate-300 hover:bg-slate-100";          // วันอื่นที่ถูกเลือก = เทาอ่อน
              const normalInMonth = "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 cursor-default";   // วันทั่วไปในเดือน
              const outMonth = "bg-white text-slate-400 ring-slate-200 opacity-60 cursor-default";               // วันนอกเดือน

              return (
                <button
                  key={k}
                  onClick={() => { setSelected(date); if (isToday) setOpenPicker(true); }} // เปิด modal ได้เฉพาะวันนี้
                  aria-label={`เลือกวันที่ ${date.toLocaleDateString('th-TH')}`}
                  aria-current={isToday ? "date" : undefined}
                  className={[
                    base,
                    isToday ? todayCls : isSelectedOther ? selectedOtherCls : (inMonth ? normalInMonth : outMonth)
                  ].join(" ")}
                  disabled={loadingMonth && !isToday}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div>{date.getDate()}</div>
                    {moodLevel !== undefined && (
                      <span className={["h-1.5 w-6 rounded-full", moods[moodLevel].color].join(" ")} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-slate-500">
            {loadingMonth ? "กำลังโหลดข้อมูลเดือนนี้..." : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            {moods.map(m => (
              <div key={m.key} className="flex items-center gap-2">
                <span className={["h-2 w-4 rounded", m.color].join(" ")}></span>
                <span>{m.key}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <Button onClick={onOpenChat}><MessageCircleHeart className="size-4 mr-2" />ห้องแชทใจดวงน้อย</Button>
            <Button variant="outline" onClick={onOpenQ11}>ทำแบบประเมิน 11Q</Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="วันที่ที่เลือก" description="แสดงผลการเลือกระดับอารมณ์" />
        <div className="p-6">
          <div className="rounded-2xl border p-4 text-sm text-slate-600 min-h-24">
            {selected ? (
              <div>
                วันที่ {selected.toLocaleDateString("th-TH")}<br />
                ระดับอารมณ์: {moodMap[keyOf(selected)] ?? "ยังไม่ได้เลือก"}
              </div>
            ) : "ยังไม่ได้เลือกวันที่"}
          </div>
        </div>
      </Card>

      {openPicker && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-3xl bg-white p-4">
            <div className="text-lg font-medium mb-3">เลือกระดับอารมณ์</div>
            <div className="grid gap-2">
              {moods.map(m => (
                <button key={m.key} onClick={() => setMoodForSelected(m.key)} className="flex items-center gap-3 rounded-2xl border p-3 hover:bg-slate-50 text-left">
                  <span className={["h-3 w-3 rounded", m.color].join(" ")}></span>
                  <div>
                    <div className="font-medium">ระดับ {m.key}</div>
                    <div className="text-xs text-slate-500">{m.label}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-3">
              <Button onClick={() => setOpenPicker(false)}>ปิด</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
