// src/features/auth/Register.tsx
import React, { useMemo, useState, useId } from "react";
import axios from "axios";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

type Props = { onDone: () => void };

type FormState = {
  username: string;
  email: string;
  password: string;
  password2: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  dob: string;
  gender: "ชาย" | "หญิง" | "อื่นๆ" | "";
  occupation: string;
  education: string;
};

export default function Register({ onDone }: Props) {
  const [data, setData] = useState<FormState>({
    username: "", email: "", password: "", password2: "",
    firstName: "", lastName: "", address: "", phone: "",
    dob: "", gender: "", occupation: "", education: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const age = useMemo(() => {
    if (!data.dob) return "";
    const d = new Date(data.dob);
    const t = new Date();
    let a = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
    return a >= 0 ? String(a) : "";
  }, [data.dob]);

  const update = (k: keyof FormState, v: string) => setData(s => ({ ...s, [k]: v }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(data.username)) e.username = "username 3–20 ตัว (a-z 0-9 _ . -)";
    if (!/^\S+@\S+\.\S+$/.test(data.email)) e.email = "อีเมลไม่ถูกต้อง";
    if (data.password.length < 8) e.password = "รหัสผ่านอย่างน้อย 8 ตัว";
    if (data.password !== data.password2) e.password2 = "รหัสผ่านไม่ตรงกัน";
    if (!data.firstName.trim()) e.firstName = "กรอกชื่อ";
    if (!data.lastName.trim()) e.lastName = "กรอกนามสกุล";
    if (!/^\d{9,10}$/.test(data.phone)) e.phone = "เบอร์ 9–10 หลัก";
    if (!data.dob) e.dob = "กรอกวันเกิด";
    if (!data.gender) e.gender = "เลือกเพศ";
    if (!data.education) e.education = "เลือกระดับการศึกษา";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // 1) สมัครสมาชิก → ได้ token กลับมา
      const { data: r } = await axios.post("/api/auth/register", {
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password,
      });

      const token: string | undefined = r?.token;
      if (token) localStorage.setItem("token", token);

      // 2) บันทึกโปรไฟล์ (ส่ง Bearer ถ้ามี, ถ้าไม่มีใช้ X-User-Id เป็น dev fallback)
      await axios.post(
        "/api/profile",
        {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          address: data.address.trim(),
          phone: data.phone,
          dob: data.dob,
          gender: data.gender,
          occupation: data.occupation.trim(),
          education: data.education,
        },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : { "X-User-Id": data.username },
        }
      );

      // 3) เคลียร์รหัสผ่านในฟอร์ม แล้วจบขั้นตอน
      setData((s) => ({ ...s, password: "", password2: "" }));
      onDone();
    } catch (err: unknown) {
      // map error จาก backend ให้ขึ้นที่ฟิลด์
      let detail: unknown = undefined;
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: { data?: { detail?: unknown } } }).response;
        detail = response?.data?.detail;
      }
      const e: Record<string, string> = {};
      if (typeof detail === "string") {
        if (detail.includes("อีเมล")) e.email = "อีเมลนี้ถูกใช้แล้ว";
        if (detail.includes("username")) e.username = "ชื่อนี้ถูกใช้แล้ว";
        if (detail.includes("รหัสผ่าน")) e.password = detail;
      }
      setErrors((prev) => ({ ...prev, ...e }));
      if (Object.keys(e).length === 0) alert("สมัครไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };


  return (
    <Card>
      <CardHeader title="ลงทะเบียน" description="กรอกข้อมูลผู้ใช้เพื่อเริ่มใช้งาน" />
      <div className="p-6 space-y-6">
        {/* Credentials */}
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Username" error={errors.username} name="username" placeholder="mirrormind_user">
            {(props) => (
              <input {...props} value={data.username} onChange={e => update("username", e.target.value)}
                autoComplete="username" />
            )}
          </Field>
          <Field label="อีเมล" error={errors.email} name="email" placeholder="you@example.com">
            {(props) => (
              <input {...props} type="email" value={data.email} onChange={e => update("email", e.target.value)}
                autoComplete="email" />
            )}
          </Field>
          <Field label="รหัสผ่าน" error={errors.password} name="password" placeholder="อย่างน้อย 8 ตัว">
            {(props) => (
              <input {...props} type="password" value={data.password} onChange={e => update("password", e.target.value)}
                autoComplete="new-password" />
            )}
          </Field>
          <Field label="ยืนยันรหัสผ่าน" error={errors.password2} name="password2" placeholder="พิมพ์รหัสอีกครั้ง">
            {(props) => (
              <input {...props} type="password" value={data.password2} onChange={e => update("password2", e.target.value)}
                autoComplete="new-password" />
            )}
          </Field>
        </div>

        {/* Profile */}
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="ชื่อ" error={errors.firstName} name="firstName" placeholder="สมชาย">
            {(props) => (
              <input {...props} value={data.firstName} onChange={e => update("firstName", e.target.value)} />
            )}
          </Field>
          <Field label="นามสกุล" error={errors.lastName} name="lastName" placeholder="ใจดี">
            {(props) => (
              <input {...props} value={data.lastName} onChange={e => update("lastName", e.target.value)} />
            )}
          </Field>

          <Field label="ที่อยู่" name="address" className="md:col-span-2" placeholder="บ้านเลขที่ / ถนน / เขต / จังหวัด">
            {(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
              <textarea {...props} rows={3}
                value={data.address} onChange={e => update("address", e.target.value)} />
            )}
          </Field>

          <Field label="เบอร์ติดต่อ" error={errors.phone} name="phone" placeholder="0xxxxxxxxx">
            {(props) => (
              <input {...props} inputMode="numeric" maxLength={10}
                value={data.phone} onChange={e => update("phone", e.target.value.replace(/\D/g, ''))}
                autoComplete="tel" />
            )}
          </Field>

          <Field label="วัน/เดือน/ปี (เกิด)" error={errors.dob} name="dob">
            {(props) => (
              <input {...props} type="date" max={new Date().toISOString().slice(0, 10)}
                value={data.dob} onChange={e => update("dob", e.target.value)} />
            )}
          </Field>

          <Field label="อายุ" name="age">
            {(props) => (
              <input {...props} value={age} readOnly className={props.className + " bg-slate-50"} />
            )}
          </Field>

          {/* เพศ: ใช้ fieldset/legend + label ต่อ radio ทุกตัว */}
          <GenderField
            label="เพศ" name="gender" error={errors.gender}
            value={data.gender} onChange={(g) => update("gender", g)}
          />

          <Field label="อาชีพ" name="occupation" placeholder="นักเรียน / พนักงาน / อาชีพอิสระ ฯลฯ">
            {(props) => (
              <input {...props} value={data.occupation} onChange={e => update("occupation", e.target.value)} />
            )}
          </Field>

          <Field label="ระดับการศึกษา" error={errors.education} name="education">
            {(props) => (
              <select {...props} value={data.education} onChange={e => update("education", e.target.value)}>
                <option value="">-- เลือก --</option>
                <option>ประถมศึกษา</option>
                <option>มัธยมศึกษา</option>
                <option>ปวช./ปวส.</option>
                <option>ปริญญาตรี</option>
                <option>ปริญญาโท</option>
                <option>ปริญญาเอก</option>
                <option>อื่นๆ</option>
              </select>
            )}
          </Field>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onDone}>ยกเลิก</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "กำลังบันทึก..." : "สมัครสมาชิก"}</Button>
        </div>
      </div>
    </Card>
  );
}

/** Field ที่ทำ a11y ครบ: ผูก label ↔ input, ใส่ aria-invalid/aria-describedby และรองรับ placeholder */
function Field({
  label, error, name, className, placeholder, children
}: {
  label: string;
  error?: string;
  name: string;
  className?: string;
  placeholder?: string;
  children: (props: {
    id: string;
    name: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
    className: string;
    placeholder?: string;
  }) => React.ReactNode;
}) {
  const auto = useId();
  const id = `${name}-${auto}`;
  const errId = error ? `${id}-err` : undefined;

  const baseCls = "w-full rounded-2xl ring-1 ring-slate-200 px-3 py-2";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      {children({
        id,
        name,
        "aria-invalid": !!error,
        "aria-describedby": errId,
        className: baseCls,
        placeholder
      })}
      {error && <div id={errId} className="mt-1 text-xs text-rose-600">{error}</div>}
    </div>
  );
}

function GenderField({
  label, name, value, onChange, error
}: {
  label: string;
  name: string;
  value: "ชาย" | "หญิง" | "อื่นๆ" | "";
  onChange: (g: "ชาย" | "หญิง" | "อื่นๆ") => void;
  error?: string;
}) {
  const auto = useId();
  const baseId = `${name}-${auto}`;
  const errId = error ? `${baseId}-err` : undefined;
  const opts: Array<"ชาย" | "หญิง" | "อื่นๆ"> = ["ชาย", "หญิง", "อื่นๆ"];

  return (
    <fieldset aria-describedby={errId} className="">
      <legend className="mb-1 text-sm font-medium">{label}</legend>
      <div className="flex gap-3">
        {opts.map((g, i) => {
          const id = `${baseId}-${i}`;
          const checked = value === g;
          return (
            <label key={g} htmlFor={id}
              className={[
                "px-3 py-1.5 rounded-full ring-1 cursor-pointer select-none",
                checked ? "bg-slate-900 text-white ring-slate-900" : "bg-white ring-slate-200"
              ].join(" ")}
            >
              <input id={id} name={name} type="radio" value={g} className="hidden"
                checked={checked} onChange={() => onChange(g)} />
              {g}
            </label>
          );
        })}
      </div>
      {error && <div id={errId} className="mt-1 text-xs text-rose-600">{error}</div>}
    </fieldset>
  );
}
