export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  complete: {
    initial: { backgroundColor: "transparent" },
    animate: {
      backgroundColor: ["transparent", "rgba(34, 197, 94, 0.2)", "transparent"],
      transition: { duration: 0.5 },
    },
  },
  delete: {
    initial: { opacity: 1, x: 0 },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  },
  drag: {
    initial: {
      scale: 1,
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      transition: { duration: 0.2 },
    },
    active: {
      scale: 1.02,
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
      cursor: "grabbing",
      zIndex: 999,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  },
};
