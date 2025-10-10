import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const from = value;
    const diff = target - from;
    function step(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad-ish
      setValue(Math.round(from + diff * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

function generateSeries(points = 28) {
  const arr = new Array(points).fill(0).map((_, i) => {
    const base = Math.sin(i / 3) * 0.5 + 0.5;
    const noise = (Math.random() - 0.5) * 0.35;
    return Math.max(0, base + noise);
  });
  return arr;
}

function buildPath(data: number[], width: number, height: number) {
  if (!data.length) return "";
  const step = width / (data.length - 1);
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(0.0001, max - min);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return [x, y];
  });
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
}

export default function FuturisticStats({ className = "" }: { className?: string }) {
  const WIDTH = 760;
  const HEIGHT = 160;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const series = useMemo(() => generateSeries(28), []);
  const path = useMemo(() => buildPath(series, WIDTH, HEIGHT), [series]);
  const totalEarnings = useMemo(() => 1240000 + Math.floor(Math.random() * 40000), []);
  const activeUsers = useMemo(() => 328 + Math.floor(Math.random() * 120), []);
  const animatedEarnings = useAnimatedNumber(totalEarnings, 1400);
  const animatedUsers = useAnimatedNumber(activeUsers, 1200);

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // subtle periodic refresh to make it feel alive
    const id = setInterval(() => {
      // no-op for now, placeholder for future live updates
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`futuristic-stats relative ${className}`}>
      {/* particle backdrop */}
      <div className="particles absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{ opacity: 0, scale: 0.6, x: 0, y: 0 }}
            animate={{ opacity: [0.15, 0.45, 0.15], y: [0, -18, 0], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 6 + i * 0.6, repeat: Infinity, delay: i * 0.4 }}
            style={{ left: `${(i * 13) % 100}%`, top: `${20 + (i * 9) % 50}%` }}
          />
        ))}
      </div>

      <div className="grid w-full gap-4 md:grid-cols-3">
        <div className="col-span-2">
          <div className="relative rounded-2xl border bg-gradient-to-b from-card to-transparent p-4 shadow-2xl">
            <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height="100%" preserveAspectRatio="none" className="rounded">
              <defs>
                <linearGradient id="fh-gradient" x1="0" x2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary-600))" stopOpacity={0.98} />
                  <stop offset="60%" stopColor="hsl(var(--primary-500))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--primary-400))" stopOpacity={0.85} />
                </linearGradient>
                <linearGradient id="fh-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary-500) / 0.28)" />
                  <stop offset="100%" stopColor="hsl(var(--accent-400) / 0.06)" />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* area fill */}
              <path d={`${path} L ${WIDTH},${HEIGHT} L 0,${HEIGHT} Z`} fill="url(#fh-area)" opacity={0.9} />

              {/* glowing stroke */}
              <path d={path} fill="none" stroke="url(#fh-gradient)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "url(#glow)" }} />

              {/* animated dashed overlay */}
              <path d={path} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="8 10" strokeLinecap="round">
                <animate attributeName="stroke-dashoffset" from="0" to="-80" dur="6s" repeatCount="indefinite" />
              </path>

              {/* hover dots */}
              {series.map((v, i) => {
                const x = (i * WIDTH) / (series.length - 1);
                const max = Math.max(...series);
                const min = Math.min(...series);
                const y = HEIGHT - ((v - min) / Math.max(0.0001, max - min)) * HEIGHT;
                return (
                  <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
                    <circle cx={x} cy={y} r={hoverIndex === i ? 5.5 : 3.5} fill="url(#fh-gradient)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                    {hoverIndex === i && (
                      <g>
                        <rect x={x - 42} y={y - 44} width={92} height={28} rx={6} fill="rgba(0,0,0,0.6)" />
                        <text x={x - 32} y={y - 24} fill="#fff" fontSize={12} fontFamily="Inter, system-ui, sans-serif">{`${Math.round(v * 1200)} pts`}</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* floating summary */}
            <div className="absolute right-4 top-4 flex flex-col items-end text-right">
              <div className="text-xs text-muted-foreground">Realtime earnings</div>
              <div className="mt-1 text-lg font-semibold tracking-tight">${animatedEarnings.toLocaleString()}</div>
              <div className="mt-3 text-xs text-muted-foreground">Active users</div>
              <div className="mt-1 text-sm font-medium text-primary">{animatedUsers} users</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <motion.div className="rounded-lg border bg-card p-4 shadow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <div className="text-sm text-muted-foreground">Approval Rate</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold">98%</div>
              <div>
                <div className="text-sm font-medium">98.4% avg</div>
                <div className="text-xs text-muted-foreground">High quality verification</div>
              </div>
            </div>
          </motion.div>

          <motion.div className="rounded-lg border bg-card p-4 shadow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <div className="text-sm text-muted-foreground">Monthly tasks</div>
            <div className="mt-2 text-lg font-semibold">250k+</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
