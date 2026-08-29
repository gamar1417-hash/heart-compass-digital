import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card, Counter, Note, PageTitle, PrivateNote, ShareReminder } from "@/components/bits";
import { useDayLog, useLocalState } from "@/lib/store";

export const Route = createFileRoute("/deeds")({
  head: () => ({
    meta: [
      { title: "أعمالي وأذكاري — تسجيل يومي بسيط" },
      {
        name: "description",
        content: "عدادات هادئة للذكر والأعمال، مع تحديات أسرية اختيارية بنبرة لطيفة.",
      },
      { property: "og:title", content: "أعمالي وأذكاري" },
      { property: "og:description", content: "سجّل ذكرك وأعمالك اليومية بخصوصية كاملة." },
    ],
  }),
  component: Deeds,
});

const counters = [
  { id: "subhan", label: "سبحان الله وبحمده", hint: "١٠٠ مرة" },
  { id: "istighfar", label: "أستغفر الله", hint: "متفرقة خلال اليوم" },
  { id: "salat-nabi", label: "الصلاة على النبي ﷺ", hint: "أكثِر يوم الجمعة" },
  { id: "hawqala", label: "لا حول ولا قوة إلا بالله", hint: "عند الهمّ والتعب" },
  { id: "tahlil", label: "لا إله إلا الله وحده لا شريك له", hint: "١٠ مرات صباحاً" },
  { id: "sadaqa", label: "معروف اليوم", hint: "لا تحقرنّ من المعروف شيئاً" },
];

type Challenge = { id: string; name: string; circle: string; target: number; done: number };

function Deeds() {
  const { today, add, total } = useDayLog();
  const [note, setNote] = useLocalState("deeds-note", "");
  const [challenges, setChallenges] = useLocalState<Challenge[]>("challenges", [
    { id: "c1", name: "١٠٠ استغفار", circle: "الأسرة", target: 100, done: 0 },
  ]);
  const [name, setName] = useState("");
  const [circle, setCircle] = useState("الأسرة");

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="📿"
        title="أعمالي وأذكاري"
        sub={`مجموع تسجيلات اليوم: ${total} — الأرقام للتحفيز فقط.`}
      />

      <Note>جودة النيّة لا يعرفها إلا الله؛ العدّاد يقيس المداومة لا القبول.</Note>

      <div className="grid gap-2">
        {counters.map((c) => (
          <Counter
            key={c.id}
            label={c.label}
            hint={c.hint}
            value={today[c.id] ?? 0}
            onAdd={(n) => add(c.id, n)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ShareReminder title="أذكار اليوم" />
        <span className="text-xs text-muted-foreground">لا شيء يُشارك تلقائياً 🔒</span>
      </div>

      <Card className="space-y-3">
        <h2 className="font-bold">🤍 تحديات ذكر اختيارية</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          خاصة مع الأسرة أو الأصدقاء، بنيّة التعاون على الخير لا المنافسة ولا المفاخرة. لا يُعرض هنا
          ترتيب ولا مقارنات.
        </p>
        {challenges.map((ch) => (
          <div key={ch.id} className="rounded-2xl border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{ch.name}</p>
              <span className="text-xs text-muted-foreground">{ch.circle}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (ch.done / ch.target) * 100)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {ch.done} / {ch.target}
              </span>
              <div className="flex gap-2">
                <Btn
                  variant="ghost"
                  onClick={() =>
                    setChallenges((p) =>
                      p.map((x) => (x.id === ch.id ? { ...x, done: x.done + 10 } : x)),
                    )
                  }
                >
                  +١٠
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => setChallenges((p) => p.filter((x) => x.id !== ch.id))}
                >
                  حذف
                </Btn>
              </div>
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم التحدي"
            className="min-h-11 flex-1 rounded-2xl border border-border bg-card px-3 text-sm"
          />
          <select
            value={circle}
            onChange={(e) => setCircle(e.target.value)}
            className="min-h-11 rounded-2xl border border-border bg-card px-3 text-sm"
          >
            <option>الأسرة</option>
            <option>الأصدقاء</option>
            <option>بيني وبين نفسي</option>
          </select>
          <Btn
            onClick={() => {
              if (!name.trim()) return;
              setChallenges((p) => [
                ...p,
                { id: String(Date.now()), name: name.trim(), circle, target: 100, done: 0 },
              ]);
              setName("");
            }}
          >
            إضافة
          </Btn>
        </div>
      </Card>

      <Card>
        <PrivateNote storageValue={note} onChange={setNote} />
      </Card>
    </div>
  );
}
