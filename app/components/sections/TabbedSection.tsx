"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import SectionHeading from "./SectionHeading";

type Tab = {
  label: string;
  /** Rendered on the server and passed in, so every panel is in the initial HTML. */
  panel: ReactNode;
};

type Props = {
  title: string;
  tabs: Tab[];
};

/** Section heading with tabs on the right; switches between pre-rendered panels. */
export default function TabbedSection({ title, tabs }: Props) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  // Arrow keys move between tabs, as in the WAI-ARIA tabs pattern.
  const onKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const tabList = (
    <div
      role="tablist"
      aria-labelledby={`${id}-heading`}
      onKeyDown={onKeyDown}
      className="flex max-w-full gap-1 overflow-x-auto rounded-lg bg-white p-1 shadow-sm ring-1 ring-black/5"
    >
      {tabs.map((tab, i) => (
        <button
          key={tab.label}
          ref={(el) => {
            tabRefs.current[i] = el;
          }}
          type="button"
          role="tab"
          id={`${id}-tab-${i}`}
          aria-selected={i === active}
          aria-controls={`${id}-panel-${i}`}
          tabIndex={i === active ? 0 : -1}
          onClick={() => setActive(i)}
          className={`shrink-0 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            i === active
              ? "bg-[var(--header-brand)] text-white"
              : "text-neutral-600 hover:bg-black/5 hover:text-black"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <section aria-labelledby={`${id}-heading`} className="w-full font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <SectionHeading id={`${id}-heading`} title={title} action={tabList} />
        {tabs.map((tab, i) => (
          <div
            key={tab.label}
            role="tabpanel"
            id={`${id}-panel-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            hidden={i !== active}
          >
            {tab.panel}
          </div>
        ))}
      </div>
    </section>
  );
}
