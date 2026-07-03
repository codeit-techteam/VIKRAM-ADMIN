"use client";

import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkflowLoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function WorkflowLoadingOverlay({
  visible,
  message = "Loading next step...",
}: WorkflowLoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[2px]"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="text-primary size-8 animate-spin" />
            <p className="text-sm font-medium text-[#64748B]">{message}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
