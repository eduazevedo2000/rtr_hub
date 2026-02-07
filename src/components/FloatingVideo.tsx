import { motion } from "framer-motion";

export const FloatingVideo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed bottom-4 right-4 z-50 pointer-events-none"
    >
      <div className="h-64 w-64 rounded-lg overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover object-center"
        >
          <source src="/images/parcerias/Logo pc componentes Glow cor.webm" type="video/webm" />
        </video>
      </div>
    </motion.div>
  );
};
