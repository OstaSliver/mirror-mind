import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { Calendar, MessageCircleHeart, ClipboardList, LogIn } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

type UserMe = { id: number; username: string; email?: string } | null;
type MoodMap = Record<string, number>;

const moods = [
  { key: 0, label: "ปกติ/สดใส", color: "bg-emerald-500" },
  { key: 1, label: "เบื่อ ๆ เซ็ง ๆ", color: "bg-lime-500" },
  { key: 2, label: "เศร้าบ้างบางเวลา", color: "bg-yellow-400" },
  { key: 3, label: "เศร้าชัดเจน", color: "bg-amber-500" },
  { key: 4, label: "เศร้ามาก", color: "bg-orange-500" },
  { key: 5, label: "จมดิ่ง ควบคุมยาก", color: "bg-red-500" },
  { key: 6, label: "สิ้นหวังมาก", color: "bg-rose-600" },
];

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Home() {
  const nav = useNavigate();
  const [user, setUser] = useState<UserMe>(null);
  const [moodMap, setMoodMap] = useState<MoodMap>({});
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayKey = keyOf(today);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        const headers = getAuthHeaders();
        const [me, monthData, monthSum] = await Promise.all([
          api.get("/auth/me", { headers }).catch(() => ({ data: { user: null } })),
          api.get("/moods/month", { headers, params: { year, month } }),
          api.get("/moods/month/summary", { headers, params: { year, month } }),
        ]);
        if (!live) return;
        setUser(me.data?.user ?? null);
        console.log("User data:", me.data?.user);
        setMoodMap(monthData.data?.data ?? {});
        setSummary(monthSum.data?.counts ?? {});
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [year, month]);

  const todayLevel = moodMap[todayKey];
  const monthNameTH = useMemo(
    () => new Intl.DateTimeFormat("th-TH", { month: "long" }).format(new Date(year, month - 1, 1)),
    [year, month]
  );
  const totalInMonth = useMemo(
    () => Object.values(summary).reduce((a, b) => a + b, 0),
    [summary]
  );
  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(summary).map((n) => Number(n || 0))),
    [summary]
  );

  const levelLabel = (lv?: number) => (lv != null ? moods[lv]?.label ?? `ระดับ ${lv}` : "ยังไม่บันทึก");

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Welcome + Quick actions */}
      <Card className="md:col-span-3">
        <CardHeader
          title={`สวัสดี${user?.username ? `, ${user.username}` : ""}`}
          description="ติดตามอารมณ์ของคุณแบบวันต่อวัน และสรุปภาพรวมรายเดือน"
        />
        <div className="p-6 flex flex-wrap gap-3">
          <Button onClick={() => nav("/calendar")}><Calendar className="size-4 mr-2" /> ไปปฏิทิน</Button>
          <Button variant="outline" onClick={() => nav("/chat")}><MessageCircleHeart className="size-4 mr-2" /> ห้องแชทใจดวงน้อย</Button>
          <Button variant="outline" onClick={() => nav("/q11")}><ClipboardList className="size-4 mr-2" /> ทำแบบประเมิน 11Q</Button>
          {!user && (
            <Button variant="ghost" onClick={() => nav("/")}>
              <LogIn className="size-4 mr-2" /> เข้าสู่ระบบ
            </Button>
          )}
        </div>
      </Card>

      {/* Today */}
      <Card>
        <CardHeader
          title="วันนี้"
          description={new Intl.DateTimeFormat("th-TH", { dateStyle: "full" }).format(today)}
        />
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded ${todayLevel != null ? moods[todayLevel].color : "bg-slate-300"}`} />
            <div className="text-lg font-medium">{levelLabel(todayLevel)}</div>
          </div>

          <div className="mt-4 text-sm text-slate-600">
            {todayLevel == null ? "ยังไม่มีบันทึกอารมณ์สำหรับวันนี้" : "คุณสามารถแก้ไขได้ที่หน้าปฏิทิน"}
          </div>

          <div className="mt-4">
            <Button onClick={() => nav("/calendar")}>{todayLevel == null ? "บันทึกวันนี้" : "แก้ไขในปฏิทิน"}</Button>
          </div>
        </div>
      </Card>

      {/* Monthly summary */}
      <Card className="md:col-span-2">
        <CardHeader title={`สรุปเดือนนี้ (${monthNameTH} ${year + 543})`} description={`${totalInMonth} บันทึก`} />
        <div className="p-6">
          <div className="space-y-2">
            {moods.map((m) => {
              const count = Number(summary[String(m.key)] || 0);
              const width = Math.round((count / maxCount) * 100);
              return (
                <div key={m.key} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-slate-600 shrink-0">ระดับ {m.key}</div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-2 ${m.color}`} style={{ width: `${width}%` }} />
                  </div>
                  <div className="w-10 text-right text-xs text-slate-700">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Recent logs */}
      <Card className="md:col-span-3">
        <CardHeader title="บันทึกล่าสุด" description="7 รายการล่าสุด" />
        <div className="p-6">
          {loading ? (
            <div className="text-sm text-slate-500">กำลังโหลด…</div>
          ) : (
            <ul className="grid md:grid-cols-2 gap-2 text-sm">
              {Object.keys(moodMap)
                .sort((a, b) => (a < b ? 1 : -1))
                .slice(0, 7)
                .map((d) => {
                  const lv = moodMap[d];
                  const dateTH = new Date(d).toLocaleDateString("th-TH", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <li key={d} className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded ${moods[lv]?.color ?? "bg-slate-300"}`} />
                      <span className="text-slate-700">{dateTH}</span>
                      <span className="text-slate-500">—</span>
                      <span className="text-slate-800">{levelLabel(lv)}</span>
                    </li>
                  );
                })}
            </ul>
          )}
          <div className="mt-4">
            <Button variant="outline" onClick={() => nav("/calendar")}>ดูทั้งหมดในปฏิทิน</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
