import * as React from "react";
import { formatMoney, formatMoneyExact, type MoneyOptions } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoneyProps extends MoneyOptions {
  amount: number;
  currency?: string;
  className?: string;
  /** Prefix with an explicit sign, e.g. +$1.2K / -$300 */
  signed?: boolean;
}

/**
 * Renders a compacted money value (K / M / B) and reveals the exact amount on hover.
 * Use this anywhere money is displayed instead of raw formatMoney().
 */
export function Money({ amount, currency = "USD", className, signed, ...opts }: MoneyProps) {
  const sign = signed ? (amount > 0 ? "+" : amount < 0 ? "−" : "") : "";
  const value = signed ? Math.abs(amount) : amount;
  const short = `${sign}${formatMoney(value, currency, opts)}`;
  const exact = `${sign}${formatMoneyExact(value, currency, opts.locale)}`;

  if (short === exact) return <span className={className}>{short}</span>;

  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help underline-offset-4 hover:underline", className)}>
            {short}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="font-mono text-xs tabular-nums">
          {exact}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
