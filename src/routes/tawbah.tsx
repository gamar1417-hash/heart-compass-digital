import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card, Note, PageTitle, PrivateNote } from "@/components/bits";
import { sensitive } from "@/data/content";
import { useLocalState } from "@/lib/store";

export const Route = createFileRoute("/tawbah")({
  head: () => ({
    meta: [
      { title: "التوبة والحقوق — ردّ الحقوق أولاً" },
      {
        name: "description",
        content: "بنود حقوق الآخرين برمز قفل أحمر: الظلم والغش والربا، مع باب توبة مفتوح بلا فتاوى.",
      },
      { property: "og:title", content: "التوبة والحقوق" },
      { property: "og:description", content: "حقوق الناس لا تسقط بالندم وحده، والباب مفتوح دائماً." },
    ],
  }),
  component: Tawbah,
});

const rights = [
  { id: "zulm", t: "الظلم", d: "أخذ حق أو كسر خاطر أو تعدٍّ بقول أو فعل." },
  { id: "ghish", t: "الغش", d: "في البيع أو العمل أو الدراسة أو النصيحة." },
  { id: "riba", t: "الربا", d: "المعاملات المالية تحتاج مراجعة متخصص." },
  { id: "ird", t: "الغيبة والعِرض", d: "ما قيل في ظهر أخيك يحتاج معالجة برفق." },
];

function Tawbah() {
  const [state, setState] = useLocalState<Record<string, string>>("rights", {});
  const [note, setNote] = useLocalState("tawbah-note", "");
  const [learn, setLearn] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <PageTitle emoji="🔒" title="التوبة والحقوق" sub="الرجوع ممكن دائماً، والحقوق تُردّ ما أمكن." />

      <Note tone="warn">
        <b>قفل حقوق الآخرين:</b> التوبة من حقوق الناس لا تكتمل بالندم وحده؛ الأصل ردّ الحق أو طلب
        المسامحة عند القدرة. وإن تعذّر، فأكثِر من الاستغفار والدعاء والإحسان، وباب رحمة الله مفتوح.
      </Note>

      <div className="grid gap-2">
        {rights.map((r) => (
          <Card key={r.id} className="border-destructive/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-destructive">🔒 {r.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.d}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["أنوي الرد", "طلبت المسامحة", "أحتاج مهلة"].map((s) => (
                <button
                  key={s}
                  onClick={() => setState((p) => ({ ...p, [r.id]: s }))}
                  className={`rounded-2xl px-3 py-2 text-xs font-semibold ${
                    state[r.id] === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-muted-foreground">أقسام حسّاسة — بلهجة متزنة</h2>
        {sensitive.map((s) => (
          <Card key={s.t} className="space-y-2">
            <p className="font-semibold">{s.t}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{s.d}</p>
            <Btn variant="ghost" onClick={() => setLearn(learn === s.t ? null : s.t)}>
              أحتاج للتعلّم
            </Btn>
            {learn === s.t ? (
              <div className="space-y-2 rounded-2xl bg-secondary p-3">
                <p className="text-xs font-semibold">مراجع توعوية موثوقة (تفتح في صفحة جديدة):</p>
                <ul className="space-y-1.5">
                  {s.refs.map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl bg-background px-3 py-2 text-xs font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        🔗 {ref.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  هذه روابط توعوية عامة للتعلّم، وليست فتوى ولا تشخيصاً لحالتك؛ ولحالتك الخاصة اسأل
                  عالماً موثوقاً.
                </p>
              </div>
            ) : null}
          </Card>
        ))}
      </section>

      <Card>
        <PrivateNote storageValue={note} onChange={setNote} />
        <p className="mt-2 text-[11px] text-muted-foreground">
          ما تكتبه هنا خاص على جهازك، ولا يُعرض لأحد 🔒
        </p>
      </Card>
    </div>
  );
}
