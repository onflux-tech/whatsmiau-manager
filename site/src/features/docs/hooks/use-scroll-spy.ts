import { useCallback, useEffect, useRef, useState } from "react";

export function useScrollSpy(
  sectionIds: string[],
  scrollRef: React.RefObject<HTMLDivElement | null>,
) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const manualScroll = useRef(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (manualScroll.current) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        root: container,
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      },
    );

    for (const id of sectionIds) {
      const el = container.querySelector(`#${CSS.escape(id)}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sectionIds, scrollRef]);

  const scrollTo = useCallback(
    (id: string) => {
      const container = scrollRef.current;
      if (!container) return;

      const el = container.querySelector(`#${CSS.escape(id)}`);
      if (!el) return;

      manualScroll.current = true;
      setActiveId(id);

      el.scrollIntoView({ behavior: "smooth", block: "start" });

      setTimeout(() => {
        manualScroll.current = false;
      }, 1000);
    },
    [scrollRef],
  );

  return { activeId, scrollTo };
}
