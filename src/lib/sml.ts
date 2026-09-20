/**
 * SML — Specialised Monetary Language.
 *
 * A tiny, safe, declarative language that carries monetary intent (transactions
 * and automations) at a glance. Every Ferron automation and transaction is
 * compiled to SML in the background; the UI covers it completely, and users who
 * are comfortable with it can read/write SML directly.
 *
 * Program shape:
 *
 *   @SML:start
 *   @SML:on transaction out
 *   @SML:if merchant contains "Uber"
 *   @SML:send 10% to account "Savings"
 *   @SML:endif
 *   @SML:end
 */

export const SML_OPEN = "@SML:start";
export const SML_CLOSE = "@SML:end";

/** Every markup keyword the language understands. */
export const SML_KEYWORDS = [
  "start",
  "end",
  "on",
  "if",
  "else",
  "endif",
  "switch",
  "case",
  "endswitch",
  "transaction",
  "move",
  "send",
  "buy",
  "sell",
  "pay",
  "save",
  "note",
  "flag",
  "notify",
  "category",
  "let",
] as const;

export type SmlKeyword = (typeof SML_KEYWORDS)[number];

export const SML_OPERATORS = [
  "contains",
  "equals",
  "starts_with",
  "greater_than",
  "less_than",
] as const;

export type SmlOperator = (typeof SML_OPERATORS)[number];
export type SmlField = "merchant" | "category" | "note" | "amount" | "direction";
export type SmlTrigger = "any" | "money_in" | "money_out";
export type SmlAction =
  | "set_category"
  | "add_note"
  | "flag"
  | "notify"
  | "move_to_account";

export interface SmlRule {
  name: string;
  trigger: SmlTrigger;
  field: SmlField;
  operator: SmlOperator;
  value: string;
  action: SmlAction;
  /** Free-text payload for set_category / add_note / notify / flag. */
  actionValue: string;
  /** Destination account (name) for move_to_account. */
  accountName: string;
  amountKind: "percent" | "fixed";
  amountValue: number;
}

export const EMPTY_RULE: SmlRule = {
  name: "",
  trigger: "any",
  field: "merchant",
  operator: "contains",
  value: "",
  action: "set_category",
  actionValue: "",
  accountName: "",
  amountKind: "percent",
  amountValue: 10,
};

const q = (s: string) => `"${String(s ?? "").replace(/"/g, "'")}"`;

/* ----------------------------- compile ----------------------------- */

export function ruleToSml(rule: SmlRule): string {
  const lines: string[] = [SML_OPEN, `@SML:let name ${q(rule.name)}`];
  lines.push(
    `@SML:on transaction ${rule.trigger === "money_in" ? "in" : rule.trigger === "money_out" ? "out" : "any"}`,
  );
  if (rule.value) {
    lines.push(`@SML:if ${rule.field} ${rule.operator} ${q(rule.value)}`);
  } else {
    lines.push(`@SML:if ${rule.field} contains ${q("")}`);
  }

  switch (rule.action) {
    case "set_category":
      lines.push(`  @SML:category set ${q(rule.actionValue)}`);
      break;
    case "add_note":
      lines.push(`  @SML:note add ${q(rule.actionValue)}`);
      break;
    case "flag":
      lines.push(`  @SML:flag ${q(rule.actionValue || rule.name)}`);
      break;
    case "notify":
      lines.push(`  @SML:notify ${q(rule.actionValue || rule.name)}`);
      break;
    case "move_to_account":
      lines.push(
        `  @SML:send ${rule.amountKind === "percent" ? `${rule.amountValue}%` : rule.amountValue} to account ${q(rule.accountName)}`,
      );
      break;
  }

  lines.push("@SML:endif", SML_CLOSE);
  return lines.join("\n");
}

/** Background SML record of a single transaction — the money ledger language. */
export function transactionToSml(tx: {
  direction: "in" | "out";
  amount: number;
  currency: string;
  category?: string | null;
  merchant?: string | null;
  account?: string | null;
  occurred_at?: string | null;
}): string {
  const parts = [
    `@SML:transaction ${tx.direction} ${tx.amount} ${tx.currency}`,
    tx.account ? `account ${q(tx.account)}` : "",
    tx.category ? `category ${q(tx.category)}` : "",
    tx.merchant ? `merchant ${q(tx.merchant)}` : "",
    tx.occurred_at ? `on ${tx.occurred_at}` : "",
  ].filter(Boolean);
  return [SML_OPEN, parts.join(" "), SML_CLOSE].join("\n");
}

export function assetSaleToSml(input: {
  asset: string;
  amount: number;
  currency: string;
  account: string;
  date: string;
}): string {
  return [
    SML_OPEN,
    `@SML:sell asset ${q(input.asset)} for ${input.amount} ${input.currency} to account ${q(input.account)} on ${input.date}`,
    SML_CLOSE,
  ].join("\n");
}

/* ------------------------------ parse ------------------------------ */

export type SmlParseResult =
  | { ok: true; rule: SmlRule }
  | { ok: false; error: string; line?: number };

const strArg = (s: string) => {
  const m = s.match(/"([^"]*)"/);
  return m ? m[1]! : s.trim();
};

export function parseSml(source: string): SmlParseResult {
  const raw = source.split("\n").map((l) => l.trim()).filter(Boolean);
  if (raw.length === 0) return { ok: false, error: "Empty program." };
  if (raw[0] !== SML_OPEN) return { ok: false, error: `Program must open with ${SML_OPEN}.`, line: 1 };
  if (raw[raw.length - 1] !== SML_CLOSE)
    return { ok: false, error: `Program must close with ${SML_CLOSE}.`, line: raw.length };

  const rule: SmlRule = { ...EMPTY_RULE, value: "", actionValue: "" };
  let sawIf = false;
  let sawAction = false;

  for (let i = 1; i < raw.length - 1; i++) {
    const line = raw[i]!;
    if (!line.startsWith("@SML:")) return { ok: false, error: `Line ${i + 1}: every statement starts with @SML:`, line: i + 1 };
    const body = line.slice(5);
    const [kw, ...restArr] = body.split(/\s+/);
    const rest = restArr.join(" ");
    switch (kw) {
      case "let": {
        const m = rest.match(/^name\s+(.*)$/);
        if (m) rule.name = strArg(m[1]!);
        break;
      }
      case "on": {
        const dir = rest.replace(/^transaction\s*/, "").trim();
        rule.trigger = dir === "in" ? "money_in" : dir === "out" ? "money_out" : "any";
        break;
      }
      case "if": {
        const m = rest.match(/^(\w+)\s+(\w+)\s+(.*)$/);
        if (!m) return { ok: false, error: `Line ${i + 1}: expected "if <field> <operator> "value"".`, line: i + 1 };
        if (!(["merchant", "category", "note", "amount", "direction"] as string[]).includes(m[1]!))
          return { ok: false, error: `Line ${i + 1}: unknown field "${m[1]}".`, line: i + 1 };
        if (!(SML_OPERATORS as readonly string[]).includes(m[2]!))
          return { ok: false, error: `Line ${i + 1}: unknown operator "${m[2]}".`, line: i + 1 };
        rule.field = m[1] as SmlField;
        rule.operator = m[2] as SmlOperator;
        rule.value = strArg(m[3]!);
        sawIf = true;
        break;
      }
      case "endif":
      case "else":
      case "switch":
      case "case":
      case "endswitch":
        break;
      case "category":
        rule.action = "set_category";
        rule.actionValue = strArg(rest.replace(/^set\s*/, ""));
        sawAction = true;
        break;
      case "note":
        rule.action = "add_note";
        rule.actionValue = strArg(rest.replace(/^add\s*/, ""));
        sawAction = true;
        break;
      case "flag":
        rule.action = "flag";
        rule.actionValue = strArg(rest);
        sawAction = true;
        break;
      case "notify":
        rule.action = "notify";
        rule.actionValue = strArg(rest);
        sawAction = true;
        break;
      case "send":
      case "move":
      case "pay":
      case "save": {
        const m = rest.match(/^([\d.]+)(%?)\s+to\s+account\s+(.*)$/);
        if (!m) return { ok: false, error: `Line ${i + 1}: expected "send 10% to account "Savings"".`, line: i + 1 };
        rule.action = "move_to_account";
        rule.amountValue = Number(m[1]);
        rule.amountKind = m[2] === "%" ? "percent" : "fixed";
        rule.accountName = strArg(m[3]!);
        sawAction = true;
        break;
      }
      default:
        return { ok: false, error: `Line ${i + 1}: unknown markup "@SML:${kw}".`, line: i + 1 };
    }
  }

  if (!sawIf) return { ok: false, error: "Missing an @SML:if condition." };
  if (!sawAction) return { ok: false, error: "Missing an action (category / note / send / notify / flag)." };
  if (!rule.name) rule.name = "Untitled automation";
  if (rule.action === "move_to_account" && !rule.accountName)
    return { ok: false, error: "Destination account is required for a send." };
  return { ok: true, rule };
}

/* --------------------------- highlighting -------------------------- */

export type SmlTokenKind = "marker" | "keyword" | "string" | "number" | "operator" | "text";
export interface SmlToken {
  kind: SmlTokenKind;
  text: string;
}

const OP_WORDS = new Set([...SML_OPERATORS, "to", "account", "for", "on", "set", "add", "asset"]);

/** Split one SML line into coloured tokens. */
export function tokenizeSmlLine(line: string): SmlToken[] {
  const tokens: SmlToken[] = [];
  const re = /(@SML:)([a-z]+)|("[^"]*")|(\b\d+(?:\.\d+)?%?)|(\s+)|([^\s]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1]) {
      tokens.push({ kind: "marker", text: m[1] });
      tokens.push({ kind: "keyword", text: m[2] ?? "" });
    } else if (m[3]) tokens.push({ kind: "string", text: m[3] });
    else if (m[4]) tokens.push({ kind: "number", text: m[4] });
    else if (m[5]) tokens.push({ kind: "text", text: m[5] });
    else if (m[6]) tokens.push({ kind: OP_WORDS.has(m[6]) ? "operator" : "text", text: m[6] });
  }
  return tokens;
}

/** Plain-English rendering of a rule — what non-technical users read. */
export function ruleToPlainEnglish(rule: SmlRule): string {
  const when =
    rule.trigger === "money_in"
      ? "When money comes in"
      : rule.trigger === "money_out"
        ? "When money goes out"
        : "On every transaction";
  const opWord: Record<SmlOperator, string> = {
    contains: "contains",
    equals: "is exactly",
    starts_with: "starts with",
    greater_than: "is more than",
    less_than: "is less than",
  };
  const cond = rule.value ? ` and the ${rule.field} ${opWord[rule.operator]} “${rule.value}”` : "";
  let then = "";
  switch (rule.action) {
    case "set_category":
      then = `label it “${rule.actionValue}”`;
      break;
    case "add_note":
      then = `add the note “${rule.actionValue}”`;
      break;
    case "flag":
      then = "flag it for review";
      break;
    case "notify":
      then = "send me a notification";
      break;
    case "move_to_account":
      then = `move ${rule.amountKind === "percent" ? `${rule.amountValue}%` : rule.amountValue} into “${rule.accountName}”`;
      break;
  }
  return `${when}${cond}, ${then}.`;
}
