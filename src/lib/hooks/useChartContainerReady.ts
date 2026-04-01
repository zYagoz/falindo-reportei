"use client";

import { useEffect, useRef, useState } from "react";

export function useChartContainerReady<T extends HTMLElement>() {
  const containerRef = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    if (typeof ResizeObserver === "undefined") {
      const timeoutId = window.setTimeout(() => {
        const rect = element.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    containerRef,
    isReady: size.width > 0 && size.height > 0,
    size,
  };
}
