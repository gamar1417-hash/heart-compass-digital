import { createFileRoute } from "@tanstack/react-router";
import { Btn, Card, Counter, Note, PageTitle, PrivateNote } from "@/components/bits";
import { useDayLog, useLocalState } from "@/lib/store";

export const Route = createFileRoute("/sabr")({
  head: () => ({
    meta: [
      { title: "الصبر والعافية — دعم روحي ورجاء" },
      {
        name: "description",
        content: "بطاقات للمرض والهمّ والمصيبة، آية الاسترجاع، وتدوين خاص ومؤشرات دعم.",
      },
      { property: "og:title", content: "الصبر والعافية" },
      { property: "og:description", content: "مساحة رجاء ودعم عند المرض والهمّ والابتلاء." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Sabr,
});

const cards = [
  { id: "marad", t: "أيام المرض", d: "ما يصيب المؤمن من وصب ولا نصب ولا سقم إلا كان سبباً للتكفير بإذن الله — متفق عليه.", icon: "🩺" },
  { id: "hamm", t: "مرّات الهمّ", d: "حتى الهمّ داخل في حديث التكفير، مع الدعاء والأخذ بأسباب العافية.", icon: "🌧️" },
  { id: "huzn", t: "مرّات الحزن", d: "﴿إنما أشكو بثّي وحزني إلى الله﴾ — الشكوى إليه لا منه.", icon: "🤍" },
  { id: "alam", t: "مرّات الأوجاع", d: "حتى الشوكة يشاكها المؤمن يُرجى أن يكفّر الله بها من خطاياه — متفق عليه.", icon: "🫶" },
];

function Sabr() {
  const { today, add, lifetimeById } = useDayLog();
  const [note, setNote] = useLocalState("sabr-note", "");
  const [mood, setMood] = useLocalState("sabr-mood", 3);

  return (
    <div className="space-y-4">
      <PageTitle emoji="🤍" title="الصبر والعافية" sub="دعم روحي ورجاء، بلا وعود قطعية." />

      <Card className="text-center">
        <p className="font-display text-xl leading-loose">
          ﴿إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ﴾
        </p>
        <Btn className="mt-2" onClick={() => add("istirja")}>
          استرجعت ({today["istirja"] ?? 0})
        </Btn>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        {cards.map((c) => (
          <Counter key={c.id} label={`${c.icon} ${c.t}`} hint={c.d}
            value={today[`sabr-${c.id}`] ?? 0} lifetime={lifetimeById[`sabr-${c.id}`] ?? 0}
            onAdd={(n) => add(`sabr-${c.id}`, n)} />
        ))}
      </div>

      <Card className="space-y-2">
        <p className="text-sm font-semibold">مؤشر حالتي اليوم (خاص)</p>
        <input
          type="range"
          min={1}
          max={5}
          value={mood}
          onChange={(e) => setMood(Number(e.target.value))}
          className="w-full accent-[var(--primary)]"
          aria-label="مؤشر الحالة"
        />
        <p className="text-xs text-muted-foreground">
          {["ثقيل جداً", "ثقيل", "متوسط", "أهدأ", "طيّب والحمد لله"][mood - 1]}
        </p>
        {mood <= 2 ? (
          <Note tone="warn">
            إن استمر الثقل، فطلب مساندة مختص نفسي أو طبي جزءٌ من الأخذ بالأسباب، ولا يتعارض مع
            التوكل.
          </Note>
        ) : null}
      </Card>

      <Card>
        <PrivateNote storageValue={note} onChange={setNote} />
      </Card>

      <Note>
        هذه العدادات للتذكير بالصبر والرجاء وليست لعدّ المصائب أو تقدير التكفير؛ لا نقرّر أن ألماً
        بعينه كفّر ذنباً بعينه، فذلك بيد الله. وطلب العلاج والمساندة من الأخذ بالأسباب.
      </Note>
    </div>
  );
}
