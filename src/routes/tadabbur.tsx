import { createFileRoute } from "@tanstack/react-router";
import { Btn, Card, Note, PageTitle, PrivateNote } from "@/components/bits";
import { ayat } from "@/data/content";
import { useLocalState } from "@/lib/store";

export const Route = createFileRoute("/tadabbur")({
  head: () => ({
    meta: [
      { title: "وليَدَّبّروا — آية اليوم وتفسير مبسّط" },
      {
        name: "description",
        content: "آية يومية مع تفسير مبسّط ومثال قريب، وحفظ الآيات في مفضلتك الخاصة.",
      },
      { property: "og:title", content: "وليَدَّبّروا" },
      { property: "og:description", content: "آية اليوم، تفسير مبسّط، ومثال من حياتك." },
    ],
  }),
  component: Tadabbur,
});

function Tadabbur() {
  const [fav, setFav] = useLocalState<string[]>("fav-ayat", []);
  const [note, setNote] = useLocalState("tadabbur-note", "");
  const todayAya = ayat[new Date().getDate() % ayat.length]!;

  return (
    <div className="space-y-4">
      <PageTitle emoji="📖" title="وليَدَّبّروا" sub="آية اليوم، ثم وقفة قصيرة مع القلب." />

      <Card className="space-y-2">
        <p className="font-display text-2xl leading-loose">﴿{todayAya.text}﴾</p>
        <p className="text-xs text-muted-foreground">{todayAya.ref}</p>
        <p className="text-sm leading-relaxed">
          <b>معنى مبسّط: </b>
          {todayAya.tafsir}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <b>مثال قريب: </b>
          {todayAya.example}
        </p>
        <div className="flex gap-2 pt-1">
          <Btn
            onClick={() =>
              setFav((p) => (p.includes(todayAya.ref) ? p : [...p, todayAya.ref]))
            }
          >
            🤍 احفظها في المفضلة
          </Btn>
        </div>
        <p className="text-[11px] text-muted-foreground">
          التفاعل هنا حفظٌ للآية في مفضلتك، لا درجات دينية ولا تقييم لتدبّرك.
        </p>
      </Card>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-muted-foreground">آيات أخرى</h2>
        {ayat.map((a) => (
          <Card key={a.ref} className="space-y-1">
            <p className="font-display text-lg leading-loose">﴿{a.text}﴾</p>
            <p className="text-xs text-muted-foreground">
              {a.ref} — {a.tafsir}
            </p>
            <button
              onClick={() => setFav((p) => (p.includes(a.ref) ? p.filter((x) => x !== a.ref) : [...p, a.ref]))}
              className="text-sm font-semibold text-primary"
            >
              {fav.includes(a.ref) ? "💚 محفوظة" : "🤍 حفظ"}
            </button>
          </Card>
        ))}
      </section>

      <Card>
        <PrivateNote storageValue={note} onChange={setNote} />
      </Card>

      <Note>للتوسّع في التفسير ارجع لمصدر موثوق مثل التفسير الميسّر أو أهل العلم.</Note>
    </div>
  );
}
