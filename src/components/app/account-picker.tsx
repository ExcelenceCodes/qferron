import { Landmark, Smartphone, Wallet, CreditCard, Coins, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts, type AccountRow } from "@/lib/queries/finance";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Wallet> = {
  bank: Landmark,
  mobile: Smartphone,
  cash: Coins,
  wallet: Wallet,
  card: CreditCard,
  shared: Users,
};

export function accountIcon(type: string) {
  return ICONS[type] ?? Wallet;
}

interface MoneySourceSelectProps {
  value: string;
  onChange: (v: string) => void;
  /** "out" filters to accounts that can actually cover `amount`. */
  direction: "in" | "out";
  amount?: number;
  label?: string;
  hint?: string;
  id?: string;
  required?: boolean;
}

/**
 * Money rotation: every value flow must be attached to an account the user
 * already holds inside Ferron. Outgoing flows can only pick accounts with
 * enough funds (cards may run negative).
 */
export function MoneySourceSelect({
  value,
  onChange,
  direction,
  amount = 0,
  label,
  hint,
  id = "money-source",
  required = true,
}: MoneySourceSelectProps) {
  const { data: accounts, isLoading } = useAccounts();
  const rows = (accounts ?? []).filter((a) => !a.archived);

  const canCover = (a: AccountRow) =>
    direction === "in" || a.type === "card" || Number(a.balance) >= amount;

  const heading = label ?? (direction === "out" ? "Pay from account" : "Receive into account");

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{heading}</Label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={isLoading ? "Loading accounts…" : "Choose an account"} />
        </SelectTrigger>
        <SelectContent>
          {rows.map((a) => {
            const Icon = accountIcon(a.type);
            const ok = canCover(a);
            return (
              <SelectItem key={a.id} value={a.id} disabled={!ok}>
                <span className="flex w-full items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{a.name}</span>
                  <span
                    className={cn(
                      "ml-auto pl-3 font-mono text-xs tabular-nums",
                      ok ? "text-muted-foreground" : "text-destructive",
                    )}
                  >
                    {formatMoney(Number(a.balance), a.currency)}
                  </span>
                </span>
              </SelectItem>
            );
          })}
          {rows.length === 0 && !isLoading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No accounts yet.</div>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {hint ??
          (direction === "out"
            ? "Money leaves this account and is recorded as a transaction automatically."
            : "Money lands in this account and is recorded as a transaction automatically.")}
      </p>
    </div>
  );
}
