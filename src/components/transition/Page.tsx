// src/components/transition/Page.tsx
import React, { type PropsWithChildren } from "react";
import { motion, AnimatePresence } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -12 },
};

export function Page({ children }: PropsWithChildren) {
  // เคารพผู้ใช้ที่ปิดแอนิเมชัน
  const prefersReduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: prefersReduce ? 0 : 0.25, ease: "easeOut" }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}

// ใช้ห่อรอบๆ routing/สลับหน้าใน App
export const Presence = AnimatePresence;
