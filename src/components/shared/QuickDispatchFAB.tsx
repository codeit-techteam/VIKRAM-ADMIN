"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export function QuickDispatchFAB() {
  return (
    <motion.div
      className="fixed right-6 bottom-6 z-50"
      whileTap={{ scale: 0.95 }}
    >
      <Button className="bg-primary hover:bg-primary/90 h-auto gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg">
        <Zap className="size-4 fill-white" />
        Quick Dispatch
      </Button>
    </motion.div>
  );
}
