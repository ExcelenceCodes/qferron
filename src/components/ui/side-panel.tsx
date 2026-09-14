import * as React from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidePanelProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** "half" = 50% on lg, 100% on mobile. "full" = full screen. */
  size?: "half" | "full";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Standard right-side slide-in panel. Half-width on desktop, full on mobile.
 * Includes an explicit X button per product spec.
 */
export function SidePanel({
  open,
  onOpenChange,
  title,
  description,
  size = "half",
  children,
  footer,
}: SidePanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "flex flex-col p-0 gap-0 [&>button]:hidden",
          size === "half"
            ? "w-full sm:max-w-full lg:w-1/2 lg:max-w-[720px]"
            : "w-full sm:max-w-full h-full",
        )}
      >
        <SheetHeader className="flex flex-row items-start justify-between gap-4 border-b border-border p-5 space-y-0">
          <div className="min-w-0">
            <SheetTitle className="truncate text-left">{title}</SheetTitle>
            {description && (
              <SheetDescription className="mt-0.5 text-left">{description}</SheetDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="border-t border-border p-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
