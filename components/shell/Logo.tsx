import React from "react";

/**
 * SpotOn-style mark: a solid dot inside a ring, followed by the wordmark.
 * Matches the production lockup (circular icon + wordmark, single colour).
 */
export function Logo({
  className,
  wordmark = true,
  size = 26,
}: {
  className?: string;
  wordmark?: boolean;
  size?: number;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="16" cy="16" r="6.5" fill="currentColor" />
      </svg>
      {wordmark && (
        <span className="text-[19px] font-semibold leading-none tracking-[-.02em]">
          Spot<span className="font-normal">On</span>
        </span>
      )}
      <span className="sr-only">SpotOn</span>
    </span>
  );
}
