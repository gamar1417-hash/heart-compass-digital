import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { groups, totalItems, type Item } from "@/data/content";
import { useDayLog } from "@/lib/store";

export const Route = createFileRoute("/maqamat")({
  head: () => ({
    meta: [
      { title: `فهرس المقامات والمسارات — ${totalItems} تذكيراً` },
      {
        name: "description",
        content: "فهرس منظّم في مجموعات قابل للبحث، مع تفاصيل كل تذكير وإمكانية تسجيله.",
      },
      { property: "og:title", content: "فهرس المقامات والمسارات" },
      { property: "og:description", content: "أكثر من ١٥٦ تذكيراً صغيراً منظّماً في مقامات." },
    ],
  }),
  component: Maqamat,
});

function Maqamat() {
  const { today, add } = useDayLog();
  const [q, setQ] = useState("");
  const [openGroup, setOpenGroup] = useState<string | null>(groups[0].id);
  const [detail, setDetail] = useState<Item | null>(null);

  const results = useMemo(() => {
    const term = q.trim();
    if (!term) return null;
    return groups
      .map((g) => ({ g, items: g.items.filter((i) => (i.title + i.hint).includes(term)) }))
      .filter((r) => r.items.length);
  }, [q]);

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="🧭"
        title="المقامات والمسارات"
        sub={`${totalItems} تذكيراً صغيراً منظّماً في ${groups.length} مقاماً — ابحث وافتح وسجّل.`}
      />

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث عن تذكير… مثل: الاستغفار، الجار، الرزق"
        className="min-h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
      />

      {results ? (
        <div className="space-y-2">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا نتائج، جرّب كلمة أخرى.</p>
          ) : null}
          {results.map(({ g, items }) => (
            <Card key={g.id} className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {g.emoji} {g.name}
              </p>
              {items.map((i) => (
                <Row key={i.id} item={i} count={today[i.id] ?? 0} onAdd={() => add(i.id)} onOpen={() => setDetail(i)} />
              ))}
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <Card key={g.id} className="space-y-2">
              <button
                onClick={() => setOpenGroup(openGroup === g.id ? null : g.id)}
                className="flex w-full items-center justify-between gap-2 text-right"
              >
                <span>
                  <span className="font-semibold">
                    <span className="ml-2 text-xl">{g.emoji}</span>
                    {g.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">{g.blurb}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{g.items.length}</span>
              </button>
              {openGroup === g.id ? (
                <div className="space-y-2 border-t border-border pt-2">
                  {g.items.map((i) => (
                    <Row
                      key={i.id}
                      item={i}
                      count={today[i.id] ?? 0}
                      onAdd={() => add(i.id)}
                      onOpen={() => setDetail(i)}
                    />
                  ))}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <Note>محتوى تحفيزي وتعليمي؛ وما عليه شارة «تعلّم أكثر» يحتاج مرجعاً موثوقاً أو سؤال مختص.</Note>

      {detail ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-3 sm:items-center">
          <div className="soft-card w-full max-w-md space-y-3 p-5">
            <h2 className="text-lg font-bold">{detail.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{detail.hint}</p>
            {detail.learn ? (
              <p className="rounded-2xl bg-secondary p-3 text-xs leading-relaxed">
                📚 تعلّم أكثر: هذا البند يحتاج تفصيلاً من مرجع موثوق أو أهل العلم، ولا نقدّم فيه
                فتوى.
              </p>
            ) : null}
            <div className="flex gap-2">
              <Btn
                className="flex-1"
                onClick={() => {
                  add(detail.id);
                  setDetail(null);
                }}
              >
                سجّلت اليوم
              </Btn>
              <Btn variant="ghost" onClick={() => setDetail(null)}>
                إغلاق
              </Btn>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({
  item,
  count,
  onAdd,
  onOpen,
}: {
  item: Item;
  count: number;
  onAdd: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-muted/50 px-3 py-2">
      <button onClick={onOpen} className="min-w-0 flex-1 text-right">
        <span className="block truncate text-sm font-medium">
          {item.title}
          {item.learn ? <span className="mr-1 text-[10px] text-accent-foreground">📚</span> : null}
        </span>
        <span className="block truncate text-[11px] text-muted-foreground">{item.hint}</span>
      </button>
      <button
        onClick={onAdd}
        className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold ${
          count ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        {count ? `✓ ${count}` : "سجّل"}
      </button>
    </div>
  );
}
