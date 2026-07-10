export interface AIFunctionMap {
  id: string;
  location: string;
  buttonLabel: string;
  showingPrompt: string;
  endpoint: string;
  systemPrompt: string;
  markupSupport: string[];
  dataInjections: string[];
}

export const AI_FUNCTIONS: AIFunctionMap[] = [
  {
    id: "dashboard.july_report",
    location: "Dashboard",
    buttonLabel: "Ask Ferron",
    showingPrompt: "July report",
    endpoint: "https://api.ferron.app/ai/chat",
    systemPrompt:
      "You are Ferron, a warm, precise personal accountant. Summarise the user's July activity with 3 key takeaways.",
    markupSupport: ["markdown", "tables", "mermaid"],
    dataInjections: ["accounts_summary", "recent_transactions(30d)", "user_locale", "base_currency"],
  },
  {
    id: "reports.explain",
    location: "Reports",
    buttonLabel: "Explain trend",
    showingPrompt: "Why did dining go up?",
    endpoint: "https://api.ferron.app/ai/chat",
    systemPrompt:
      "You explain category changes with a short reason + 2 concrete actions the user can take.",
    markupSupport: ["markdown"],
    dataInjections: ["reports_categories(60d)"],
  },
  {
    id: "accounts.analyze",
    location: "Accounts",
    buttonLabel: "AI analysis",
    showingPrompt: "Analyse this account",
    endpoint: "https://api.ferron.app/ai/chat",
    systemPrompt: "Analyse balance trend, inflow/outflow ratio, and flag risks.",
    markupSupport: ["markdown", "tables"],
    dataInjections: ["account_transactions(90d)"],
  },
  {
    id: "automations.recommend",
    location: "Automations",
    buttonLabel: "Recommend rules",
    showingPrompt: "What rules should I turn on?",
    endpoint: "https://api.ferron.app/ai/chat",
    systemPrompt: "Suggest 3 automation rules based on repeating merchants.",
    markupSupport: ["markdown"],
    dataInjections: ["transactions(90d)"],
  },
];
