import { Bell, Coins, MessageSquare, Sparkles, TrendingDown, UserPlus, type LucideIcon } from "lucide-react";

export interface AppNotification {
  id: string;
  icon: LucideIcon;
  category: "money" | "shared" | "system" | "ai";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", icon: TrendingDown, category: "money", title: "Overdue payment", body: "Loan to Priya is 3 days overdue.", createdAt: "2026-07-10T08:00:00Z", read: false },
  { id: "n2", icon: UserPlus, category: "shared", title: "New member joined", body: "Diego joined 'Family Rent Pool'.", createdAt: "2026-07-09T14:30:00Z", read: false },
  { id: "n3", icon: Sparkles, category: "ai", title: "Ferron drafted a July report", body: "Tap to review and email it.", createdAt: "2026-07-09T09:15:00Z", read: false },
  { id: "n4", icon: Coins, category: "money", title: "Rule hit: Auto-save 10%", body: "Moved $420 to Emergency Fund.", createdAt: "2026-07-08T12:00:00Z", read: true },
  { id: "n5", icon: MessageSquare, category: "shared", title: "New comment on transaction", body: "Alex: 'that was my Uber, not shared'.", createdAt: "2026-07-07T20:20:00Z", read: true },
  { id: "n6", icon: Bell, category: "system", title: "Weekly summary is ready", body: "Your July week 2 summary is available.", createdAt: "2026-07-07T08:00:00Z", read: true },
];
