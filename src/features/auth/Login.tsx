// import { Lock, Info } from "lucide-react";
// import { Card, CardHeader } from "../../components/ui/Card";
// import { Button } from "../../components/ui/Button";
// import { LabeledInput } from "../../components/ui/LabeledInput";

// export default function Login({ onNext }: { onNext: () => void }) {
//   return (
//     <div className="grid gap-6 md:grid-cols-2">
//       <Card>
//         <CardHeader
//           title={<><Lock className="size-5 mr-2 inline-block" />Login</>}
//           description="เข้าสู่ระบบเพื่อเริ่มประเมินอารมณ์"
//         />
//         <div className="p-6">
//           <LabeledInput id="username" label="ชื่อผู้ใช้" placeholder="yourname" />
//           <LabeledInput id="password" type="password" label="รหัสผ่าน" placeholder="••••••••" />
//           <div className="flex items-center justify-between text-sm mt-2">
//             <a className="text-slate-500 hover:underline" href="/register">ยังไม่ได้เป็นสมาชิก? ลงทะเบียน</a>
//             <label className="inline-flex items-center gap-2">
//               <input type="checkbox" className="size-4" /> จดจำฉัน
//             </label>
//           </div>
//           <div className="mt-4">
//             <Button onClick={onNext} className="w-full">ต่อไป</Button>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// }

import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LabeledInput } from "../../components/ui/LabeledInput";

type Props = { onNext: () => void };

export default function Login({ onNext }: Props) {
  const [identifier, setIdentifier] = useState(""); // username หรือ email
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErr(null);
    if (!identifier.trim() || !password) {
      setErr("กรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", {
        identifier: identifier.trim(),
        password,
      });

      const token: string | undefined = data?.token;
      if (token) {
        const store = remember ? localStorage : sessionStorage;
        store.setItem("token", token);
      }

      // ล้างรหัสผ่านในฟอร์มเพื่อความปลอดภัย
      setPassword("");
      onNext(); // ไปหน้าถัดไป (เช่น calendar)
    } catch (e: unknown) {
      type AxiosErrorResponse = {
        response?: {
          data?: {
            detail?: string;
          };
        };
      };
      const errObj = e as AxiosErrorResponse;
      const detail =
        typeof e === "object" &&
        e !== null &&
        "response" in errObj &&
        typeof errObj.response === "object" &&
        errObj.response !== null &&
        "data" in errObj.response &&
        typeof errObj.response.data === "object" &&
        errObj.response.data !== null &&
        "detail" in errObj.response.data
          ? errObj.response.data.detail
          : undefined;
      setErr(typeof detail === "string" ? detail : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader
          title={
            <>
              <Lock className="size-5 mr-2 inline-block" />
              Login
            </>
          }
          description="เข้าสู่ระบบเพื่อเริ่มประเมินอารมณ์"
        />
        <div className="p-6">
          <form onSubmit={submit} className="space-y-3">
            <LabeledInput
              id="identifier"
              label="ชื่อผู้ใช้หรืออีเมล"
              placeholder="yourname หรือ you@example.com"
              autoComplete="username email"
              value={identifier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIdentifier(e.target.value)
              }
            />
            <LabeledInput
              id="password"
              type="password"
              label="รหัสผ่าน"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
            />

            {err && (
              <div
                role="alert"
                aria-live="polite"
                className="text-sm text-rose-600"
              >
                {err}
              </div>
            )}

            <div className="flex items-center justify-between text-sm mt-2">
              <Link className="text-slate-500 hover:underline" to="/register">
                ยังไม่ได้เป็นสมาชิก? ลงทะเบียน
              </Link>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />{" "}
                จดจำฉัน
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "ต่อไป"}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* ฝั่งขวา (optional): ใส่การตลาด/คำอธิบายเพิ่มได้ตามธีมของคุณ */}
      {/* <Card> ... </Card> */}
    </div>
  );
}
