import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { useLocalState } from "@/lib/store";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "اقتراحاتكم وملاحظاتكم" },
      {
        name: "description",
        content: "صندوق اقتراحات وتعليقات محفوظ على جهازك حتى تفعيل الحسابات والمراجعة.",
      },
      { property: "og:title", content: "صندوق الاقتراحات" },
      { property: "og:description", content: "شاركنا اقتراحك بلطف — المحتوى المسيء يُراجع ويُخفى." },
    ],
  }),
  component: Feedback,
});

type Msg = { id: string; text: string; at: string };

function Feedback() {
  const [msgs, setMsgs] = useLocalState<Msg[]>("feedback", []);
  const [text, setText] = useState("");

  return (
    <div className="space-y-4">
      <PageTitle emoji="✉️" title="اقتراحاتكم" sub="رأيك يعيننا على تحسين المساحة." />

      <Card className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="اكتب اقتراحك أو ملاحظتك…"
          className="w-full rounded-2xl border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <Btn
          className="w-full"
          onClick={() => {
            if (!text.trim()) return;
            setMsgs((p) => [
              { id: String(Date.now()), text: text.trim(), at: new Date().toLocaleDateString("ar") },
              ...p,
            ]);
            setText("");
          }}
        >
          إرسال
        </Btn>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          حالياً تُحفظ الرسائل على جهازك فقط (نسخة تجريبية). عند تفعيل الحسابات ستصل إلينا،
          وسيُراجَع المحتوى المسيء ويُخفى يدوياً — ولا ندّعي حذفاً تلقائياً بلا نظام مراجعة حقيقي.
        </p>
      </Card>

      {msgs.length ? (
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-muted-foreground">رسائلي المحفوظة</h2>
          {msgs.map((m) => (
            <Card key={m.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{m.at}</p>
              </div>
              <button
                onClick={() => setMsgs((p) => p.filter((x) => x.id !== m.id))}
                className="text-xs text-destructive"
              >
                حذف
              </button>
            </Card>
          ))}
        </section>
      ) : null}

      <Note>نرجو أن تكون الملاحظات بلغة طيبة، فالكلمة الطيبة صدقة.</Note>
    </div>
  );
}
