import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { tokenizeSmlLine, type SmlTokenKind } from "@/lib/sml";

const TOKEN_CLASS: Record<SmlTokenKind, string> = {
  marker: "text-muted-foreground",
  keyword: "font-semibold text-primary",
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-sky-600 dark:text-sky-400",
  operator: "text-secondary dark:text-sky-200/80",
  text: "text-foreground",
};

/** Read-only SML block with syntax highlighting. */
export function SmlCode({ code, className }: { code: string; className?: string }) {
  const lines = useMemo(() => code.split("\n"), [code]);
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-[4px] border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed",
        className,
      )}
    >
      <code>
        {lines.map((line, i) => (
          <div key={i}>
            {tokenizeSmlLine(line).map((t, j) => (
              <span key={j} className={TOKEN_CLASS[t.kind]}>
                {t.text}
              </span>
            ))}
            {line.length === 0 ? "\u00a0" : null}
          </div>
        ))}
      </code>
    </pre>
  );
}

/** Editable SML surface: a transparent textarea layered over highlighted text. */
export function SmlEditor({
  value,
  onChange,
  error,
  rows = 10,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <SmlCode code={value || " "} className="min-h-[9rem]" />
        <textarea
          value={value}
          rows={rows}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          aria-label="SML program"
          className="absolute inset-0 h-full w-full resize-none overflow-x-auto whitespace-pre rounded-[4px] border border-transparent bg-transparent p-3 font-mono text-xs leading-relaxed text-transparent caret-primary outline-none focus:border-primary/50"
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
