import {
  Banknote,
  CreditCard,
  Landmark,
  Smartphone,
  Users2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "@/lib/mock/app";

export function accountIcon(type: AccountType): LucideIcon {
  switch (type) {
    case "bank":
      return Landmark;
    case "cash":
      return Banknote;
    case "mobile":
      return Smartphone;
    case "wallet":
      return Wallet;
    case "card":
      return CreditCard;
    case "shared":
      return Users2;
  }
}

/**
 * Health color spot for an account balance (USD-equivalent).
 * <50 orange, up to 500 yellow, >=500 & <1000 lime, >=1000 green.
 */
export function balanceSpot(balance: number): {
  className: string;
  label: string;
} {
  if (balance < 50) return { className: "bg-primary shadow-primary/60", label: "Low balance" };
  if (balance < 500) return { className: "bg-warning shadow-warning/60", label: "Building" };
  if (balance < 1000) return { className: "bg-lime-400 shadow-lime-400/60", label: "Healthy" };
  return { className: "bg-success shadow-success/60", label: "Strong" };
}
