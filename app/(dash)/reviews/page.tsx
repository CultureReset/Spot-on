"use client";

import React from "react";
import {
  Card, CardHeader, PageHeader, Button, Badge, Stat, Tabs, Drawer, Empty, cx, inputClass,
} from "@/components/ui";
import { ChartFrame, LineChart } from "@/components/charts";
import { reviews, reviewStats, days90, type Review } from "@/lib/data";
import { num, pctPlain } from "@/lib/format";
import { IconStar } from "@/components/shell/icons";

const SOURCES = ["All sources", "Google", "Yelp", "Facebook", "SpotOn"];

function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <span className="flex gap-0.5 text-[color:var(--color-s4)]" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <IconStar key={s} size={size} filled={s <= rating} className={s <= rating ? "" : "text-ink-200"} />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const [tab, setTab] = React.useState("All reviews");
  const [source, setSource] = React.useState("All sources");
  const [replying, setReplying] = React.useState<Review | null>(null);
  const [reply, setReply] = React.useState("");

  const needsReply = reviews.filter((r) => !r.replied);
  const shown = reviews.filter((r) => {
    if (tab === "Needs a reply" && r.replied) return false;
    if (tab === "Replied" && !r.replied) return false;
    if (source !== "All sources" && r.source !== source) return false;
    return true;
  });

  // Rating trend over the last 30 days, derived from the review mix.
  const trend = days90.slice(-30).map((d, i) => ({
    label: d.label,
    value: Math.round((4.1 + Math.sin(i / 4) * 0.22 + (i / 30) * 0.2) * 100) / 100,
  }));

  const responseRate = ((reviews.length - needsReply.length) / reviews.length) * 100;

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle="Your reputation across Google, Yelp, Facebook and SpotOn, in one place"
        actions={<Button size="sm">Connect another platform</Button>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Overall rating" value={String(reviewStats.average)} delta={2.1} hint="out of 5" />
        <Stat label="Total reviews" value={num(reviewStats.total)} delta={5.4} hint="all platforms" />
        <Stat label="Response rate" value={pctPlain(responseRate)} hint={`${needsReply.length} awaiting a reply`} />
        <Stat label="Avg. response time" value="6h" hint="under the 24h benchmark" />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Rating breakdown" subtitle="All platforms combined" />
          <div className="mb-4 flex items-end gap-3">
            <p className="text-[40px] font-semibold leading-none text-ink-900">{reviewStats.average}</p>
            <div className="pb-1">
              <Stars rating={Math.round(reviewStats.average)} size={17} />
              <p className="mt-1 text-[12px] text-ink-400">{num(reviewStats.total)} reviews</p>
            </div>
          </div>
          <ul className="space-y-1.5">
            {reviewStats.distribution.map((d) => {
              const total = reviewStats.distribution.reduce((a, x) => a + x.count, 0);
              return (
                <li key={d.stars} className="flex items-center gap-2.5">
                  <span className="tnum w-8 text-[12px] text-ink-500">{d.stars} ★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <span
                      className="block h-full rounded-full bg-[color:var(--color-s1)]"
                      style={{ width: `${(d.count / total) * 100}%` }}
                    />
                  </span>
                  <span className="tnum w-10 text-right text-[12px] text-ink-400">{num(d.count)}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Rating over time" subtitle="Rolling average · last 30 days · axis 3.0–5.0" />
          <ChartFrame
            label="Average rating over time"
            tableColumns={["Day", "Average rating"]}
            tableRows={trend.map((t) => [t.label, t.value.toFixed(2)])}
          >
            <LineChart
              labels={trend.map((t) => t.label)}
              height={230}
              format={(n) => n.toFixed(2)}
              yDomain={[3, 5]}
              series={[{ key: "r", label: "Average rating", color: "var(--color-s1)", values: trend.map((t) => t.value) }]}
            />
          </ChartFrame>
        </Card>
      </div>

      <Card padded={false}>
        <div className="px-4 pt-4 sm:px-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                aria-pressed={source === s}
                className={cx(
                  "ring-focus rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  source === s ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-500 hover:text-ink-900"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Tabs
            tabs={["All reviews", "Needs a reply", "Replied"]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {shown.length === 0 ? (
          <div className="p-5"><Empty title="Nothing here" body="No reviews match this filter." /></div>
        ) : (
          <ul className="divide-y divide-ink-50">
            {shown.map((r) => (
              <li key={r.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Stars rating={r.rating} />
                      <span className="text-[13px] font-medium text-ink-900">{r.author}</span>
                      <Badge tone="neutral">{r.source}</Badge>
                      <span className="text-[12px] text-ink-400">{r.date}</span>
                    </div>
                    <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-700">{r.body}</p>
                    {r.replied && (
                      <div className="mt-3 rounded-lg border-l-2 border-brand-500 bg-ink-50 px-3 py-2.5">
                        <p className="text-[12px] font-medium text-ink-900">Your reply</p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
                          Thank you for taking the time to write this — we&rsquo;ve shared it with the team.
                          We hope to see you again soon.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {r.replied ? (
                      <Badge tone="good">Replied</Badge>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => { setReplying(r); setReply(""); }}>
                        Reply
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Drawer
        open={!!replying}
        onClose={() => setReplying(null)}
        title="Reply to review"
        footer={
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => setReplying(null)}>Cancel</Button>
            <Button size="sm" variant="primary" className="flex-1" onClick={() => setReplying(null)}>
              Post reply
            </Button>
          </div>
        }
      >
        {replying && (
          <div className="space-y-4">
            <div className="rounded-lg border border-ink-100 p-3.5">
              <div className="flex items-center gap-2">
                <Stars rating={replying.rating} />
                <span className="text-[13px] font-medium text-ink-900">{replying.author}</span>
                <Badge tone="neutral">{replying.source}</Badge>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-700">{replying.body}</p>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700" htmlFor="reply">
                Your reply
              </label>
              <textarea
                id="reply"
                rows={6}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Thank them by name, address the specific point, and invite them back."
                className={cx(inputClass, "h-auto py-2")}
              />
              <p className="mt-1 text-[12px] text-ink-400">
                Posts publicly to {replying.source} under your business name.
              </p>
            </div>

            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-400">Suggested replies</p>
              <ul className="space-y-2">
                {(replying.rating >= 4
                  ? [
                      "Thank you so much — we'll pass this along to the kitchen. See you next time.",
                      "This made our day. Thanks for taking the time to write it.",
                    ]
                  : [
                      "We're sorry the timing let you down — that's on us, and we're working on it. We'd love another chance.",
                      "Thank you for the honest feedback. I've shared it with the front-of-house team directly.",
                    ]
                ).map((s) => (
                  <li key={s}>
                    <button
                      onClick={() => setReply(s)}
                      className="ring-focus w-full rounded-lg border border-ink-100 p-3 text-left text-[12.5px] leading-relaxed text-ink-600 transition-colors hover:border-brand-500 hover:bg-brand-50"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
