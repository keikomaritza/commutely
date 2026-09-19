"use client";

import { useEffect, useState } from "react";

function getJakartaTime() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function getJakartaDate() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export function DigitalClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(getJakartaTime());
      setDate(getJakartaDate());
    };

    update();

    const interval = window.setInterval(
      update,
      1000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="
        glass
        flex
        items-center
        gap-3
        rounded-full
        px-5
        py-3
      "
    >
      {/* STATUS DOT */}

      <div
        className="
          size-2
          shrink-0
          rounded-full
          bg-[var(--color-primary)]
        "
        aria-hidden="true"
      />

      {/* CLOCK CONTENT */}

      <div className="leading-none">
        <div
          className="
            flex
            items-baseline
            whitespace-nowrap
          "
        >
          <span
            className="
              font-display
              text-[16px]
              font-semibold
              tracking-[-0.025em]
              text-[var(--color-ink)]
            "
          >
            {time || "--:--:--"}
          </span>

          <span
            className="
              ml-2
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[var(--color-muted)]
            "
          >
            WIB
          </span>
        </div>

        <div
          className="
            mt-1.5
            text-[9px]
            font-medium
            tracking-[0.02em]
            text-[var(--color-muted)]
          "
        >
          {date || "Jakarta"}
          {" · Jakarta"}
        </div>
      </div>
    </div>
  );
}