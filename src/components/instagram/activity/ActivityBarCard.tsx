"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartContainerReady } from "@/lib/hooks/useChartContainerReady";
import type { ActivityBucket } from "@/lib/types/instagram.types";
import { formatShortDate } from "@/lib/utils/dateUtils";
import { formatFullNumber } from "@/lib/utils/formatters";

interface ActivityBarCardProps {
  title: string;
  description: string;
  buckets: ActivityBucket[];
  emptyReason?: string;
  limitedToLast30Days: boolean;
  effectiveSince: string;
  effectiveUntil: string;
}

function ActivityTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ActivityBucket }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const bucket = payload[0].payload;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white/95 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <p className="font-semibold text-[var(--color-text)]">{bucket.label}</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Seguidores online médios: {formatFullNumber(bucket.value)}
      </p>
      <p className="text-sm text-[var(--color-text-muted)]">Dias analisados: {bucket.sampleCount}</p>
    </div>
  );
}

export function ActivityBarCard({
  title,
  description,
  buckets,
  emptyReason,
  limitedToLast30Days,
  effectiveSince,
  effectiveUntil,
}: ActivityBarCardProps) {
  const { containerRef, isReady, size } = useChartContainerReady<HTMLDivElement>();
  const hasData = buckets.some((bucket) => bucket.sampleCount > 0);

  return (
    <div className="card-surface rounded-[28px] p-5">
      <div className="mb-4 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
        </div>
        {limitedToLast30Days ? (
          <div className="rounded-2xl bg-[var(--color-primary)]/10 px-4 py-3 text-xs font-medium text-[var(--color-primary-dark)]">
            A Meta disponibiliza activity apenas dos últimos 30 dias.
          </div>
        ) : null}
      </div>
      {hasData ? (
        <>
          <div className="mb-3 text-xs text-[var(--color-text-muted)]">
            Janela utilizada: {formatShortDate(effectiveSince)} - {formatShortDate(effectiveUntil)}
          </div>
          <div ref={containerRef} className="h-72 min-h-72 min-w-0 w-full">
            {isReady ? (
              <RechartsBarChart
                data={buckets}
                height={Math.floor(size.height)}
                width={Math.floor(size.width)}
                margin={{ top: 12, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(249, 115, 22, 0.12)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis axisLine={false} tickFormatter={formatFullNumber} tickLine={false} width={72} />
                <Tooltip content={<ActivityTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {buckets.map((bucket) => (
                    <Cell
                      key={bucket.label}
                      fill={bucket.highlighted ? "var(--color-primary)" : "rgba(242, 159, 5, 0.72)"}
                    />
                  ))}
                </Bar>
              </RechartsBarChart>
            ) : null}
          </div>
        </>
      ) : (
        <div className="flex min-h-72 items-center justify-center rounded-2xl bg-white/70 px-6 text-center text-sm leading-6 text-[var(--color-text-muted)]">
          {emptyReason ?? "Dados indisponíveis para contas com menos de 100 seguidores."}
        </div>
      )}
    </div>
  );
}
