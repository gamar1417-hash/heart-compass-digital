import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  total: z.number().int().min(0).max(10_000_000),
  today: z.number().int().min(0).max(10_000_000),
  stage: z.string().max(100),
  nextAt: z.number().int().nullable(),
  members: z.number().int().min(1).max(100),
  tracks: z.array(z.object({ name: z.string().max(50), total: z.number().int().min(0) })).max(5),
});

export const familyJannahInsight = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const { analyzeFamilyJannah } = await import("./jannah-ai.server");
    try {
      return { text: await analyzeFamilyJannah(data), error: null as string | null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const status = (e as { statusCode?: number })?.statusCode;
      if (status === 429) return { text: "", error: "الطلبات كثيرة الآن، حاول بعد قليل." };
      if (status === 402) return { text: "", error: "نفد رصيد الذكاء الاصطناعي لهذا الشهر." };
      return { text: "", error: msg || "تعذّر توليد الرسالة." };
    }
  });
