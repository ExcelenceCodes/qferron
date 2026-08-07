import { createFileRoute } from "@tanstack/react-router";
import { Coins, Plus, Sparkles, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, SectionCard, StatCard } from "@/components/app/app-shell";
import { EmptyState, ListSkeleton } from "@/components/app/empty-state";
import { USER_NAV } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SidePanel } from "@/components/ui/side-panel";
import { LoadingButton } from "@/components/ui/loading-button";
import { MoneySourceSelect } from "@/components/app/account-picker";
import { useBaseCurrency } from "@/lib/base-currency";
import {
  useAssets,
  useCreateAsset,
  useDeleteAsset,
  useUpdateAsset,
  type AssetKind,
  type AssetRow,
} from "@/lib/queries/finance";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/dashboard/assets")({
  head: () => ({ meta: [{ title: "Assets — Ferron" }, { name: "robots", content: "noindex" }] }),
  component: AssetsPage,
});

const KINDS: { value: AssetKind; label: string; appreciating: boolean }[] = [
  { value: "property", label: "Property", appreciating: true },
  { value: "vehicle", label: "Vehicle", appreciating: false },
  { value: "equity", label: "Equity / funds", appreciating: true },
  { value: "crypto", label: "Crypto", appreciating: true },
  { value: "other", label: "Other", appreciating: false },
];

function AssetsPage() {
  const { data: assets, isLoading } = useAssets();
  const { currency } = useBaseCurrency();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = assets ?? [];
  const selected = rows.find((a) => a.id === selectedId) ?? null;
  const total = rows.reduce((s, a) => s + Number(a.value), 0);
  const appreciating = rows.filter((a) =>
    KINDS.find((k) => k.value === a.kind)?.appreciating,
  ).length;

  return (
    <AppShell
      nav={USER_NAV}
      title="Assets"
      subtitle="Everything you own, including a Smart Buy check."
      headerRight={
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Register asset
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total asset value"
          value={formatMoney(total, currency)}
          hint={`${rows.length} asset${rows.length === 1 ? "" : "s"}`}
          icon={Coins}
        />
        <StatCard label="Appreciating" value={String(appreciating)} tone="positive" icon={TrendingUp} />
        <StatCard
          label="Depreciating"
          value={String(rows.length - appreciating)}
          tone="negative"
          icon={TrendingDown}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Your assets">
            {isLoading ? (
              <ListSkeleton />
            ) : rows.length === 0 ? (
              <EmptyState
                icon={Coins}
                title="No assets registered"
                description="Register property, vehicles, equity or crypto to see your full net worth."
                action={
                  <Button size="sm" onClick={() => setAddOpen(true)}>
                    <Plus className="mr-1.5 h-4 w-4" /> Register asset
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className="flex w-full items-center justify-between py-3 text-left transition-colors hover:bg-accent/40"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{a.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <Badge variant="outline" className="mr-1.5">
                            {a.kind}
                          </Badge>
                          {a.acquired_at ? `Acquired ${formatDate(a.acquired_at)}` : "Acquisition date not set"}
                        </p>
                      </div>
                      <p className="font-mono tabular-nums text-foreground">
                        {formatMoney(Number(a.value), a.currency)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
        <SectionCard title="Smart Buy">
          <p className="text-sm text-muted-foreground">
            Thinking of a purchase? Ferron scores affordability against your accounts, upcoming bills and
            savings goals.
          </p>
          <Button className="mt-4" size="sm">
            <Sparkles className="mr-1.5 h-4 w-4" /> Run a Smart Buy check
          </Button>
        </SectionCard>
      </div>

      <AssetPanel asset={selected} onClose={() => setSelectedId(null)} />
      <AssetDialog open={addOpen} onOpenChange={setAddOpen} />
    </AppShell>
  );
}

function AssetPanel({ asset, onClose }: { asset: AssetRow | null; onClose: () => void }) {
  const del = useDeleteAsset();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!asset) return null;

  async function handleDelete() {
    try {
      await del.mutateAsync(asset!.id);
      toast.success("Asset removed");
      setConfirmOpen(false);
      onClose();
    } catch (e) {
      toast.error("Could not delete", { description: (e as Error).message });
    }
  }

  return (
    <>
      <SidePanel
        open={!!asset}
        onOpenChange={(v) => !v && onClose()}
        title={asset.name}
        description={`${asset.kind.toUpperCase()} · ${asset.currency}`}
        footer={
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard label="Current value" value={formatMoney(Number(asset.value), asset.currency)} />
          <StatCard label="Acquired" value={asset.acquired_at ? formatDate(asset.acquired_at) : "—"} />
        </div>
        {asset.note && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Note</p>
            <p className="mt-1">{asset.note}</p>
          </div>
        )}
      </SidePanel>

      <AssetDialog open={editOpen} onOpenChange={setEditOpen} asset={asset} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove “{asset.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This asset will no longer count towards your net worth.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={del.isPending}
            >
              {del.isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AssetDialog({
  open,
  onOpenChange,
  asset,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  asset?: AssetRow;
}) {
  const { currency } = useBaseCurrency();
  const create = useCreateAsset();
  const update = useUpdateAsset();
  const editing = !!asset;

  const [name, setName] = useState(asset?.name ?? "");
  const [kind, setKind] = useState<AssetKind>(asset?.kind ?? "other");
  const [value, setValue] = useState(asset ? String(asset.value) : "");
  const [acquiredAt, setAcquiredAt] = useState(asset?.acquired_at ?? "");
  const [note, setNote] = useState(asset?.note ?? "");
  const [fundingId, setFundingId] = useState(asset?.funding_account_id ?? "");
  const pending = create.isPending || update.isPending;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name,
      kind,
      value: Number(value) || 0,
      currency: asset?.currency ?? currency,
      acquired_at: acquiredAt || null,
      note: note || null,
    };
    try {
      if (!editing && !fundingId) {
        toast.error("Choose the account this asset is paid from");
        return;
      }
      if (editing) {
        await update.mutateAsync({ id: asset!.id, ...payload });
        toast.success("Asset updated");
      } else {
        await create.mutateAsync({ ...payload, funding_account_id: fundingId });
        toast.success("Asset registered");
        setName("");
        setValue("");
        setNote("");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("Something went wrong", { description: (err as Error).message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit asset" : "Register asset"}</DialogTitle>
          <DialogDescription>Assets count towards your total net worth.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="asset-name">Name</Label>
            <Input
              id="asset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apartment in Dar es Salaam"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label>Kind</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as AssetKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="asset-value">Value ({asset?.currency ?? currency})</Label>
              <Input
                id="asset-value"
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="asset-date">Acquired</Label>
              <Input
                id="asset-date"
                type="date"
                value={acquiredAt}
                onChange={(e) => setAcquiredAt(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="asset-note">Note (optional)</Label>
            <Textarea
              id="asset-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          {!editing && (
            <MoneySourceSelect
              id="asset-funding"
              direction="out"
              amount={Number(value) || 0}
              value={fundingId}
              onChange={setFundingId}
              label="Paid from"
              hint="Money rotation: the purchase leaves this account as a transaction."
            />
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={pending} loadingText="Saving…">
              {editing ? "Save changes" : "Register asset"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
