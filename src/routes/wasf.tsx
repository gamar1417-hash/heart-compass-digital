import { createFileRoute, Link } from "@tanstack/react-router";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { groups } from "@/data/content";
import { useDayLog } from "@/lib/store";
import { ParadiseScene } from "@/components/paradise";

type Wasf = {
  id: string;
  emoji: string;
  title: string;
  text: string;
  ref: string;
  meaning: string;
  itemIds: string[];
};

const wasafat: Wasf[] = [
  {
    id: "anhar",
    emoji: "🏞️",
    title: "أنهار الجنة",
    text: "﴿فِيهَا أَنْهَارٌ مِّن مَّاءٍ غَيْرِ آسِنٍ وَأَنْهَارٌ مِّن لَّبَنٍ لَّمْ يَتَغَيَّرْ طَعْمُهُ وَأَنْهَارٌ مِّنْ خَمْرٍ لَّذَّةٍ لِّلشَّارِبِينَ وَأَنْهَارٌ مِّنْ عَسَلٍ مُّصَفًّى﴾",
    ref: "محمد: ١٥",
    meaning:
      "أنهار أربعة: ماء عذب لا يتغيّر، ولبن ثابت الطيب، وخمر لذيذة لا سكر فيها، وعسل مصفّى. وفي الحديث: «البطيخ من ثمار الجنة».",
    itemIds: ["dhikr-3", "sabr-10"],
  },
  {
    id: "khulud",
    emoji: "🕊️",
    title: "الخلود والنعيم المقيم",
    text: "﴿وَمَا تَشْتَهِيهِ الْأَنفُسُ وَتَلَذُّ الْأَعْيُنُ ۖ وَأَنتُمْ فِيهَا خَالِدُونَ﴾",
    ref: "الزخرف: ٧١",
    meaning:
      "ما تشتهيه النفس وتقرّ به العين موجود، والبقاء فيه أبديّ بلا ملل ولا زوال. قال ﷺ: «ينادي منادٍ: إن لكم أن تصحّوا فلا تمرضوا أبداً، وإن لكم أن تحيوا فلا تموتوا أبداً» (رواه مسلم).",
    itemIds: ["tawhid-6", "nafs-12"],
  },
  {
    id: "libas",
    emoji: "🧵",
    title: "الحرير والأساور والحُلِيّ",
    text: "﴿يُحَلَّوْنَ فِيهَا مِنْ أَسَاوِرَ مِن ذَهَبٍ وَلُؤْلُؤًا ۖ وَلِبَاسُهُمْ فِيهَا حَرِيرٌ﴾",
    ref: "الحج: ٢٣",
    meaning:
      "أساور من ذهب ولؤلؤ، ولباسهم حرير — جزاء ما صبروا في الدنيا عن زخرفها الحرام.",
    itemIds: ["nafs-4", "khuluq-5"],
  },
  {
    id: "qasr",
    emoji: "🏰",
    title: "القصور والغرفات",
    text: "﴿وَقُصُورٍ مَّبْنِيَّةٍ﴾",
    ref: "الفرقان: ١٠",
    meaning:
      "قصور مبنية؛ قال ﷺ: «في الجنة غرفة يُرى ظاهرها من باطنها وباطنها من ظاهرها»، لأهل الإطعام وإفشاء السلام وقيام الليل (رواه الترمذي).",
    itemIds: ["jiwar-2", "awqat-1", "khuluq-11"],
  },
  {
    id: "ashjar",
    emoji: "🌴",
    title: "الأشجار والظلال والثمار",
    text: "﴿وَفَوَاكِهَ مِمَّا يَتَخَيَّرُونَ﴾",
    ref: "الواقعة: ٢٠",
    meaning:
      "أشجار ممدودة الظلال، وثمار دائمة مقطوفة تيسّراً. وقال ﷺ: «من قال سبحان الله وبحمده غُرست له بها نخلة في الجنة» (رواه الترمذي).",
    itemIds: ["dhikr-1", "quran-9"],
  },
  {
    id: "sukun",
    emoji: "💚",
    title: "لا همّ ولا خوف ولا حزن",
    text: "﴿لَا يَمَسُّهُمْ فِيهَا نَصَبٌ وَمَا هُم مِّنْهَا بِمُخْرَجِينَ﴾",
    ref: "الحجر: ٤٨",
    meaning:
      "لا تعب ولا نصب ولا همّ يمسّهم، وأُزيلت الغِلّة من الصدور: ﴿وَنَزَعْنَا مَا فِي صُدُورِهِم مِّنْ غِلٍّ إِخْوَانًا﴾ [الحجر: ٤٧].",
    itemIds: ["khuluq-7", "nafs-6", "sabr-9"],
  },
  {
    id: "ruya",
    emoji: "✨",
    title: "أعظم النعيم: رؤية الله",
    text: "﴿لِّلَّذِينَ أَحْسَنُوا الْحُسْنَىٰ وَزِيَادَةٌ﴾",
    ref: "يونس: ٢٦",
    meaning:
      "الحسنى الجنة، والزيادة النظر إلى وجه الله الكريم — أجلّ نعيم أهل الجنة. وقال ﷺ: «إنكم سترون ربكم كما ترون القمر ليلة البدر» (متفق عليه).",
    itemIds: ["tawhid-1", "ilm-6"],
  },
  {
    id: "abwab",
    emoji: "🚪",
    title: "أبواب الجنة الثمانية",
    text: "«من أنفق زوجين في سبيل الله نُودي في الجنة: يا عبد الله إن هذا خير»",
    ref: "متفق عليه",
    meaning:
      "للجنة ثمانية أبواب، وباب الريّان للصائمين خاصة (متفق عليه). وقال ﷺ: «من صلى البردين دخل الجنة» (متفق عليه).",
    itemIds: ["salah-1", "awqat-8", "jiwar-6"],
  },
];

export const Route = createFileRoute("/wasf")({
  head: () => ({
    meta: [
      { title: "وصفات الجنة — من الكتاب والسنة" },
      {
        name: "description",
        content: "أوصاف الجنة من القرآن والسنة بالتفصيل، مربوطة بتذكيرات عملية من فهرس المقامات.",
      },
      { property: "og:title", content: "وصفات الجنة — من الكتاب والسنة" },
      { property: "og:description", content: "الأنهار والقصور والحرير والخلود، وما يرتبط بها من أعمال." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WasfPage,
});

function WasfPage() {
  const { today, add } = useDayLog();
  const itemById = new Map(groups.flatMap((g) => g.items).map((i) => [i.id, i]));

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="🌟"
        title="وصفات الجنة"
        sub="أوصاف من الكتاب والسنة، وكل وصف مربوط بتذكيرات عملية من فهرس المقامات."
      />

      <section className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-2xl">
        <ParadiseScene lifetime={90} className="min-h-[56vh]" />
        <div className="absolute inset-x-0 bottom-0 z-40 bg-foreground/70 px-5 py-5 text-background backdrop-blur-sm">
          <h2 className="text-2xl font-bold">الجنة كما ورد وصفها في الكتاب والسنة</h2>
          <p className="mt-2 text-sm leading-relaxed">تعرّف إلى أوصافها، ثم ادخل إلى صحبة إيمانية تتواصى بالخير ومكارم الأخلاق.</p>
          <Link to="/community" className="mt-4 inline-flex min-h-11 items-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground">دخول المجتمع الإيماني</Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {[
          ["جنات تجري من تحتها الأنهار", "خضرة وارفة، وظلال ممدودة، ورمان ونخيل، ونهر صافٍ."],
          ["أنهار من ماء ولبن وعسل", "سرر مرفوعة من حرير أخضر، وفواكه دانية القطوف."],
          ["أساور من ذهب ولؤلؤ وحرير", "آنية ذهبية، ولآلئ على سندس وإستبرق، أمام قصور بيضاء."],
          ["قصور وكنوز الفردوس", "مدينة ذهبية، بأنهار وشلالات وبلّور يتلألأ."],
        ].map(([title, text], index) => (
          <Card key={title} className="space-y-2">
            <p className="text-xs font-bold text-primary">المشهد {index + 1}</p>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
          </Card>
        ))}
      </section>

      <Note>
        هذه الأوصاف للترغيب والتحفيز، والتذكيرات المرتبطة ليست شرطاً ولا ضماناً — الجنة فضلٌ من
        الله ورحمة.
      </Note>

      {wasafat.map((w) => (
        <Card key={w.id} className="space-y-3">
          <h2 className="font-bold">
            <span className="ml-2 text-xl">{w.emoji}</span>
            {w.title}
          </h2>
          <p className="font-display text-base leading-loose text-foreground">{w.text}</p>
          <p className="text-xs font-semibold text-primary">{w.ref}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{w.meaning}</p>

          <div className="space-y-2 border-t border-border pt-2">
            <p className="text-[11px] font-semibold text-muted-foreground">
              تذكيرات مرتبطة من فهرس المقامات:
            </p>
            {w.itemIds.map((id) => {
              const item = itemById.get(id);
              if (!item) return null;
              const count = today[id] ?? 0;
              return (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 rounded-2xl bg-muted/50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.title}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {item.hint}
                    </span>
                  </div>
                  <Btn
                    variant={count ? "accent" : "primary"}
                    className="shrink-0 px-3 py-2 text-xs"
                    onClick={() => add(id)}
                  >
                    {count ? `✓ ${count}` : "سجّل"}
                  </Btn>
                </div>
              );
            })}
            <Link to="/maqamat" className="block text-[11px] font-semibold text-primary">
              فتح فهرس المقامات كاملاً ←
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
