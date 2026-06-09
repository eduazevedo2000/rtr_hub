import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const CONFETTI_PIECES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 5,
  duration: 2.5 + Math.random() * 3,
  size: 4 + Math.random() * 6,
  color:
    i % 5 === 0
      ? "hsl(48 100% 50%)"
      : i % 5 === 1
        ? "hsl(24 100% 50%)"
        : i % 5 === 2
          ? "hsl(0 0% 100%)"
          : i % 5 === 3
            ? "hsl(268 52% 58%)"
            : "hsl(36 100% 42%)",
  rotate: Math.random() * 360,
  drift: -30 + Math.random() * 60,
}));

const SPARKLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + Math.random() * 90}%`,
  top: `${5 + Math.random() * 90}%`,
  delay: Math.random() * 4,
  scale: 0.4 + Math.random() * 1,
}));

const LIGHT_RAYS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  rotation: -30 + i * 12,
  delay: i * 0.4,
  opacity: 0.04 + Math.random() * 0.04,
}));

export function LeMansCelebration() {
  return (
    <section className="lemans-celebration relative overflow-hidden border-b border-[hsl(48_100%_50%_/_0.15)]">
      <div className="lemans-bg absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,_hsl(48_100%_50%_/_0.08),_transparent_70%)]" />
      <div className="lemans-bg-pulse absolute inset-0" />

      {/* Light rays */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        {LIGHT_RAYS.map((ray) => (
          <div
            key={ray.id}
            className="light-ray absolute"
            style={{
              "--ray-rotation": `${ray.rotation}deg`,
              "--ray-delay": `${ray.delay}s`,
              "--ray-opacity": ray.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI_PIECES.map((p) => (
          <div
            key={p.id}
            className="confetti-piece absolute -top-3"
            style={{
              left: p.left,
              width: p.size,
              height: p.size * 1.6,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--rotate": `${p.rotate}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Sparkles */}
      <div className="pointer-events-none absolute inset-0">
        {SPARKLES.map((s) => (
          <div
            key={s.id}
            className="sparkle-star absolute"
            style={{
              left: s.left,
              top: s.top,
              animationDelay: `${s.delay}s`,
              "--sparkle-scale": s.scale,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Checkered stripe top */}
      <div className="checkered-strip" />

      <div className="container relative z-10 py-16 sm:py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Trophy cluster */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-6 flex items-center justify-center gap-3"
          >
            <motion.div
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Trophy className="trophy-glow h-8 w-8 text-[hsl(48_100%_50%)]" />
            </motion.div>
            <span className="lemans-label font-racing text-xs font-bold uppercase tracking-[0.3em] text-[hsl(48_100%_50%_/_0.7)]">
              Vencedores
            </span>
            <motion.div
              animate={{ rotate: [8, -8, 8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Trophy className="trophy-glow h-8 w-8 text-[hsl(48_100%_50%)]" />
            </motion.div>
          </motion.div>

          {/* Main title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lemans-title font-racing text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl md:text-7xl"
          >
            <span className="block text-gold-gradient-shimmer">24 Horas</span>
            <span className="block mt-1 text-gold-gradient-shimmer" style={{ animationDelay: "0.5s" }}>Le Mans</span>
          </motion.h2>

          {/* Year badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 mb-5 w-fit"
          >
            <div className="lemans-year-badge lemans-year-float font-racing text-xl font-black tracking-[0.15em] sm:text-2xl">
              2026
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mx-auto max-w-lg text-base font-light leading-relaxed text-white/70 sm:text-lg"
          >
            A RIC Team Racing conquistou a vitória na corrida mais icónica do mundo.
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-2 block font-medium text-[hsl(48_100%_65%)]"
            >
              24 horas de pura resistência. Um feito histórico.
            </motion.span>
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lemans-divider mx-auto mt-8 h-px w-48 origin-center"
          />
        </motion.div>
      </div>

      {/* Checkered stripe bottom */}
      <div className="checkered-strip" />
    </section>
  );
}
