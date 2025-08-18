import React, { useState } from "react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import Likert from "./Likert";

const part2Questions = [
  "คิดทำร้ายตนเอง",
  "ทำร้ายตนเองจริง",
  "เคยวางแผนหรือพยายามฆ่าตัวตาย",
];

export default function Q11Part2({ onNext, onCancel }: { onNext: () => void; onCancel: () => void }) {
  const [ans, setAns] = useState<number[]>(Array(part2Questions.length).fill(0));
  const set = (i: number, v: number) => setAns(a => { const b = [...a]; b[i] = v; return b; });

  return (
    <Card>
      <CardHeader
        title="แบบประเมินซึมเศร้า 11Q – ส่วนที่ 2"
        description="พิจารณาในระยะ 1 เดือนที่ผ่านมา"
      />
      <div className="p-6">
        <div className="rounded-2xl border p-4">
          <div className="text-sm text-slate-600 mb-4">ติ๊กระดับความรู้สึก 0–3 เช่นเดียวกับส่วนที่ 1</div>
          <div className="space-y-4">
            {part2Questions.map((q, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-4">
                <div className="text-sm">{i + 1}. {q}</div>
                <Likert name={`p2_${i}`} value={ans[i]} onChange={(v) => set(i, v)} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel}>ยกเลิก</Button>
            <Button onClick={onNext}>ดูผล</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
