// import React, { useEffect, useRef, useState } from "react";
// import { HeartHandshake, Shuffle, ArrowLeft } from "lucide-react";
// import { Card, CardHeader } from "../../components/ui/Card";
// import { Button } from "../../components/ui/Button";

// // ---------- ข้อความกำลังใจ ----------
// const QUOTES = [
//   "ความพยายามของเธอ มีค่าเสมอ",
//   "ยิ้มของเธอทำให้โลกสดใสขึ้นนะ",
//   "วันนี้อาจเหนื่อย แต่เธอเก่งมากแล้ว",
//   "ค่อย ๆ ไปก็ยังเป็นการก้าวไปข้างหน้า",
//   "พักได้ แต่อย่าลืมเริ่มใหม่อีกครั้ง",
//   "เธอไม่จำเป็นต้องสมบูรณ์แบบ แค่พยายามก็พอ",
//   "สิ่งเล็ก ๆ ที่ทำวันนี้ คือพลังของพรุ่งนี้",
//   "ใจดีกับตัวเองหน่อยนะ",
// ];

// type Entry = { id: number; text: string; date: string }; // เก็บเฉพาะข้อความต่อวัน

// const dayKey = (d: Date) =>
//   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// const STORAGE_KEY = "mmm.encourage.history";

// const loadHistory = (): Entry[] => {
//   try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
// };
// const saveHistory = (arr: Entry[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

// export default function EncourageChat({ onBack }: { onBack: () => void }) {
//   const [history, setHistory] = useState<Entry[]>([]);
//   const listRef = useRef<HTMLDivElement>(null);
//   const todayKey = dayKey(new Date());

//   // สุ่มข้อความใหม่ โดยพยายามไม่ซ้ำ 5 วันที่ผ่านมา
//   const pickRandom = (recent: string[]) => {
//     const pool = QUOTES.filter((q) => !recent.includes(q));
//     const arr = pool.length ? pool : QUOTES;
//     return arr[Math.floor(Math.random() * arr.length)];
//   };

//   // โหลด/สร้างข้อความของวันนี้ครั้งแรก
//   useEffect(() => {
//     let hist = loadHistory();
//     // ถ้าไม่มีของวันนี้ → สุ่มแล้วเพิ่ม
//     if (!hist.find((e) => e.date === todayKey)) {
//       const recent = hist.slice(-5).map((e) => e.text);
//       const text = pickRandom(recent);
//       hist = [...hist, { id: Date.now(), text, date: todayKey }];
//       saveHistory(hist);
//     }
//     setHistory(hist);
//   }, [todayKey]);

//   // เลื่อนลงล่างสุดเวลาเปลี่ยนรายการ
//   useEffect(() => {
//     const el = listRef.current;
//     if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
//   }, [history.length]);

//   const randomToday = () => {
//     // อนุญาตสุ่มใหม่เฉพาะวันนี้
//     const recent = history.slice(-5).map((e) => e.text);
//     const text = pickRandom(recent);
//     const updated = [
//       ...history.filter((e) => e.date !== todayKey),
//       { id: Date.now(), text, date: todayKey },
//     ];
//     setHistory(updated);
//     saveHistory(updated);
//   };

//   return (
//     <Card>
//       <CardHeader
//         title={<div className="flex items-center gap-2">
//           <HeartHandshake className="size-5" /> ห้องแชทใจดวงน้อย
//         </div>}
//         description="ระบบสุ่มข้อความให้กำลังใจประจำวันให้อัตโนมัติ (ดูย้อนหลังได้)"
//       />
//       <div className="p-6">
//         {/* กล่องข้อความ – โค้งมน ขอบบาง */}
//         <div className="rounded-[24px] ring-1 ring-slate-200 bg-white/60 p-4 h-[420px] overflow-y-auto" ref={listRef}>
//           {/* ปุ่มสุ่มสำหรับ 'วันนี้' */}
//           <div className="flex justify-end mb-3">
//             <button
//               onClick={randomToday}
//               className="rounded-full bg-slate-900 text-white text-xs px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50"
//               disabled={!history.find((e) => e.date === todayKey)} // ถ้าโหลดยังไม่เสร็จ ป้องกันกดก่อน
//               title="สุ่มข้อความกำลังใจวันนี้"
//             >
//               <Shuffle className="size-3 inline mr-1" /> สุ่มวันนี้
//             </button>
//           </div>

//           <div className="space-y-3">
//             {history.map((e) => (
//               <div key={e.id} className="flex justify-start">
//                 <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 bg-white ring-1 ring-slate-200">
//                   <div className="text-[11px] text-slate-400 mb-1">
//                     {new Date(e.date).toLocaleDateString("th-TH")}
//                   </div>
//                   {e.text}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* แถบควบคุมล่าง – ไม่มีช่องพิมพ์แล้ว เหลือปุ่มกลับ */}
//         <div className="mt-3 flex justify-end">
//           <Button variant="outline" onClick={onBack}>
//             <ArrowLeft className="size-4 mr-2" /> กลับหน้าแรก
//           </Button>
//         </div>
//       </div>
//     </Card>
//   );
// }


import React, { useEffect, useRef, useState } from "react";
import { HeartHandshake, Shuffle, ArrowLeft } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

// ---------- ข้อความกำลังใจ ----------
const QUOTES = [
  "ความพยายามของเธอ มีค่าเสมอ",
  "ยิ้มของเธอทำให้โลกสดใสขึ้นนะ",
  "วันนี้อาจเหนื่อย แต่เธอเก่งมากแล้ว",
  "ค่อย ๆ ไปก็ยังเป็นการก้าวไปข้างหน้า",
  "พักได้ แต่อย่าลืมเริ่มใหม่อีกครั้ง",
  "เธอไม่จำเป็นต้องสมบูรณ์แบบ แค่พยายามก็พอ",
  "สิ่งเล็ก ๆ ที่ทำวันนี้ คือพลังของพรุ่งนี้",
  "ใจดีกับตัวเองหน่อยนะ",
];

type Entry = { id: number; text: string; date: string };

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const STORAGE_KEY = "mmm.encourage.history";
const loadHistory = (): Entry[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveHistory = (arr: Entry[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

export default function EncourageChat({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<Entry[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const todayKey = dayKey(new Date());

  const pickRandom = (recent: string[]) => {
    const pool = QUOTES.filter((q) => !recent.includes(q));
    const arr = pool.length ? pool : QUOTES;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  useEffect(() => {
    let hist = loadHistory();
    if (!hist.find((e) => e.date === todayKey)) {
      const recent = hist.slice(-5).map((e) => e.text);
      const text = pickRandom(recent);
      hist = [...hist, { id: Date.now(), text, date: todayKey }];
      saveHistory(hist);
    }
    setHistory(hist);
  }, [todayKey]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [history.length]);

  const randomToday = () => {
    const recent = history.slice(-5).map((e) => e.text);
    const text = pickRandom(recent);
    const updated = [
      ...history.filter((e) => e.date !== todayKey),
      { id: Date.now(), text, date: todayKey },
    ];
    setHistory(updated);
    saveHistory(updated);
  };

  return (
    <Card>
      <CardHeader
        title={<div className="flex items-center gap-2">
          <HeartHandshake className="size-5" /> ห้องแชทใจดวงน้อย
        </div>}
        description="ระบบสุ่มข้อความให้กำลังใจประจำวันให้อัตโนมัติ (ดูย้อนหลังได้)"
      />

      {/* ── แถบปุ่มด้านบน: ชิดขวา ── */}
      <div className="px-6 -mt-2 mb-2 flex justify-end">
        <Button onClick={randomToday} className="rounded-full">
          <Shuffle className="size-4 mr-2" /> สุ่มวันนี้
        </Button>
      </div>

      <div className="p-6 pt-2">
        {/* กล่องข้อความ */}
        <div
          ref={listRef}
          className="rounded-[24px] ring-1 ring-slate-200 bg-white/60 p-4 h-[420px] overflow-y-auto"
        >
          <div className="space-y-3">
            {history.map((e) => (
              <div key={e.id} className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 bg-white ring-1 ring-slate-200">
                  <div className="text-[11px] text-slate-400 mb-1">
                    {new Date(e.date).toLocaleDateString("th-TH")}
                  </div>
                  {e.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ปุ่มกลับ: ชิดขวา ── */}
        <div className="mt-3 flex justify-end">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="size-4 mr-2" /> กลับหน้าแรก
          </Button>
        </div>
      </div>
    </Card>
  );
}
