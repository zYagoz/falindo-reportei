"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeInfo, BarChart3, Building2, Camera } from "lucide-react";

const items = [
  {
    href: "/instagram",
    label: "Instagram",
    icon: Camera,
    enabled: true,
    imageSrc: "/instagram-logo.png",
  },
  { href: "/facebook", label: "Facebook", icon: BadgeInfo, enabled: false },
  { href: "/linkedin", label: "LinkedIn", icon: Building2, enabled: false },
];

function PlatformIcon({
  icon: Icon,
  label,
  imageSrc,
}: {
  icon: typeof Camera;
  label: string;
  imageSrc?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageSrc]);

  if (imageSrc && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={`${label} logo`}
        className="h-7 w-7 shrink-0 object-contain"
        onError={() => setImageFailed(true)}
        src={imageSrc}
      />
    );
  }

  return <Icon size={18} />;
}

export function PlatformNav() {
  const pathname = usePathname();

  return (
    <aside className="panel-surface grid-dots rounded-[30px] p-5 lg:sticky lg:top-6 lg:min-h-[calc(100vh-3rem)]">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white">
          <BarChart3 size={22} />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-primary-dark)]">
            Social Insights
          </p>
          <strong className="block text-lg">Agency Console</strong>
        </div>
      </div>
      <nav className="space-y-3">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              className={`flex items-center justify-between rounded-[22px] border px-4 py-3 transition ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-transparent bg-white/80 text-[var(--color-text)] hover:border-[var(--color-border)]"
              }`}
              href={item.href}
            >
              <span className="flex items-center gap-3">
                <PlatformIcon icon={item.icon} imageSrc={item.imageSrc} label={item.label} />
                <span className="font-medium">{item.label}</span>
              </span>
              {!item.enabled ? (
                <span className="rounded-full bg-black/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
                  Em breve
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
