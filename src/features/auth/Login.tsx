import { Lock, Info } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LabeledInput } from "../../components/ui/LabeledInput";

export default function Login({ onNext }: { onNext: () => void }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader
          title={<><Lock className="size-5 mr-2 inline-block" />Login</>}
          description="เข้าสู่ระบบเพื่อเริ่มประเมินอารมณ์"
        />
        <div className="p-6">
          <LabeledInput id="username" label="ชื่อผู้ใช้" placeholder="yourname" />
          <LabeledInput id="password" type="password" label="รหัสผ่าน" placeholder="••••••••" />
          <div className="flex items-center justify-between text-sm mt-2">
            <a className="text-slate-500 hover:underline" href="#">ยังไม่ได้เป็นสมาชิก? ลงทะเบียน</a>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="size-4" /> จดจำฉัน
            </label>
          </div>
          <div className="mt-4">
            <Button onClick={onNext} className="w-full">ต่อไป</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
