import { useEffect, useRef, useState } from "react";

/** Animated count-up to `target` (spring-ish ease-out). Restarts when target changes. */
export function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

/** Localize a location array for tags: drop "all", optionally label it. */
export function cleanLocations(locs?: string[] | null): string[] {
  return (locs || []).filter((l) => l && l !== "all");
}
