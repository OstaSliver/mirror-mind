import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function MainLayout() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-slate-900 grid place-items-center text-white font-bold">M</div>
            <div>
              <div className="text-xl font-semibold">Mirror my mind</div>
              <div className="text-xs text-slate-500">กระจกสะท้อนอารมณ์</div>
            </div>
          </div>
          <Button variant="outline" onClick={() => nav("/home")}>หน้าแรก</Button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
