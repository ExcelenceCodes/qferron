import {
  Bot,
  Coins,
  Gift,
  LayoutDashboard,
  Repeat2,
  Settings,
  Share2,
  Sparkles,
  Wallet,
  ChartBar,
} from "lucide-react";
import type { NavItem } from "@/components/app/app-shell";

export const USER_NAV: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/accounts", label: "Accounts", icon: Wallet },
  { to: "/dashboard/transactions", label: "Transactions", icon: Repeat2 },
  { to: "/dashboard/rules", label: "Automations", icon: Sparkles },
  { to: "/dashboard/assets", label: "Assets", icon: Coins },
  { to: "/dashboard/reports", label: "Reports", icon: ChartBar },
  { to: "/dashboard/shared", label: "Shared", icon: Share2 },
  { to: "/dashboard/chat", label: "AI accountant", icon: Bot },
  { to: "/dashboard/referrals", label: "Referrals", icon: Gift },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

import { Flag, MessageSquare, Newspaper, ShieldCheck, Users } from "lucide-react";

export const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/accounts", label: "Accounts", icon: Wallet },
  { to: "/admin/transactions", label: "Transactions", icon: Repeat2 },
  { to: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/analytics", label: "Analytics", icon: ChartBar },
  { to: "/admin/reports", label: "Moderation", icon: Flag },
  { to: "/admin/settings", label: "Settings", icon: ShieldCheck },
];
