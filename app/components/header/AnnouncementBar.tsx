"use client";

import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type Props = {
  messages: string[];
  /** Auto-advance interval in ms. Set to 0 to disable. */
  interval?: number;
};

export default function AnnouncementBar({ messages, interval = 5000 }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = messages.length;

  useEffect(() => {
    if (!interval || count < 2 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [interval, count, paused]);

  if (count === 0) return null;

  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  return (
    <div
      className="flex min-w-0 items-center justify-center gap-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {count > 1 && (
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous announcement"
          className="p-1 opacity-80 transition hover:opacity-100"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
      )}
      <p
        aria-live="polite"
        className="min-w-0 truncate text-center text-xs font-bold tracking-wide sm:min-w-[22rem] sm:text-sm"
      >
        {messages[index]}
      </p>
      {count > 1 && (
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next announcement"
          className="p-1 opacity-80 transition hover:opacity-100"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
