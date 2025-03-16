import { motion } from "framer-motion";

export function DragOverlay() {
  return (
    <motion.div
      className="absolute inset-0 border-2 border-purple-500 border-dashed rounded-lg pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}
