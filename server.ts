import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Clean API endpoint for health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Secure server-side Gemini generation route
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const userApiKey = req.headers["x-gemini-key"] || req.body.apiKey;
      const apiKeyToUse = (typeof userApiKey === "string" && userApiKey.trim())
        ? userApiKey.trim()
        : process.env.GEMINI_API_KEY;

      if (!apiKeyToUse) {
        return res.status(400).json({
          error: "مفتاح API الخاص بـ Gemini غير متوفر. يرجى توفيره في شاشة البدء أو إعداده كرمز أمان في الإعدادات."
        });
      }

      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "الرجاء إدخال الوصف المعماري أولاً." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKeyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `أنت 'المهندس المعماري الأخروي'. مهمتك تحليل طلب المستخدم لملكه في الجنة وتحويله إلى خطة عمل مبنية حصرياً على الكتالوج النبوي التالي:
1. بناء بيت = صلاة 12 ركعة سُنة (صحيح مسلم).
2. بناء قصر = قراءة سورة الإخلاص 10 مرات (مسند أحمد).
3. بيت في ربض الجنة = ترك المراء وإن كنت محقاً (سنن أبي داود).
4. بيت في وسط الجنة = ترك الكذب وإن كنت مازحاً.
5. بيت في أعلى الجنة = حُسن الخُلق.
6. بيت مماثل = المشاركة في بناء مسجد ولو كمفحص قطاة (ابن ماجه).
7. بيت ورفع درجة = سد فرجة في الصلاة (السلسلة الصحيحة).
8. غرس نخلة = قول (سبحان الله العظيم وبحمده) (سنن الترمذي).
9. غرس شجرة = قول (سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر).
10. كنز من كنوز الجنة = قول (لا حول ولا قوة إلا بالله) (صحيح البخاري).
11. نُزُل (ضيافة) = الذهاب للمسجد ذهاباً وإياباً.
12. شفاعة الجنة = سؤال الله الجنة 3 مرات.
13. ضمان الدخول = قراءة آية الكرسي دبر كل صلاة.
14. ضمان الجنة يقيناً = قول سيد الاستغفار صباحاً ومساءً.
15. باب الصدقة = الإنفاق لوجه الله.

تنبيه هام ومشدد بشأن التكرار والعداد الصالح:
يجب أن تكون قيمة "count_required" هي إجمالي عدد التكرارات أو الطاعات الفعلية المطلوبة لهذه المعالم كقيمة عددية صحيحة (وليس 1 افتراضياً).
مثال: إذا تضمن طلب المستخدم غرس 500 نخلة، تكون مهمته هي قول الذكر 500 مرة، وبالتالي يجب أن يكون "count_required" يساوي 500 تماماً. إذا أراد بناء قصرين، تكون مهمته قراءة سورة الإخلاص 20 مرة، وبالتالي يجب أن يكون "count_required" يساوي 20 تماماً.

يجب أن ترد بصيغة JSON نقية بهذا الهيكل:
{
  "plan_card": "وصف الخطة...",
  "daily_checklist": [
    {
      "task": "قراءة سورة الإخلاص",
      "target_building": "بناء قصر",
      "count_required": 10,
      "current_count": 0,
      "done": false
    },
    {
      "task": "قول سبحان الله العظيم وبحمده",
      "target_building": "غرس 30 نخلة",
      "count_required": 30,
      "current_count": 0,
      "done": false
    }
  ],
  "visual_elements": [
    {"type": "palace", "name": "قصر الإخلاص", "hadith": "من قرأ قل هو الله أحد عشر مرات...", "action": "قراءة السورة 10 مرات", "size_calc": "مساحة شاسعة"}
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "{}";

      let parsedData;
      try {
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.substring(7);
        }
        if (cleanedText.endsWith("```")) {
          cleanedText = cleanedText.substring(0, cleanedText.length - 3);
        }
        parsedData = JSON.parse(cleanedText.trim());
      } catch (e) {
        console.error("Failed to parse Gemini JSON:", responseText, e);
        parsedData = {
          plan_card: "استجابة مباركة، يرجى ملء جدول الأعمال الصالحة لبناء معالم ملكك الأخروي المقدر.",
          daily_checklist: [
            { "task": "قراءة سورة الإخلاص", "target_building": "بناء قصر", "count_required": 10, "current_count": 0, "done": false },
            { "task": "قول سبحان الله العظيم وبحمده", "target_building": "غرس 30 نخلة", "count_required": 30, "current_count": 0, "done": false }
          ],
          visual_elements: [
            { "type": "palace", "name": "قصر الإخلاص", "hadith": "من قرأ قل هو الله أحد عشر مرات بنى الله له قصراً في الجنة", "action": "قراءة سورة الإخلاص 10 مرات", "size_calc": "مساحة هائلة لا يصفها بشر" },
            { "type": "tree", "name": "نخلة الفردوس", "hadith": "من قال سبحان الله العظيم وبحمده غرست له نخلة في الجنة", "action": "قول سبحان الله العظيم وبحمده", "size_calc": "يسير الراكب في ظلها مائة عام لا يقطعها" }
          ]
        };
      }

      res.json(parsedData);
    } catch (error: any) {
      console.error("Gemini route error:", error);
      res.status(500).json({ error: error.message || "فشلت عملية توليد المخطط من الذكاء الاصطناعي." });
    }
  });

  // Handle Vite Asset Serving & Development Routing Client-Side
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
