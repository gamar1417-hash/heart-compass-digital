import { type ReactNode, useState } from "react";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`soft-card p-4 ${onClick ? "cursor-pointer transition-transform active:scale-[0.99]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({ title, sub, emoji }: { title: string; sub?: string; emoji?: string }) {
  return (
    <header className="mb-4">
      <h1 className="text-2xl font-bold text-foreground">
        {emoji ? <span className="ml-2">{emoji}</span> : null}
        {title}
      </h1>
      {sub ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{sub}</p> : null}
    </header>
  );
}

export function Note({ children, tone = "calm" }: { children: ReactNode; tone?: "calm" | "warn" }) {
  const cls =
    tone === "warn"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : "border-primary/20 bg-primary/5 text-primary";
  return (
    <p className={`rounded-2xl border px-4 py-3 text-[13px] leading-relaxed ${cls}`}>{children}</p>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "accent" | "danger";
  className?: string;
  type?: "button" | "submit";
}) {
  const map = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    accent: "bg-accent text-accent-foreground hover:opacity-90",
    ghost: "bg-secondary text-secondary-foreground hover:bg-muted",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  } as const;
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${map[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Counter({
  label,
  value,
  onAdd,
  hint,
}: {
  label: string;
  value: number;
  onAdd: (n: number) => void;
  hint?: string;
}) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-semibold">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          aria-label={`إنقاص ${label}`}
          onClick={() => onAdd(-1)}
          className="size-9 rounded-full bg-secondary text-lg text-secondary-foreground"
        >
          −
        </button>
        <span className="w-9 text-center text-lg font-bold tabular-nums">{value}</span>
        <button
          aria-label={`زيادة ${label}`}
          onClick={() => onAdd(1)}
          className="size-11 rounded-full bg-primary text-xl text-primary-foreground"
        >
          +
        </button>
      </div>
    </Card>
  );
}

/** «تذكير محب» قبل المشاركة — الخصوصية هي الافتراض. */
export function ShareReminder({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  return (
    <>
      <Btn variant="ghost" onClick={() => setOpen(true)}>
        مشاركة الإنجاز
      </Btn>
      {done ? <span className="text-xs text-muted-foreground">{done}</span> : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-3 sm:items-center">
          <div className="soft-card w-full max-w-md p-5">
            <h3 className="text-lg font-bold">تذكير محبّ 🌿</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              قبل أن تشارك «{title}»: النيّة أمرٌ لا يعلمه إلا الله، ونحن لا نحكم على أحد. إن كانت
              المشاركة تُعينك أو تُعين غيرك على خير فلا بأس، وإن خشيت على قلبك فالإخفاء أسلم.
            </p>
            <div className="mt-4 grid gap-2">
              <Btn
                onClick={() => {
                  setDone("شاركتَه بنيّة الخير — والله أعلم بالسرائر.");
                  setOpen(false);
                }}
              >
                خالصاً لوجه الله 🌿 وأشارك
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => {
                  setDone("احتُفظ به خاصاً 🔒");
                  setOpen(false);
                }}
              >
                أحتفظ به خاصاً 🔒
              </Btn>
              <button onClick={() => setOpen(false)} className="py-2 text-xs text-muted-foreground">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function PrivateNote({ storageValue, onChange }: { storageValue: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">ملاحظة خاصة (تبقى على جهازك)</span>
      <textarea
        value={storageValue}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-2xl border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        placeholder="اكتب ما بينك وبين الله…"
      />
    </label>
  );
}
