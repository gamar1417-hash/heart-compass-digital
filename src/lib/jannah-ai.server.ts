import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const SOURCES = `نصوص مسموح الاقتباس منها حرفياً فقط (لا تقتبس غيرها):
1. ﴿وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ﴾ آل عمران: ١٣٣
2. ﴿مَّثَلُ الْجَنَّةِ الَّتِي وُعِدَ الْمُتَّقُونَ فِيهَا أَنْهَارٌ مِّن مَّاءٍ غَيْرِ آسِنٍ وَأَنْهَارٌ مِّن لَّبَنٍ لَّمْ يَتَغَيَّرْ طَعْمُهُ﴾ محمد: ١٥
3. ﴿يُحَلَّوْنَ فِيهَا مِنْ أَسَاوِرَ مِن ذَهَبٍ وَلُؤْلُؤًا وَلِبَاسُهُمْ فِيهَا حَرِيرٌ﴾ الحج: ٢٣
4. ﴿فَلَا تَعْلَمُ نَفْسٌ مَّا أُخْفِيَ لَهُم مِّن قُرَّةِ أَعْيُنٍ جَزَاءً بِمَا كَانُوا يَعْمَلُونَ﴾ السجدة: ١٧
5. ﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾ المائدة: ٢
6. ﴿وَالَّذِينَ آمَنُوا وَاتَّبَعَتْهُمْ ذُرِّيَّتُهُم بِإِيمَانٍ أَلْحَقْنَا بِهِمْ ذُرِّيَّتَهُمْ﴾ الطور: ٢١
7. ﴿وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ﴾ الزلزلة: ٧
8. «أحبُّ الأعمال إلى الله أدومها وإن قلّ» متفق عليه
9. «إذا سألتم الله فاسألوه الفردوس، فإنه أوسط الجنة وأعلى الجنة» رواه البخاري
10. «قال الله: أعددتُ لعبادي الصالحين ما لا عينٌ رأت، ولا أذنٌ سمعت، ولا خطر على قلب بشر» متفق عليه`;

const INSTRUCTIONS = `أنت مرشد إيماني لطيف في تطبيق محاسبة ذاتية عائلي. اكتب بالعربية الفصحى البسيطة رسالة تحفيزية قصيرة (٤ إلى ٦ أسطر) لعائلة بناءً على مجموع أعمالها ومرحلتها الرمزية.
القواعد:
- اختر نصاً واحداً أو اثنين فقط من القائمة واقتبسه حرفياً مع مرجعه. لا تخترع آيات أو أحاديث.
- لا تحسب الأجر ولا تعِد بالقبول أو بدخول الجنة، فالمشهد رمزي والأجر عند الله وحده.
- حلّل التقدم بلطف (أقوى مسار، وما يحتاج عناية) وانصح بخطوة عملية للعائلة معاً.
- لا مقارنة بين الأفراد ولا لوم.
${SOURCES}`;

export async function analyzeFamilyJannah(input: {
  total: number;
  today: number;
  stage: string;
  nextAt: number | null;
  members: number;
  tracks: { name: string; total: number }[];
}) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("خدمة الذكاء غير مهيأة.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const prompt = `عدد أفراد العائلة: ${input.members}
مجموع الأعمال التراكمي: ${input.total} · اليوم: ${input.today}
المرحلة الرمزية الحالية: ${input.stage}${input.nextAt ? ` · المرحلة التالية عند ${input.nextAt}` : " · أوسع مرحلة"}
المسارات: ${input.tracks.map((t) => `${t.name}: ${t.total}`).join("، ")}`;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: INSTRUCTIONS,
    prompt,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return (await result.text).trim();
}
