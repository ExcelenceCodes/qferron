import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CURRENCIES, getCurrency } from "@/lib/currencies";
import { cn } from "@/lib/utils";

interface CurrencySelectProps {
  value?: string;
  onChange?: (code: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Searchable, keyboard-navigable currency picker.
 * Uses the full ISO currencies list from src/lib/data/currencies.json.
 */
export function CurrencySelect({
  value,
  onChange,
  placeholder = "Select currency…",
  className,
}: CurrencySelectProps) {
  const [open, setOpen] = React.useState(false);
  const current = value ? getCurrency(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {current ? (
            <span className="inline-flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{current.code}</span>
              <span className="truncate">{current.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground inline-flex items-center gap-2">
              <Search className="h-3.5 w-3.5" /> {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search currency…" />
          <CommandList>
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup>
              {CURRENCIES.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.code} ${c.name}`}
                  onSelect={() => {
                    onChange?.(c.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === c.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="font-mono text-xs text-muted-foreground w-12">{c.code}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.symbol_native}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
