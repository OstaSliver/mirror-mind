import React from "react";
import { Smile, Calendar, Camera } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default function OnboardSlide({
  title, description, cta, onNext, iconName
}: {
  title: string; description: string; cta: string; onNext: () => void; iconName: "smile"|"calendar"|"camera";
}) {
  const icon = iconName === "smile" ? <Smile className="size-5"/> :
               iconName === "calendar" ? <Calendar className="size-5"/> :
               <Camera className="size-5"/>;

  return (
    <Card>
      <CardHeader title={<div className="flex items-center gap-2 text-xl">{icon}{title}</div>} description={description} />
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white/60 aspect-[4/3] grid place-items-center">
            <div className="text-slate-400 text-sm">ภาพประกอบ</div>
          </div>
          <div className="flex flex-col justify-between">
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-2">
              <li>ผลการสแกนหน้า เพื่อประเมินอารมณ์</li>
              <li>จดบันทึกความรู้สึกในปฏิทิน</li>
              <li>ข้อความให้กำลังใจในแต่ละวัน</li>
            </ul>
            <Button className="mt-6" onClick={onNext}>{cta}</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
