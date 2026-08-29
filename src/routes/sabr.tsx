import { createFileRoute } from "@tanstack/react-router";
import { Btn, Card, Note, PageTitle, PrivateNote } from "@/components/bits";
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
    ],
  }),
  component: Sabr,
});

const cards = [
  { id: "marad", t: "المرض", d: "خذ بالعلاج، وارقِ نفسك، واسأل الله العافية.", icon: "🩺" },
  { id: "hamm", t: "الهمّ والضيق", d: "«إنما أشكو بثّي وحزني إلى الله» — الشكوى إليه لا منه.", icon: "🌧️" },
  { id: "musiba", t: "المصيبة", d: "اصبر عند الصدمة الأولى، والرجاء واسع.", icon: "🤍" },
  { id: "wahda", t: "الوحشة", d: "تواصل مع من تثق به، والعزلة تطيل الألم.", icon: "🫂" },
];

function Sabr() {
  const { today, add } = useDayLog();
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
          <Card key={c.id} className="space-y-1">
            <p className="font-semibold">
              <span className="ml-2">{c.icon}</span>
              {c.t}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">{c.d}</p>
            <Btn variant="ghost" onClick={() => add(`sabr-${c.id}`)}>
              دعوت ورجوت ({today[`sabr-${c.id}`] ?? 0})
            </Btn>
          </Card>
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
        لا نقرّر هنا أن مصيبة تُكفّر ذنباً بعينه؛ الأجر والتكفير بيد الله، ونحن نرجو رحمته.
      </Note>
    </div>
  );
}
