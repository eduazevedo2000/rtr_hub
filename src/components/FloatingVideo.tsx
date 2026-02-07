import { motion } from "framer-motion";

export const FloatingVideo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <a 
        href="https://ricfazeres.net/PcComponentes?r=lp&m=Mp49eX6blXH" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <motion.div 
          className="h-64 w-64 rounded-lg overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover object-center pointer-events-none"
          >
            <source src="/images/parcerias/Logo pc componentes Glow cor.webm" type="video/webm" />
          </video>
        </motion.div>
      </a>
    </motion.div>
  );
};
