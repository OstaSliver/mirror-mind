// import { useCallback, useState } from "react";
// import { Camera } from "lucide-react";

// import { Card, CardHeader } from "./components/ui/Card";
// import { Button } from "./components/ui/Button";
// import { Presence, Page } from "./components/transition/Page";


// import OnboardSlide from "./features/onboarding/OnboardSlide";
// import Login from "./features/auth/Login";
// import MoodCalendar from "./features/calendar/MoodCalendar";
// import EncourageChat from "./features/chat/EncourageChat";
// import Q11Part1 from "./features/assess/Q11Part1";
// import Q11Result from "./features/assess/Q11Result";

// type Step =
//   | "login"
//   | "onboard1"
//   | "onboard2"
//   | "onboard3"
//   | "scan"
//   | "calendar"
//   | "chat"
//   | "q11_part1"
//   | "q11_part2"
//   | "q11_result";

// function Header({ onHome }: { onHome: () => void }) {
//   return (
//     <div className="mb-6 flex items-center justify-between">
//       <div className="flex items-center gap-3">
//         <div className="size-10 rounded-2xl bg-slate-900 grid place-items-center text-white font-bold">M</div>
//         <div>
//           <div className="text-xl font-semibold">Mirror my mind</div>
//           <div className="text-xs text-slate-500">กระจกสะท้อนอารมณ์</div>
//         </div>
//       </div>
//       <Button variant="outline" onClick={onHome}>หน้าแรก</Button>
//     </div>
//   );
// }

// export default function App() {
//   const [step, setStep] = useState<Step>("login");
//   const go = useCallback((s: Step) => setStep(s), []);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800 [color-scheme:light]">
//       <div className="mx-auto max-w-4xl px-4 py-6">
//         <Header onHome={() => go("calendar")} />

//         {/* ✅ Page transition */}
//         <Presence mode="wait">
//           {step === "login" && (
//             <Page key="login">
//               <Login onNext={() => go("onboard1")} />
//             </Page>
//           )}

//           {step === "onboard1" && (
//             <Page key="onboard1">
//               <OnboardSlide
//                 title="ผลของสแกนหน้าเพื่อประเมินอารมณ์"
//                 description="ดูภาพรวมความรู้สึกของคุณในแต่ละวัน พร้อมคำอธิบายสั้นๆ"
//                 cta="ถัดไป"
//                 iconName="smile"
//                 onNext={() => go("onboard2")}
//               />
//             </Page>
//           )}

//           {step === "onboard2" && (
//             <Page key="onboard2">
//               <OnboardSlide
//                 title="แจ้งเตือนให้ทำแบบประเมินประจำวัน"
//                 description="ระบบจะเตือนให้ทำการประเมิน เพื่อเก็บรวบรวมข้อมูลอารมณ์"
//                 cta="ถัดไป"
//                 iconName="calendar"
//                 onNext={() => go("onboard3")}
//               />
//             </Page>
//           )}

//           {step === "onboard3" && (
//             <Page key="onboard3">
//               <OnboardSlide
//                 title="กดเพื่อไปหน้าสแกนหน้า"
//                 description="เริ่มต้นด้วยการสแกนใบหน้าสั้นๆ เพื่อช่วยประเมินอารมณ์"
//                 cta="เริ่มสแกน"
//                 iconName="camera"
//                 onNext={() => go("scan")}
//               />
//             </Page>
//           )}

//           {step === "scan" && (
//             <Page key="scan">
//               <Card>
//                 <CardHeader
//                   title={<div className="flex items-center gap-2"><Camera className="size-5" />สแกนใบหน้าเพื่อประเมินอารมณ์เศร้า</div>}
//                   description="หมายเหตุ: ใช้เพื่อเป็นแนวทางเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์"
//                 />
//                 <div className="p-6">
//                   <div className="rounded-3xl border aspect-video grid place-items-center">
//                     <div className="text-slate-400">กล้องพรีวิว</div>
//                   </div>
//                   <div className="mt-4 flex gap-3">
//                     <Button onClick={() => go("calendar")}>ไปหน้าปฏิทิน</Button>
//                     <Button variant="outline">วิธีใช้งาน</Button>
//                   </div>
//                 </div>
//               </Card>
//             </Page>
//           )}

//           {step === "calendar" && (
//             <Page key="calendar">
//               <MoodCalendar
//                 onOpenChat={() => go("chat")}
//                 onOpenQ11={() => go("q11_part1")}
//               />
//             </Page>
//           )}

//           {step === "chat" && (
//             <Page key="chat">
//               <EncourageChat onBack={() => go("calendar")} />
//             </Page>
//           )}

//           {step === "q11_part1" && (
//             <Page key="q11_part1">
//               <Q11Part1 onNext={() => go("q11_result")} onCancel={() => go("calendar")} />
//             </Page>
//           )}

//           {step === "q11_result" && (
//             <Page key="q11_result">
//               <Q11Result onDone={() => go("calendar")} />
//             </Page>
//           )}
//         </Presence>
//       </div>
//     </div>
//   );
// }

import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Presence, Page } from "./components/transition/Page";
import MainLayout from "./layouts/MainLayout";

import Login from "./features/auth/Login";
import Register from "./features/auth/Register";      // ถ้ามี
import OnboardSlide from "./features/onboarding/OnboardSlide";
import MoodCalendar from "./features/calendar/MoodCalendar";
import EncourageChat from "./features/chat/EncourageChat";
import Q11Part1 from "./features/assess/Q11Part1";
import Q11Result from "./features/assess/Q11Result";
import Home from "./features/home/Home";
import RequireAuth from "./routes/RequireAuth";

import { Camera } from "lucide-react";
import { Card, CardHeader } from "./components/ui/Card";
import { Button } from "./components/ui/Button";

function AnimatedRoutes() {
  const location = useLocation();
  const nav = useNavigate();

  return (
    <Presence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route index element={<Page><Login onNext={() => nav("/onboarding/1")} /></Page>} />
          <Route path="register" element={<Page><Register onDone={() => nav("/")} /></Page>} />

          <Route path="onboarding/1" element={
            <Page><OnboardSlide
              title="ผลของสแกนหน้าเพื่อประเมินอารมณ์"
              description="ดูภาพรวมความรู้สึกของคุณในแต่ละวัน พร้อมคำอธิบายสั้นๆ"
              cta="ถัดไป" iconName="smile" onNext={() => nav("/onboarding/2")} /></Page>} />
          <Route path="onboarding/2" element={
            <Page><OnboardSlide
              title="แจ้งเตือนให้ทำแบบประเมินประจำวัน"
              description="ระบบจะเตือนให้ทำการประเมิน เพื่อเก็บข้อมูลอารมณ์"
              cta="ถัดไป" iconName="calendar" onNext={() => nav("/onboarding/3")} /></Page>} />
          <Route path="onboarding/3" element={
            <Page><OnboardSlide
              title="กดเพื่อไปหน้าสแกนหน้า"
              description="เริ่มสแกนใบหน้าสั้น ๆ เพื่อช่วยประเมินอารมณ์"
              cta="เริ่มสแกน" iconName="camera" onNext={() => nav("/scan")} /></Page>} />

          <Route path="scan" element={
            <Page><Card>
              <CardHeader title={<div className="flex items-center gap-2"><Camera className="size-5" />สแกนใบหน้าเพื่อประเมินอารมณ์เศร้า</div>}
                description="หมายเหตุ: ใช้เพื่อเป็นแนวทางเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์" />
              <div className="p-6">
                <div className="rounded-3xl border aspect-video grid place-items-center"><div className="text-slate-400">กล้องพรีวิว</div></div>
                <div className="mt-4 flex gap-3">
                  <Button onClick={() => nav("/calendar")}>ไปหน้าปฏิทิน</Button>
                  <Button variant="outline">วิธีใช้งาน</Button>
                </div>
              </div>
            </Card></Page>} />
          <Route element={<RequireAuth />}>
            <Route path="calendar" element={
              <Page><MoodCalendar onOpenChat={() => nav("/chat")} onOpenQ11={() => nav("/q11")} /></Page>} />
            <Route path="chat" element={<Page><EncourageChat onBack={() => nav("/calendar")} /></Page>} />
            <Route path="q11" element={<Page><Q11Part1 onNext={() => nav("/q11/result")} onCancel={() => nav("/calendar")} /></Page>} />
            <Route path="q11/result" element={<Page><Q11Result onDone={() => nav("/calendar")} /></Page>} />
            <Route path="home" element={<Page><Home /></Page>} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Presence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
