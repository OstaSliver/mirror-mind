import React from "react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default function Q11Result({ onDone }: { onDone: () => void }) {
  return (
    <Card>
      <CardHeader
        title="ผลประเมิน 11Q (สรุประดับภาวะซึมเศร้า)"
        description="ผลนี้เป็นแนวทางคร่าว ๆ ควรปรึกษาผู้เชี่ยวชาญหากมีความกังวล"
      />
      <div className="grid gap-4 md:grid-cols-2 p-6">
        <Card className="rounded-2xl border">
          <div className="p-4">
            <div className="text-base font-medium mb-1">ระดับภาวะ</div>
            <div className="text-sm text-slate-700 space-y-2">
              <div className="flex items-center gap-2"><span className="h-2 w-3 rounded bg-emerald-500"></span> ปกติ–เฝ้าระวัง</div>
              <div className="flex items-center gap-2"><span className="h-2 w-3 rounded bg-yellow-400"></span> มีสัญญาณซึมเศร้า</div>
              <div className="flex items-center gap-2"><span className="h-2 w-3 rounded bg-orange-500"></span> ระดับปานกลาง</div>
              <div className="flex items-center gap-2"><span className="h-2 w-3 rounded bg-rose-600"></span> ระดับรุนแรง</div>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border">
          <div className="p-4">
            <div className="text-base font-medium mb-1">คำแนะนำ</div>
            <div className="text-sm text-slate-700">
              <ul className="list-disc pl-5 space-y-2">
                <li>พักผ่อนเพียงพอ ออกกำลังกายเบา ๆ</li>
                <li>พูดคุยกับคนใกล้ชิด หรือสายด่วนสุขภาพจิต 1323</li>
                <li>หากมีความคิดทำร้ายตนเอง ให้ติดต่อขอความช่วยเหลือทันที</li>
              </ul>
            </div>
          </div>
        </Card>
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={onDone}>กลับหน้าปฏิทิน</Button>
        </div>
      </div>
    </Card>
  );
}
