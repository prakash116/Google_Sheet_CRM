"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

const format = (v: number) => Math.round(v).toLocaleString("en-IN");

/** Counts up once in view; writes to the DOM directly so animation frames don't re-render React. */
function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!inView || !node) return;
    if (reduced) {
      node.textContent = format(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (node.textContent = format(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return <span ref={ref}>0</span>;
}

export default function StatsRow({ stats }: { stats: { label: string; value: number }[] }) {
  return (
    <dl className="grid grid-cols-3 gap-4 border-t border-line pt-8">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col-reverse">
          <dt className="eyebrow mt-2">{s.label}</dt>
          <dd className="font-display text-4xl text-fg md:text-5xl">
            <CountUp value={s.value} />
            <span className="text-accent">+</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
