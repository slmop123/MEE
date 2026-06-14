import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Key, 
  Hammer, 
  Tv, 
  Calculator, 
  Check, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Info, 
  Maximize2, 
  RotateCcw, 
  Compass, 
  Star, 
  User, 
  Bell, 
  ArrowLeftRight,
  Castle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
interface DailyChecklist {
  task: string;
  target: string;
  target_building?: string;
  count_required?: number;
  current_count?: number;
  done: boolean;
  category?: number;
  unit_name?: string;
  multiplier?: number;
}

interface VisualElement {
  type: string; // "palace" | "tree" | "tent" | "river" | "home" | "jewel"
  name: string;
  hadith: string;
  action: string;
  size_calc: string;
}

interface BlueprintData {
  plan_card: string;
  daily_checklist: DailyChecklist[];
  visual_elements: VisualElement[];
}

const getTaskCategory = (taskText: string, targetText: string): number => {
  const combined = `${taskText} ${targetText}`.toLowerCase();
  
  if (combined.includes("نخل") || combined.includes("شجر") || combined.includes("بستان") || combined.includes("زراع") || combined.includes("غرس") || combined.includes("palm") || combined.includes("tree")) {
    return 2;
  }
  
  if (combined.includes("كنز") || combined.includes("لا حول") || combined.includes("نُزُل") || combined.includes("ضيافة") || combined.includes("مسجد") || combined.includes("رحاب") || combined.includes("الذهاب") || combined.includes("إياب") || combined.includes("سفر") || combined.includes("نزيل")) {
    // If it contains building related like building mosque, goes to Category 1
    if (combined.includes("بناء") && combined.includes("مسجد")) {
      return 1;
    }
    return 3;
  }
  
  if (combined.includes("ضمان") || combined.includes("شفاعة") || combined.includes("سؤال الجنة") || combined.includes("آية الكرسي") || combined.includes("سيد الاستغفار") || combined.includes("صدقة") || combined.includes("إنفاق") || combined.includes("تأمين") || combined.includes("عتق") || combined.includes("باب") || combined.includes("حصن")) {
    return 4;
  }
  
  return 1;
};

const CANONICAL_TASKS: DailyChecklist[] = [
  {
    task: "صلاة 12 ركعة سُنة الرواتب يومياً",
    target: "بناء بيت في الجنة (صحيح مسلم)",
    target_building: "بناء بيت في الجنة (صحيح مسلم)",
    unit_name: "بيت",
    multiplier: 12,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 1
  },
  {
    task: "قراءة سورة الإخلاص 10 مرات",
    target: "بناء قصر في الجنة (مسند أحمد)",
    target_building: "بناء قصر في الجنة (مسند أحمد)",
    unit_name: "قصر",
    multiplier: 10,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 1
  },
  {
    task: "ترك المراء والجدال العقيم وإن كنت محقاً",
    target: "بيت في ربض (أطراف) الجنة (سنن أبي داود)",
    target_building: "بيت في ربض (أطراف) الجنة (سنن أبي داود)",
    unit_name: "بيت",
    multiplier: 1,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 1
  },
  {
    task: "تجنب الكذب وتجنب المزاح بالباطل يوماً كاملاً",
    target: "بيت في وسط الجنة (سنن أبي داود)",
    target_building: "بيت في وسط الجنة (سنن أبي داود)",
    unit_name: "بيت",
    multiplier: 1,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 1
  },
  {
    task: "التزام حُسن الخُلق والملاطفة اللفظية مع الناس",
    target: "بيت في أعلى الجنة لمن حسن خلقه",
    target_building: "بيت في أعلى الجنة لمن حسن خلقه",
    unit_name: "بيت",
    multiplier: 1,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 1
  },
  {
    task: "المساهمة في بناء مسجد أو عمارته ولو بنصيب يسير",
    target: "بناء بيت مماثل في الجنة (ابن ماجه)",
    target_building: "بناء بيت مماثل في الجنة (ابن ماجه)",
    unit_name: "بيت",
    multiplier: 1,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 1
  },
  {
    task: "سد الفرجة والخلل في صف الصلاة",
    target: "بناء بيت ورفع درجة عظيمة في الجنة",
    target_building: "بناء بيت ورفع درجة عظيمة في الجنة",
    unit_name: "بيت",
    multiplier: 1,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 1
  },
  {
    task: "قول (سبحان الله العظيم وبحمده) 500 مرة",
    target: "غرس حديقة نخيل عظيمة بـ 500 نخلة",
    target_building: "غرس حديقة نخيل عظيمة بـ 500 نخلة",
    unit_name: "حديقة نخيل",
    multiplier: 500,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 2
  },
  {
    task: "قول الباقيات الصالحات 100 مرة",
    target: "غرس حديقة أشجار متنوعة بـ 100 شجرة",
    target_building: "غرس حديقة أشجار متنوعة بـ 100 شجرة",
    unit_name: "حديقة أشجار وثمار",
    multiplier: 100,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 2
  },
  {
    task: "قول (لا حول ولا قوة إلا بالله) 100 مرة",
    target: "كنز ثروة تحت العرش ممتد ومتين (صحيح البخاري)",
    target_building: "كنز ثروة تحت العرش ممتد ومتين (صحيح البخاري)",
    unit_name: "كنز الروح",
    multiplier: 100,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 3
  },
  {
    task: "الذهاب إلى المسجد لأداء الصلاة والعودة منه",
    target: "إعداد نُزُل (ضيافة ملكية) كلما غدا أو راح",
    target_building: "إعداد نُزُل (ضيافة ملكية) كلما غدا أو راح",
    unit_name: "ضيافة ملكية",
    multiplier: 1,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 3
  },
  {
    task: "سؤال الله عز وجل الجنة 3 مرات بالفم الصادق",
    target: "استدعاء شفاعة وتوسل الجنة للرب بدخولك",
    target_building: "استدعاء شفاعة وتوسل الجنة للرب بدخولك",
    unit_name: "شفاعة الدار",
    multiplier: 1,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 4
  },
  {
    task: "قراءة آية الكرسي دبر كل صلاة مكتوبة",
    target: "ضمان الدخول العاجل للجنة ولا يمنعه إلا الموت",
    target_building: "ضمان الدخول العاجل للجنة ولا يمنعه إلا الموت",
    unit_name: "بوابة ومأمن دخول",
    multiplier: 1,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 4
  },
  {
    task: "تلاوة وقول سيد الاستغفار بيقين صباحاً ومساءً",
    target: "ضمان الفوز الحتمي بالجنة إذا مات في يومه",
    target_building: "ضمان الفوز الحتمي بالجنة إذا مات في يومه",
    unit_name: "تأمين خلاص سيادي",
    multiplier: 1,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 4
  },
  {
    task: "تقديم صدقة أو إنفاق أو سقاية ماء لوجه الله",
    target: "بناء درع والولوج من باب الصدقة الخاص",
    target_building: "بناء درع والولوج من باب الصدقة الخاص",
    unit_name: "درع وباب صدقة",
    multiplier: 1,
    count_required: 1,
    current_count: 0,
    done: false,
    category: 4
  }
];

const getElementEmoji = (type: string) => {
  const norm = (type || "").toLowerCase();
  if (norm.includes("palace") || norm.includes("قصر") || norm.includes("بيت") || norm.includes("منزل") || norm.includes("home")) return "🏰";
  if (norm.includes("tree") || norm.includes("نخل") || norm.includes("شجر") || norm.includes("بستان") || norm.includes("bustan")) return "🌴";
  if (norm.includes("tent") || norm.includes("خيمة") || norm.includes("khayma")) return "⛺";
  if (norm.includes("river") || norm.includes("نهر") || norm.includes("nahr") || norm.includes("ماء")) return "🌊";
  if (norm.includes("jewel") || norm.includes("كنز") || norm.includes("ياقوت") || norm.includes("لؤلؤ") || norm.includes("جوهر")) return "💎";
  return "✨";
};

const getMotivationMessage = (pct: number) => {
  if (pct >= 100) return "ما شاء الله! لقد كملت جميع مهام اليوم وتجلت قصورك وبساتينك بأبهى حلة نعيمية.";
  if (pct >= 75) return "عمل عظيم! قارب ملكك على الاكتمال، فاستمر بالذكر والعمل الصالح لتتم البناء.";
  if (pct >= 50) return "منتصف الطريق! بساتينك بدأت تخضر وقصورك يثبت أساسها بالذكر والنافلة.";
  if (pct >= 25) return "بداية مباركة! كل تسبيحة وكل ركعة تضع لبنة جديدة في صرحك الفردوسي.";
  return "ابدأ بجدول الأعمال اليومية لتشهد نمو ملكك وتشييد معالم النعيم خطوة بخطوة بالعمل الصالح الأصيل.";
};

// Preset examples to help users onboard
const DESCRIPTION_PRESETS = [
  {
    title: "قصر الفردوس الفاخر",
    text: "أريد قصراً ذهبياً ساطعاً في الفردوس الأعلى، تحيط به بساتين الرمان والريحان، وتجري من تحته أنهار من عسل مصفى ولبن لم يتغير طعمه، وبجانبه خيمة لؤلؤ عظيمة."
  },
  {
    title: "الحدائق الواسعة والنخيل",
    text: "أريد بستاناً كبيراً يضم ألف نخلة من نخل الجنة، يسير الراكب في ظلها مائة عام، وتتكئ فيه على سرر مرفوعة وأكواب موضوعة بجوار ينابيع الماء المنسكبة."
  },
  {
    title: "الملك العظيم والخيام اللؤلؤية",
    text: "أريد خيماً من لؤلؤ مجوف ممتدة على ضفاف أنهار الكوثر، بجانبها بيوت رائعة لكل بيت اثنتا عشرة ركعة سنة، وأشجاراً يطير من ثمارها طيور خضراء."
  }
];

// Default initial blueprint data
const INITIAL_BLUEPRINT: BlueprintData = {
  plan_card: "مرحباً بك في لوحة التخطيط الأولي لملكك الأخروي. أدخل تفاصيل أمنيتك المعمارية في الخانة المجاورة لإنشاء المخطط التفصيلي المربوط بالنصوص النبوية الصحيحة.",
  daily_checklist: CANONICAL_TASKS,
  visual_elements: [
    {
      type: "palace",
      name: "قصر الإخلاص الذهبي",
      hadith: "من قرأ قل هو الله أحد عشر مرات بنى الله له قصراً في الجنة",
      action: "قراءة سورة الإخلاص 10 مرات",
      size_calc: "مساحة شاسعة لا يصفها بكسر أو مقدار يعلمه الله عز وجل"
    },
    {
      type: "tent",
      name: "خيمة اللؤلؤ المجوف",
      hadith: "إن للمؤمن في الجنة لخيمة من لؤلؤة واحدة مجوفة طولها ستون ميلاً في السماء",
      action: "الإيمان والعمل الصادق",
      size_calc: "الطول: 60 ميلاً في السماء (ما يعادل حوالي 96 كيلومتراً)"
    },
    {
      type: "tree",
      name: "نخلة الفردوس المعطاء",
      hadith: "من قال سبحان الله العظيم وبحمده غرست له نخلة في الجنة",
      action: "قول سبحان الله العظيم وبحمده",
      size_calc: "جذوع من ذهب خالص، والظل يسير فيه الراكب مائة عام ولا يقطعه"
    },
    {
      type: "river",
      name: "نهر الكوثر العذب",
      hadith: "الكوثر نهر في الجنة حافتاه من ذهب ومجراه على الدر والياقوت",
      action: "حب نبي الله محمد صلى الله عليه وسلم واتباع سنته",
      size_calc: "يمتد عبر ملكك على حبات اللؤلؤ والياقوت والمسك الأذفر"
    }
  ]
};

export default function App() {
  // Authentication & API states
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("gemini_api_key") || "");
  const [showWelcome, setShowWelcome] = useState<boolean>(() => !localStorage.getItem("gemini_api_key"));
  const [showKeyEditor, setShowKeyEditor] = useState<boolean>(false);
  const [isUsingBuiltIn, setIsUsingBuiltIn] = useState<boolean>(() => localStorage.getItem("gemini_api_key") === "BUILT_IN");

  // Majestic Spiritual Guardrail states
  const [showGuardrailEntry, setShowGuardrailEntry] = useState<boolean>(false);
  const [isGuardrailBlockingForGen, setIsGuardrailBlockingForGen] = useState<boolean>(false);
  const [genCountdown, setGenCountdown] = useState<number>(3);

  useEffect(() => {
    if (!showWelcome && sessionStorage.getItem("has_seen_guardrail_entry") !== "true") {
      setShowGuardrailEntry(true);
    }
  }, [showWelcome]);

  const handleDismissGuardrailEntry = () => {
    sessionStorage.setItem("has_seen_guardrail_entry", "true");
    setShowGuardrailEntry(false);
    playHeavenlyChime();
  };

  // Core state variables
  const [prompt, setPrompt] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [blueprint, setBlueprint] = useState<BlueprintData>(() => {
    const saved = localStorage.getItem("local_blueprint");
    return saved ? JSON.parse(saved) : INITIAL_BLUEPRINT;
  });
  const [showSimulation, setShowSimulation] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Modals
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<{ task: string; target: string; index: number } | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [hasDismissedCompletion, setHasDismissedCompletion] = useState<boolean>(false);

  // Tooltip details state
  const [tooltipElement, setTooltipElement] = useState<VisualElement | null>(null);

  // Background Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Save blueprint state change helper
  const saveBlueprint = (newData: BlueprintData) => {
    setBlueprint(newData);
    localStorage.setItem("local_blueprint", JSON.stringify(newData));
  };

  // 1. DYNAMIC BACKGROUND (Arabic Letters Floating Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Watch resize properly using window listeners
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // List of meaningful spiritual Arabic letters
    // س: سلام، ن: نعيم، ج: جنة، م: ملك، ق: قصور، ف: فردوس، ر: رضوان، د: دار السلام، ع: عدن
    const arabicLetters = ["س", "ن", "ج", "م", "ق", "ف", "ر", "د", "ع", "خ", "ل", "ط", "ح"];

    interface Particle {
      x: number;
      y: number;
      char: string;
      size: number;
      speed: number;
      opacity: number;
      fadeSpeed: number;
      growing: boolean;
    }

    const particles: Particle[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height + height, // Start off bottom mostly
      char: arabicLetters[Math.floor(Math.random() * arabicLetters.length)],
      size: Math.random() * 24 + 14,
      speed: Math.random() * 0.4 + 0.15,
      opacity: Math.random() * 0.25 + 0.05,
      fadeSpeed: Math.random() * 0.002 + 0.001,
      growing: Math.random() > 0.5
    }));

    const render = () => {
      // Very slight translucent clearing to allow trails
      ctx.fillStyle = "rgba(15, 7, 30, 0.4)";
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p) => {
        // Render
        ctx.font = `${p.size}px Amiri, Cairo, serif`;
        ctx.fillStyle = `rgba(216, 180, 254, ${p.opacity})`; // Neon Light Crystal purple tone
        ctx.textAlign = "center";
        ctx.fillText(p.char, p.x, p.y);

        // Update position (Floating upwards)
        p.y -= p.speed;

        // Opacity oscillation/fading
        if (p.growing) {
          p.opacity += p.fadeSpeed;
          if (p.opacity >= 0.35) p.growing = false;
        } else {
          p.opacity -= p.fadeSpeed;
          if (p.opacity <= 0.02) p.growing = true;
        }

        // Reset if floats off top
        if (p.y < -30) {
          p.y = height + Math.random() * 50;
          p.x = Math.random() * width;
          p.char = arabicLetters[Math.floor(Math.random() * arabicLetters.length)];
          p.size = Math.random() * 24 + 14;
          p.speed = Math.random() * 0.4 + 0.15;
          p.opacity = Math.random() * 0.25 + 0.05;
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      canvas.width = 0;
      canvas.height = 0;
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Play Standard Browser Beep for Alarms
  const playStandardBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime); // Standard 440Hz "beep"
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Standard beep play blocked or failed:", e);
    }
  };

  // Play Beautiful Angelic Chime
  const playHeavenlyChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35); // A5
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc2.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.45); // E6
      
      gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      
      osc1.stop(ctx.currentTime + 1.5);
      osc2.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.warn("Audio feedback play blocked or failed:", e);
    }
  };

  // 2. STRIKING REMINDER ALERT (setInterval)
  useEffect(() => {
    const interval = setInterval(() => {
      if (blueprint.daily_checklist.length === 0) return;

      // Filter tasks to make sure we primarily remind about incomplete ones, fallback to all
      const candidates = blueprint.daily_checklist.map((t, idx) => ({ ...t, index: idx }));
      const incomplete = candidates.filter(t => !t.done);
      const listToSelectFrom = incomplete.length > 0 ? incomplete : candidates;

      // Choose a random task
      const randomItem = listToSelectFrom[Math.floor(Math.random() * listToSelectFrom.length)];
      if (randomItem) {
        setActiveNotification({
          task: randomItem.task,
          target: randomItem.target,
          index: randomItem.index
        });
        
        // Ring standard browser beep sound as requested
        playStandardBeep();
      }
    }, 60000); // Triggers every 60 seconds

    return () => clearInterval(interval);
  }, [blueprint.daily_checklist, soundEnabled]);

  // Welcome modal submit Handler
  const handleStartApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUsingBuiltIn) {
      localStorage.setItem("gemini_api_key", "BUILT_IN");
      setApiKey("BUILT_IN");
      setShowWelcome(false);
      setShowKeyEditor(false);
      playHeavenlyChime();
    } else {
      if (!apiKey.trim()) {
        alert("يرجى إدخال مفتاح API صحيح أو اختيار المفتاح السحابي المدمج للمتابعة.");
        return;
      }
      localStorage.setItem("gemini_api_key", apiKey.trim());
      setShowWelcome(false);
      setShowKeyEditor(false);
      playHeavenlyChime();
    }
  };

  // Clear API key
  const handleClearKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setIsUsingBuiltIn(false);
    setShowWelcome(true);
  };

  // Handle preset selection
  const handleUsePreset = (text: string) => {
    setPrompt(text);
    playHeavenlyChime();
  };

  // Checklist completion percentage calculator
  const calculateProgress = () => {
    let totalRequired = 0;
    let totalCompleted = 0;
    
    if (blueprint.daily_checklist.length === 0) return 0;

    blueprint.daily_checklist.forEach((t) => {
      const required = typeof t.count_required === "number" ? t.count_required : 1;
      const current = typeof t.current_count === "number" ? t.current_count : (t.done ? 1 : 0);
      totalRequired += required;
      totalCompleted += Math.min(required, Math.max(0, current));
    });
    
    if (totalRequired === 0) return 100;
    return Math.round((totalCompleted / totalRequired) * 100);
  };

  const progressPct = calculateProgress();

  // Helper to dynamically calculate precise achievements from the checklist
  const getExactAchievementsString = (checklist: DailyChecklist[]) => {
    const list: string[] = [];

    checklist.forEach((item) => {
      const cur = typeof item.current_count === "number" ? item.current_count : (item.done ? (item.count_required || 1) : 0);
      const req = typeof item.count_required === "number" ? item.count_required : 1;
      
      const taskText = (item.task || "").toLowerCase();
      const targetText = (item.target_building || item.target || "").toLowerCase();
      const combined = `${taskText} ${targetText}`;

      if (combined.includes("إخلاص") || combined.includes("قصر") || combined.includes("palace")) {
        // Al-Ikhlas: 10 times build 1 Palace. Calculate exactly
        let palaces = 0;
        if (combined.includes("إخلاص") || taskText.includes("الإخلاص")) {
          palaces = Math.floor(cur / 10);
          if (palaces === 0 && cur > 0 && cur === req) {
            palaces = 1;
          }
        } else {
          palaces = cur === req ? 1 : Math.ceil(cur / req);
        }
        if (palaces > 0) {
          list.push(`${palaces} ${palaces === 1 ? "قصر" : palaces <= 10 ? "قصور" : "قصراً"}`);
        }
      } else if (combined.includes("نخل") || combined.includes("بستان") || combined.includes("palm") || combined.includes("سبحان الله العظيم")) {
        // 1-to-1 ratio
        if (cur > 0) {
          list.push(`${cur} ${cur === 1 ? "نخلة" : cur <= 10 ? "نخلات" : "نخلة"}`);
        }
      } else if (combined.includes("بيت") || combined.includes("منزل") || combined.includes("رواتب") || combined.includes("home")) {
        let houses = 0;
        if (combined.includes("رواتب") || combined.includes("ركعة")) {
          houses = Math.floor(cur / 12);
          if (houses === 0 && cur > 0 && cur === req) {
            houses = 1;
          }
        } else {
          houses = cur === req ? 1 : Math.ceil(cur / req);
        }
        if (houses > 0) {
          list.push(`${houses} ${houses === 1 ? "بيت في الجنة" : houses <= 10 ? "بيوت في الجنة" : "بيتاً في الجنة"}`);
        }
      } else if (combined.includes("كنز") || combined.includes("لا حول") || combined.includes("treasure")) {
        if (cur > 0) {
          list.push(`${cur} ${cur === 1 ? "كنز" : cur <= 10 ? "كنوز" : "كنزاً"}`);
        }
      } else {
        // General or fallback
        if (cur > 0) {
          const cleanTarget = (item.target_building || item.target || "معلم")
            .replace(/بناء\s+/g, "")
            .replace(/غرس\s+/g, "")
            .replace(/الحصول على\s+/g, "");
          if (req === 1) {
            list.push(`تحقيق ${cleanTarget}`);
          } else {
            list.push(`${cur} ${cleanTarget}`);
          }
        }
      }
    });

    if (list.length === 0) return "";
    
    if (list.length === 1) return list[0];
    const firsts = list.slice(0, -1).join("، ");
    const last = list[list.length - 1];
    return `${firsts}، و ${last}`;
  };

  // Dynamic achievement text summarizing exact built elements
  const getAchievementsSummary = () => {
    const completedList: string[] = [];
    
    blueprint.daily_checklist.forEach((item) => {
      const cur = typeof item.current_count === "number" ? item.current_count : 0;
      if (cur > 0) {
        if (item.unit_name?.includes("قصر")) {
          completedList.push(`إعمار ${cur} قصر`);
        } else if (item.unit_name?.includes("بيت")) {
          completedList.push(`بناء ${cur} بيت في الجنة`);
        } else if (item.unit_name?.includes("نخيل")) {
          completedList.push(`غرس ${cur} حديقة نخيل`);
        } else if (item.unit_name?.includes("أشجار") || item.unit_name?.includes("شجر")) {
          completedList.push(`غرس ${cur} حديقة شجر`);
        } else if (item.unit_name?.includes("كنز")) {
          completedList.push(`الحصول على ${cur} كنز`);
        } else {
          completedList.push(`تحقيق ${cur} ${item.unit_name || "وحدة"}`);
        }
      }
    });

    if (completedList.length === 0) {
      return "الرصيد الحالي المستهدف اليوم: لم تشرع بالإعمار بعد؛ بادر بالذكر والعمل الصالح لتشهد تشكل ملكك في الجنة.";
    }
    return `الرصيد الحالي المستهدف اليوم: تم ${completedList.join("، و ")}`;
  };

  // Trigger Completion Blessing Modal automatically
  useEffect(() => {
    if (progressPct === 100 && !hasDismissedCompletion && blueprint.daily_checklist.length > 0) {
      setShowCompletionModal(true);
      playHeavenlyChime();
    } else if (progressPct < 100) {
      setHasDismissedCompletion(false);
    }
  }, [progressPct, blueprint.daily_checklist]);

  // Handle checking/toggling a spiritual task
  const toggleTask = (index: number) => {
    const updatedChecklist = [...blueprint.daily_checklist];
    const task = updatedChecklist[index];
    const req = typeof task.count_required === "number" ? task.count_required : 1;
    const cur = typeof task.current_count === "number" ? task.current_count : (task.done ? req : 0);
    const isCompleted = cur >= req;
    
    if (isCompleted) {
      task.current_count = 0;
      task.done = false;
    } else {
      task.current_count = req;
      task.done = true;
      playHeavenlyChime();
    }
    
    saveBlueprint({
      ...blueprint,
      daily_checklist: updatedChecklist
    });
  };

  // Handle modifying a numerical counter directly or via +
  const updateTaskCount = (index: number, newCount: number) => {
    const updatedChecklist = [...blueprint.daily_checklist];
    const task = updatedChecklist[index];
    const req = typeof task.count_required === "number" ? task.count_required : 1;
    
    const clampedVal = Math.max(0, newCount); // Allow any non-negative completed count
    task.current_count = clampedVal;
    task.done = (clampedVal >= req);
    
    saveBlueprint({
      ...blueprint,
      daily_checklist: updatedChecklist
    });

    if (task.done) {
      playHeavenlyChime();
    }
  };

  // Handle modifying the requested block count target directly
  const updateTaskTarget = (index: number, newTarget: number) => {
    const updatedChecklist = [...blueprint.daily_checklist];
    const task = updatedChecklist[index];
    const targetVal = Math.max(1, newTarget);
    task.count_required = targetVal;
    task.done = (task.current_count || 0) >= targetVal;
    
    saveBlueprint({
      ...blueprint,
      daily_checklist: updatedChecklist
    });
  };

  // Build list of completed assets for the milestone modal
  const getModalBuiltText = () => {
    const res = getExactAchievementsString(blueprint.daily_checklist);
    return res || "مخطط الطاعات والذكر والعمل الصالح الكلي";
  };

  // Clears progress counts so user can start a fresh daily plan
  const handleResetChecklist = () => {
    const isCustom = blueprint.daily_checklist.some(t => !CANONICAL_TASKS.some(c => c.task === t.task));
    const resetList = (isCustom ? blueprint.daily_checklist : CANONICAL_TASKS).map((t) => ({
      ...t,
      current_count: 0,
      done: false
    }));
    saveBlueprint({
      ...blueprint,
      daily_checklist: resetList
    });
    setHasDismissedCompletion(true);
    setShowCompletionModal(false);
    playHeavenlyChime();
  };

  // Generate Blueprint from AI (Gemini) API
  const handleGenerateBlueprint = async () => {
    if (!prompt.trim()) {
      setErrorMessage("يبدو أنك تركت الوصف فارغاً، صِف ملك الطاعات أولاً!");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setIsGuardrailBlockingForGen(true);
    setGenCountdown(3);

    // Create a promise for the 3-second timer
    const delayPromise = new Promise<void>((resolve) => {
      let timeLeft = 3;
      const interval = setInterval(() => {
        timeLeft--;
        setGenCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });

    try {
      // Call the API and delay Promise in parallel
      const apiCallPromise = async () => {
        const res = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Send key through header if user entered their custom API key
            "x-gemini-key": apiKey !== "BUILT_IN" ? apiKey : ""
          },
          body: JSON.stringify({ prompt: prompt.trim() })
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `خطأ سحابي غير متوقع (كود: ${res.status})`);
        }

        return res.json();
      };

      // Execute both
      const [parsedJson] = await Promise.all([
        apiCallPromise(),
        delayPromise
      ]);

      if (parsedJson && parsedJson.plan_card) {
        // Enforce all new visual items mapped to checkable flags if absent
        const sanitizedChecklist = (parsedJson.daily_checklist || []).map((t: any) => {
          const taskText = t.task || t.task_name || "";
          const targetText = t.target_building || t.target || "";
          const category = getTaskCategory(taskText, targetText);
          
          let unit_name = "كتلة";
          let multiplier = 1;
          const combined = `${taskText} ${targetText}`.toLowerCase();
          
          if (combined.includes("قصر") || combined.includes("palace")) {
            unit_name = "قصر";
            multiplier = 10;
          } else if (combined.includes("بيت") || combined.includes("منزل") || combined.includes("رواتب") || combined.includes("home")) {
            unit_name = "بيت";
            multiplier = 12;
          } else if (combined.includes("نخل") || combined.includes("palm")) {
            unit_name = "حديقة نخيل";
            multiplier = 500;
          } else if (combined.includes("شجر") || combined.includes("بستان") || combined.includes("tree")) {
            unit_name = "حديقة أشجار";
            multiplier = 100;
          } else if (combined.includes("كنز") || combined.includes("la hawla") || combined.includes("لا حول") || combined.includes("treasure")) {
            unit_name = "كنز";
            multiplier = 100;
          } else if (combined.includes("نُزُل") || combined.includes("ضيافة") || combined.includes("nozol")) {
            unit_name = "ضيافة ملكية";
            multiplier = 1;
          } else if (combined.includes("ضمان") || combined.includes("شفاعة") || combined.includes("بوابة") || combined.includes("تأمين")) {
            unit_name = "ضمان";
            multiplier = 1;
          }
          
          const rawCount = typeof t.count_required === "number" ? t.count_required : 1;
          const blockCount = Math.ceil(rawCount / multiplier) || 1;
          
          return {
            task: taskText,
            target_building: targetText,
            target: targetText,
            unit_name,
            multiplier,
            count_required: blockCount,
            current_count: typeof t.current_count === "number" ? t.current_count : 0,
            done: !!t.done,
            category
          };
        });

        const newBlueprint = {
          plan_card: parsedJson.plan_card,
          daily_checklist: sanitizedChecklist,
          visual_elements: parsedJson.visual_elements || []
        };

        saveBlueprint(newBlueprint);
        playHeavenlyChime();
      } else {
        throw new Error("تلميح خاطئ: لم يرسل النموذج البنية الهندسية للنعيم بشكل صحيح.");
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "فشل الاتصال بالخادم السحابي الذكي.");
      // Ensure we still resolve the delay if API fails fast
      await delayPromise.catch(() => {});
    } finally {
      setIsGenerating(false);
      setIsGuardrailBlockingForGen(false);
    }
  };

  return (
    <main className="relative min-h-screen font-sans bg-[#020617] text-white overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* 1. BACKGROUND FLOATING CANVAS LAYER */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      {/* Decorative Custom Radial Glowing Orbs (Soft Crystal Purple & Deep Blue with high blur) */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#c084fc]/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-[#3b82f6]/10 rounded-full blur-[160px] pointer-events-none z-0"></div>
      <div className="fixed top-[40%] left-[30%] w-[350px] h-[350px] bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* MAIN CONTAINER CONTENT - Centers single-column flow */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-7 w-full">
        
        {/* APP HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
          
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right w-full">
            {/* Elegant Royal Architectural Logo */}
            <div className="relative group flex-shrink-0 mx-auto sm:mx-0">
              {/* Outer Golden/Purple Ambient Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-500 via-purple-600 to-fuchsia-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" style={{ animationDuration: '4s' }} />
              
              {/* Main Logo Container */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#090d23] border border-white/15 p-[1px] flex items-center justify-center overflow-hidden shadow-2xl">
                {/* Engineering style radial grid lines */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.3),transparent_70%)]" />
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:8px_8px]" />
                
                {/* Spiritual Glowing Spheres */}
                <span className="absolute top-1 right-1 w-6 h-6 bg-amber-400/20 rounded-full blur-sm pointer-events-none" />
                <span className="absolute bottom-1 left-1 w-6 h-6 bg-purple-500/30 rounded-full blur-sm pointer-events-none" />
                
                {/* Overlapped Palace (Castle) and Compass */}
                <div className="relative flex items-center justify-center text-amber-300">
                  <Castle className="w-9 h-9 sm:w-11 sm:h-11 text-amber-200 stroke-[1.25] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <Sparkles className="absolute -top-1 -right-1 w-4.5 h-4.5 text-purple-300 animate-pulse" />
                  <Compass className="absolute -bottom-1.5 -left-1.5 w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '15s' }} />
                </div>
              </div>
            </div>

            {/* Typography and Descriptions */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-purple-500/10 border border-purple-400/20">
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span className="text-xs font-bold text-purple-300 tracking-wider">مخطط ملك الفردوس بالذكاء الاصطناعي</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-l from-white via-purple-100 to-purple-300 drop-shadow-sm font-sans">
                محرك هندسة النعيم
              </h1>
              <p className="mt-2 text-gray-300 text-sm sm:text-base max-w-2xl font-light">
                تصور عمراني ومخطط تفصيلي تفاعلي لتشييد ملكك وقصورك وبساتينك بروافد الأعمال الصالحة استناداً إلى الأحاديث النبوية الصحيحة.
              </p>
            </div>
          </div>
        </header>

        {/* 2. TOP PROGRESS BAR (Gradient fill showing complete percentage) - STRICT LIQUID GLASS */}
        <section id="progress_section" className="w-full">
          <div className="liquid-glass rounded-2xl p-6 text-white shadow-[0_0_15px_rgba(192,132,252,0.2)] border border-white/10 relative overflow-hidden">
            {/* Background absolute beam glow effect */}
            <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-purple-500/10 to-transparent blur-md" />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5.5 h-5.5 text-purple-400 animate-spin" style={{ animationDuration: '12s' }} />
                <h2 className="text-base sm:text-lg font-black text-white">
                  نسبة إنجاز المخطط الهندسي النعيمي: <span className="text-purple-300 text-2xl font-black">{progressPct}%</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-purple-200">
                {progressPct === 100 ? "مستعد للتجلي النهائي!" : "متبقي مهام تشييد نشطة في جدول الهمة"}
              </p>
            </div>

            {/* Cylinder progress track */}
            <div className="w-full h-4.5 bg-black/40 rounded-full overflow-hidden p-[2px] border border-white/5 shadow-inner relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
              />
            </div>

            {/* Motivation statement */}
            <p className="mt-3.5 text-xs md:text-sm text-gray-300 italic font-medium flex items-center gap-2">
              <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400 flex-shrink-0" />
              <span>{getMotivationMessage(progressPct)}</span>
            </p>

            {/* Sub-Progress Tracker: Exact achievements summary */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
              <span className="font-semibold text-amber-100 tracking-wide">{getAchievementsSummary()}</span>
            </div>
          </div>
        </section>
        {/* WARNING DISCLAIMER BANNER - STRICT LIQUID GLASS WITH HIGH KNOWLEDGE VALUE */}
        <div id="disclaimer_banner" className="liquid-glass p-5 rounded-2xl border border-white/10 text-xs sm:text-sm leading-relaxed text-amber-200 font-light flex items-start gap-3.5 shadow-[0_0_15px_rgba(192,132,252,0.1)]">
          <Info className="w-5.5 h-5.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="font-extrabold text-amber-300 block mb-1">تنبيه إيماني هام ومسؤولية شرعية:</strong>
            هذا التصميم والمخطط هو مجرد محاكاة بصرية مبسطة لتحفيز الهمم وتذكير المؤمن بالأعمال الصالحة ومضاعفتها. ما أعده الله عز وجل لك في دار النعيم والجنان أعظم من أي بكسل أو ذكاء اصطناعي أو خوارزمية صاغها بشر، مصداقاً للحديث القدسي المتفق عليه: <span className="font-serif italic font-bold text-amber-100">"أَعْدَدْتُ لِعِبَادِي الصَّالِحِينَ مَا لَا عَيْنٌ رَأَتْ، وَلَا أُذُنٌ سَمِعَتْ، وَلَا خَطَرَ عَلَى قَلْبِ بَشَرٍ"</span>.
          </p>
        </div>

        {/* 3. INPUT CONFIGURATOR - FULL WIDTH WIDE COMMAND TERMINAL VIEW */}
        <section id="input_config_section" className="w-full">
          <div className="liquid-glass rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(192,132,252,0.15)] flex flex-col gap-6">
            
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 via-fuchsia-400 to-blue-500" />
            
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2 flex items-center gap-2.5">
                <Hammer className="w-6 h-6 text-purple-300" />
                <span>برمجة وتشكيل الملك النعيمي</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                صف خيارات ملكك المنشود بالتفصيل (مثل: أريد قصراً ذهبياً مشيداً من الذهب والفضة، تحوطه خيام اللؤلؤ الأبيض على ضفة الكوثر، وبساتين نخل عظيمة). وسيقوم المهندس المعماري الرقمي المربوط بنصوص الوحي بتحليلها وإصدار المخطط فوراً.
              </p>
            </div>

            {/* 100% Full-Width Wide Command Terminal Textarea */}
            <div className="relative w-full">
              <textarea
                id="estate_description_textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="مثال: أود قصرين من الفضة والذهب يسندهم خيام لؤلؤ عظيمة ونهر عسل مصفى مع ألف نخلة من لؤلؤ..."
                rows={5}
                className="w-full p-5 rounded-xl bg-black/40 text-white placeholder:text-gray-500 border border-white/15 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all leading-relaxed font-mono text-sm sm:text-base cursor-text"
              />
              
              {prompt && (
                <button
                  onClick={() => setPrompt("")}
                  className="absolute bottom-5 left-5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all border border-white/5 active:scale-95"
                >
                  مسح النص
                </button>
              )}
            </div>

            {/* Presets Grid */}
            <div className="w-full">
              <span className="text-xs text-gray-400 font-bold block mb-3">قوالب هندسية جاهزة للاستلهام:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {DESCRIPTION_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUsePreset(p.text)}
                    className="p-3 text-right rounded-xl bg-white/5 hover:bg-purple-900/15 border border-white/5 hover:border-purple-500/20 transition-all text-xs text-purple-200 hover:text-white truncate font-light shadow-sm"
                    title={p.text}
                  >
                    🔮 {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full pt-2">
              <button
                id="generate_blueprint_btn"
                onClick={handleGenerateBlueprint}
                disabled={isGenerating}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-purple-200 via-purple-300 to-fuchsia-300 hover:opacity-90 transform active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/10 cursor-pointer"
              >
                <Sparkles className={`w-5.5 h-5.5 ${isGenerating ? "animate-spin text-[#3b0764]" : "text-[#3b0764]"}`} />
                <span className="text-sm sm:text-base font-black">
                  {isGenerating ? "جاري استشارة نصوص الأحاديث النبوية..." : "توليد المخطط الهندسي"}
                </span>
              </button>

              <button
                id="run_sim_btn"
                onClick={() => {
                  setShowSimulation(!showSimulation);
                  playHeavenlyChime();
                }}
                className={`px-6 py-4 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base shadow-md ${
                  showSimulation 
                    ? "bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-950/60" 
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Tv className="w-5 h-5 text-purple-300" />
                <span>{showSimulation ? "إخفاء المحاكاة البصرية" : "تشغيل المحاكاة البصرية"}</span>
              </button>
            </div>

            {/* Error block if any */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3 shadow-md animate-pulse">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </section>

        {/* 4. DESIGN BLUEPRINT PLAN REPORT CARD - STRICT LIQUID GLASS */}
        <section id="plan_report_section" className="w-full">
          <div className="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 relative shadow-[0_0_15px_rgba(192,132,252,0.15)]">
            <div className="absolute top-5 left-5">
              <Compass className="w-6 h-6 text-purple-400/30 animate-spin" style={{ animationDuration: '30s' }} />
            </div>
            
            <h4 className="text-sm font-bold text-purple-300 mb-3 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              تقرير المخطط المعماري
            </h4>
            
            {isGenerating ? (
              <div className="space-y-3 py-4">
                <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
                <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse" />
                <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse" />
                <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse" />
              </div>
            ) : (
              <p className="text-gray-100 text-sm sm:text-base leading-relaxed font-normal">
                {blueprint.plan_card}
              </p>
            )}

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span className="font-light">السرعة التقديرية للتجلي: الفردوس الأعلى</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                مستشار نصوص البركة متصل
              </span>
            </div>
          </div>
        </section>

        {/* 5. 3D HOLOGRAPHIC SIMULATION AREA (Revealed dynamically) - NO PLAIN EMOJIS */}
        <AnimatePresence>
          {showSimulation && (
            <motion.section
              id="simulation_area"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full overflow-hidden"
            >
              <div className="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 relative shadow-[0_0_20px_rgba(192,132,252,0.2)]">
                
                {/* Laser scan lines sweeping background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0 opacity-50">
                  <div className="laser-beam" />
                </div>

                {/* Visual map header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-white/5 relative z-10">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                      <Tv className="w-6 h-6 text-purple-400 animate-pulse" />
                      <span>الإسقاط الهولوغرافي</span>
                    </h3>
                    <p className="text-xs sm:text-sm font-light text-gray-300 mt-1">
                      حرك مؤشرك أو المس الهولوغرامات لفتح بوابة الأدلة النبوية الصحيحة والأبعاد العمرانية المقدرة.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 font-bold text-purple-300 animate-pulse">
                      بث الليزر الهولوغرافي نشط 📡
                    </span>
                  </div>
                </div>

                {isGenerating ? (
                  <div className="p-16 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-3 relative z-10">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
                    <span className="animate-pulse">جاري تشكيل البنى التحتية للملك الموعود وتجسيد الهولوغرامات...</span>
                  </div>
                ) : blueprint.visual_elements.length === 0 ? (
                  <div className="p-16 text-center text-gray-400 text-sm italic relative z-10">
                    لم نجد معالم لتجسيدها هولوغرافياً. يرجى وصف ملكك بالأعلى لبعث المخطط.
                  </div>
                ) : (
                  <div className="relative z-10">
                    
                    {/* HOLOGRAPHIC LAYOUT VIEWPORT CONTAINER */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {blueprint.visual_elements.map((elem, idx) => {
                        const isSelected = tooltipElement?.name === elem.name;
                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setTooltipElement(elem)}
                            onMouseLeave={() => setTooltipElement(null)}
                            onClick={() => {
                              setTooltipElement(isSelected ? null : elem);
                              playHeavenlyChime();
                            }}
                            className={`relative p-6 rounded-2xl border transition-all duration-500 group cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center select-none shadow-lg min-h-[224px] ${
                              isSelected
                                ? "bg-purple-900/20 border-purple-400/60 shadow-[0_0_25px_rgba(192,132,252,0.35)] scale-105"
                                : "bg-white/5 border-white/10 hover:border-purple-500/30 hover:shadow-[0_0_25px_rgba(192,132,252,0.25)] hover:scale-105"
                            }`}
                          >
                            {/* Hologram Floating Animation and visual projector base inside card */}
                            
                            {/* Prototypical blue/purple laser sweep lines */}
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Holographic glowing projector light emitter at physical bottom */}
                            <div className="absolute bottom-3 w-16 h-3.5 bg-purple-500/25 rounded-full blur-sm group-hover:bg-purple-400/40 transition-all shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                            <div className="absolute bottom-4.5 w-8 h-1 bg-purple-300/60 rounded-full blur-[1.5px] animate-pulse" />
                            
                            {/* Translucent upward light cone of projection */}
                            <div 
                              className="absolute bottom-4.5 w-20 h-28 bg-gradient-to-t from-purple-500/10 via-purple-500/5 to-transparent opacity-60 group-hover:opacity-85 transition-opacity"
                              style={{ clipPath: "polygon(22% 0%, 78% 0%, 100% 100%, 0% 100%)" }}
                            />

                            {/* Floating levitating interactive emoji visual element */}
                            <div className="relative mb-5 z-10 flex items-center justify-center animate-holo-float" style={{ animationDelay: `${idx * 0.4}s` }}>
                              {/* Soft floating backing aura representing the holographic glowing energy sphere */}
                              <div className="absolute -inset-3 bg-gradient-to-tr from-purple-500/30 to-blue-400/30 rounded-full blur-md opacity-80 group-hover:opacity-100 group-hover:scale-115 transition-all animate-pulse" />
                              
                              <div className="w-18 h-18 rounded-full bg-slate-900/90 border-2 border-purple-400/45 flex items-center justify-center text-4xl shadow-[inset_0_0_15px_rgba(168,85,247,0.6)] group-hover:border-purple-300 transition-colors">
                                {getElementEmoji(elem.type || elem.name)}
                              </div>
                            </div>

                            {/* Info text */}
                            <h4 className="text-base font-black text-white mb-2 relative z-10 group-hover:text-purple-300 transition-colors">
                              {elem.name}
                            </h4>
                            
                            <span className="text-[10px] font-black tracking-wider text-purple-200 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-400/20 mb-3 relative z-10">
                              {elem.type === "palace" ? "قصر ملكي" : 
                               elem.type === "tent" ? "صرح لؤلؤي" : 
                               elem.type === "tree" ? "بستان مبارك" : 
                               elem.type === "river" ? "مجرى مائي" : "تشكيل نعيمي"}
                            </span>

                            <p className="text-xs text-gray-300 font-light line-clamp-2 max-w-[180px] leading-relaxed relative z-10 mb-2">
                              {elem.hadith}
                            </p>

                            <div className="mt-2 text-[10px] font-bold text-gray-400 w-full flex items-center justify-center gap-1.5 pt-2 border-t border-white/5 group-hover:text-purple-300 transition-colors relative z-10">
                              <span>قراءة الأدلة المعمارية</span>
                              <Maximize2 className="w-3 h-3 text-purple-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DYNAMIC SEAMLESS CRYSTAL TOOLTIP DETAIL DISPLAY */}
                    <div className="mt-8 min-h-[140px] relative">
                      <AnimatePresence mode="wait">
                        {tooltipElement ? (
                          <motion.div
                            key={tooltipElement.name}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            className="p-6 rounded-2xl bg-gradient-to-l from-purple-950/40 to-slate-950/40 border border-purple-400/30 shadow-[inset_0_0_15px_rgba(168,85,247,0.15)] leading-relaxed"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-white/5">
                              <span className="text-lg font-black text-white flex items-center gap-2">
                                <span className="text-2xl">{getElementEmoji(tooltipElement.type || tooltipElement.name)}</span>
                                <span>{tooltipElement.name}</span>
                              </span>
                              <span className="text-xs font-black px-3.5 py-1 rounded-lg bg-amber-400/25 border border-amber-400/30 text-amber-200">
                                البعد والمساحة التقديرية: {tooltipElement.size_calc}
                              </span>
                            </div>

                            <p className="text-gray-200 text-sm sm:text-base font-light mb-4 leading-relaxed">
                              <span className="font-extrabold text-amber-300">الحديث الشريف المسند: </span>
                              <span className="font-serif italic text-white text-base leading-loose">" {tooltipElement.hadith} "</span>
                            </p>

                            <p className="text-sm text-purple-200 flex items-center gap-2">
                              <span className="font-black text-purple-300 flex-shrink-0">سعر البناء الأخروي (العمل المطلق):</span>
                              <span className="underline decoration-wavy decoration-purple-400 font-bold bg-purple-950/50 px-2 py-0.5 rounded text-xs">{tooltipElement.action}</span>
                            </p>
                          </motion.div>
                        ) : (
                          <div className="p-8 rounded-2xl bg-black/30 border border-white/5 text-center text-sm text-gray-400 font-light italic flex items-center justify-center h-28">
                            قرب مؤشر الفأرة من هولوغرام الملك بالأعلى لبعث قراءة الأبعاد المسندة والأدلّة فوراً...
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 6. SPIRITUAL TASKS DAILY CHECKLIST - CATEGORY TABBED NAV BAR & BLOCK COUNTERS */}
        <section id="checklist_section" className="w-full">
          <div className="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 shadow-[0_0_20px_rgba(192,132,252,0.15)]">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                  <CheckSquare className="w-5.5 h-5.5 text-purple-300" />
                  <span>برنامج السعي والتشييد اليومي</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-light">بادر بتحقيق مهام كتل الإعمار وسينمو ملكك فورياً</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-purple-500/25 text-purple-200 border border-purple-400/20">
                  {blueprint.daily_checklist.filter(t => t.done).length} / {blueprint.daily_checklist.length} طاعة مكتملة
                </span>
                <button
                  onClick={handleResetChecklist}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-200 hover:text-amber-100 bg-amber-400/10 border border-amber-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  تصفير العدادات اليومية
                </button>
              </div>
            </div>

            {/* Horizontal Glassmorphic sub-navbar for 4 spiritual categories */}
            <div className="w-full flex overflow-x-auto gap-2 pb-2 mb-6 border-b border-white/5 no-scrollbar scroll-smooth">
              {[
                { id: 1, label: "🏰 مشاريع البناء الكبرى", count: "7" },
                { id: 2, label: "🌴 التخطيط الزراعي", count: "2" },
                { id: 3, label: "💎 البنية التحتية والكنوز", count: "2" },
                { id: 4, label: "🎫 الضمانات السيادية", count: "4" }
              ].map((tab) => {
                const active = activeTab === tab.id;
                // Calculate actual count completed
                const forTab = blueprint.daily_checklist.filter(item => {
                  const cat = item.category || getTaskCategory(item.task, item.target_building || item.target || "");
                  return cat === tab.id;
                });
                const comp = forTab.filter(t => t.done).length;
                const progressText = `${comp}/${forTab.length}`;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      playHeavenlyChime();
                    }}
                    className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2.5 cursor-pointer border ${
                      active 
                        ? "bg-purple-500/25 text-purple-200 border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.35)]" 
                        : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? "bg-purple-500/30 text-purple-100" : "bg-black/20 text-gray-500"}`}>
                      {progressText}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6 font-light">
              هذه هي خيارات ومفاتيح الأوراد والأعمال المسؤولة مباشرة عن بناء تفاصيل ملكك المرفوعة أعلاه طبق السنة النبوية. اضغط على الدائرة بعد إتمام وردك وسيتم مضاعفة نسبة الإعمار في سجلاتك التقديرية فوراً:
            </p>

            {isGenerating ? (
              <div className="space-y-4 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-6 h-6 rounded-lg bg-white/5 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-white/5 rounded w-2/3 animate-pulse" />
                      <div className="h-2.5 bg-white/5 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (() => {
              // Get item list matching clicked category pagination
              const filteredList = blueprint.daily_checklist.filter((item) => {
                const cat = item.category || getTaskCategory(item.task, item.target_building || item.target || "");
                return cat === activeTab;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="p-10 text-center text-gray-450 text-xs italic">
                    لا توجد أعمال في هذا القسم خطتك الحالية. يمكنك توليد مخطط جديد بالكامل لكافة الطاعات.
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredList.map((item) => {
                    const originalIndex = blueprint.daily_checklist.findIndex(x => x.task === item.task);
                    if (originalIndex === -1) return null;

                    const req = typeof item.count_required === "number" ? item.count_required : 1;
                    const cur = typeof item.current_count === "number" ? item.current_count : (item.done ? req : 0);
                    const isCompleted = cur >= req;

                    return (
                      <div
                        key={originalIndex}
                        className={`p-4 rounded-xl transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                          isCompleted 
                            ? "bg-purple-900/15 border-purple-500/40 text-purple-200" 
                            : "bg-white/5 border-white/5 text-white"
                        }`}
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTask(originalIndex);
                            }}
                            className="mt-1 flex-shrink-0 transition-transform active:scale-75 cursor-pointer focus:outline-none"
                          >
                            {isCompleted ? (
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-400 to-fuchsia-300 text-slate-950 flex items-center justify-center shadow-md shadow-purple-500/10">
                                <Check className="w-4.5 h-4.5 text-[#15022e] stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-lg border-2 border-purple-400/40 hover:border-purple-300 transition-colors bg-black/20" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0 font-sans">
                            <p className={`text-sm sm:text-base font-bold leading-relaxed ${isCompleted ? "line-through opacity-65 text-gray-450" : "text-white"}`}>
                              {item.task}
                            </p>
                            
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                              <span className="text-purple-300 font-bold">الرمز العمراني:</span>
                              <span className={isCompleted ? "text-gray-400" : "text-amber-200 font-bold"}>
                                {item.target_building || item.target || "تشييد النعيم"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Numeric Counter Widget - Treating tasks as a Single Block Unit and Editable Targets */}
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center gap-1.5 bg-black/35 p-1.5 rounded-lg border border-white/5 self-end sm:self-auto"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskCount(originalIndex, cur - 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-bold select-none cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={cur <= 0}
                          >
                            -
                          </button>

                          <div className="flex items-center gap-1 px-1">
                            <input
                              type="number"
                              min="0"
                              value={cur}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                  updateTaskCount(originalIndex, 0);
                                } else {
                                  const parsed = parseInt(val, 10);
                                  if (!isNaN(parsed)) {
                                    updateTaskCount(originalIndex, parsed);
                                  }
                                }
                              }}
                              className="w-10 h-8 text-center bg-black/50 border border-white/10 rounded text-sm font-black focus:border-purple-400 focus:outline-none text-purple-200 cursor-text font-mono"
                            />
                            <span className="text-gray-550 text-xs font-mono">/</span>
                            <input
                              type="number"
                              min="1"
                              value={req}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                  updateTaskTarget(originalIndex, 1);
                                } else {
                                  const parsed = parseInt(val, 10);
                                  if (!isNaN(parsed)) {
                                    updateTaskTarget(originalIndex, parsed);
                                  }
                                }
                              }}
                              className="w-10 h-8 text-center bg-transparent border-b border-purple-400/30 rounded text-sm font-semibold text-amber-200 focus:border-purple-400 focus:outline-none cursor-text font-mono"
                              title="تعديل السقف المطلوب (مثلاً: 3 قصور أو 10 نخلات)"
                            />
                            <span className="text-[10px] text-purple-300 font-bold ml-1">{item.unit_name || "وحدة"}</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskCount(originalIndex, cur + 1);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded bg-purple-500/20 hover:bg-purple-500/35 active:scale-95 text-xs font-bold text-purple-200 select-none cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            <div className="mt-8 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/15 text-xs sm:text-sm text-purple-200 font-serif leading-relaxed italic text-center">
              "غرس البساتين وبناء الصروح وتوسيع الجنان يسير على من يسره ربي عليه. حافظ على الأوراد يتضاعف ملكك."
            </div>
          </div>
        </section>

        {/* FOOTER BAR */}
        <footer className="text-center text-gray-400 text-xs border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-light relative z-10 w-full mb-4">
          <p>© {new Date().getFullYear()} محرك هندسة النعيم - تجسيد وبناء الهمة التفصيلي</p>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                alert("جميع النصوص والأدلة مستندة على صحيح البخاري، وصحيح مسلم، وسنن الترمذي، وسنن النسائي، ومسند الإمام أحمد.");
              }} 
              className="hover:text-purple-300 hover:underline transition-colors font-bold"
            >
              مصادر الأسانيد المعتمدة
            </button>
            <span>•</span>
            <span className="text-gray-500">من صلة المؤمن بملك الجنة المشيد بالهمة</span>
          </div>
        </footer>
      </div>

      {/* 5. COSMIC DIMENSIONS CALCULATOR MODAL - STYLISH LIQUID GLASS, NO LIGHT BG */}
      <AnimatePresence>
        {showCalculator && (
          <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl liquid-glass text-white overflow-hidden shadow-2xl relative border border-white/10 ring-8 ring-purple-500/1s0 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Calculator className="w-5.5 h-5.5 text-purple-400 animate-pulse" />
                  <span>حاسبة المقاييس والأبعاد الكونية</span>
                </h3>
                <button
                  onClick={() => {
                    setShowCalculator(false);
                    playHeavenlyChime();
                  }}
                  className="p-1.5 px-3.5 text-xs font-bold text-gray-200 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 active:scale-95 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-5 font-light">
                إليك تفاصيل حساب الأبعاد العظيمة المذكورة في السنة النبوية لقصور الملك الأخروي ومقارنتها بالحقائق التقديرية للأرض:
              </p>

              <div className="max-h-[300px] overflow-y-auto space-y-3.5 mb-5 pr-1 text-right">
                {blueprint.visual_elements.map((elem, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 text-stone-200 border border-white/10 hover:border-purple-500/20 transition-all">
                    <div className="flex items-center justify-between gap-2.5 mb-2.5 flex-wrap">
                      <span className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                        <span className="text-xl">{getElementEmoji(elem.type || elem.name)}</span>
                        <span>{elem.name}</span>
                      </span>
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-purple-500/20 border border-purple-400/30 text-purple-200">
                        {elem.type === "palace" ? "قصر الإخلاص" : elem.type === "tent" ? "صرح 60 ميلاً" : "حساب المقاييس والظل"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 font-serif leading-relaxed italic mb-3">
                      " {elem.hadith} "
                    </p>

                    <div className="text-xs sm:text-sm text-purple-200 font-bold flex items-center gap-1.5 bg-purple-950/20 p-2 rounded-lg border border-purple-500/10">
                      <span>📏</span>
                      <span>
                        <strong className="text-amber-300 font-black">المقياس المعماري النبوي:</strong> {elem.size_calc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-400/20 text-xs sm:text-sm leading-relaxed text-purple-200 font-light text-center">
                <strong>تنويه الأبعاد والظل:</strong> يبلغ طول خيمة وبلاط اللؤلؤة ستون ميلاً في السماء (حوالي 96 كيلومتراً). ويسير الراكب السريع في ظل النخيل مئة عام لا يقطعها. هذا من فضل ربي لتهيئة القلوب للآخرة.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. REMINDER SYSTEM ALERT - STRIKING LIQUID GLASS POPUP NOTIFICATION (NO LIGHT BG) */}
      <AnimatePresence>
        {activeNotification && (
          <div className="fixed bottom-6 right-4 sm:right-6 max-w-md w-full z-50 p-1">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1, y: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.5, y: { type: "tween", values: [0, -8, 8, -5, 5, 0], duration: 0.45, ease: "easeInOut" } }}
              exit={{ x: 100, opacity: 0 }}
              className="p-5 rounded-2xl bg-[#090314] text-white shadow-[0_0_25px_rgba(192,132,252,0.4)] border-2 border-purple-500/40 relative ring-4 ring-purple-500/20"
            >
              <div className="absolute -top-3.5 right-6 bg-purple-500 text-white p-1.5 px-3 rounded-full text-xs font-black shadow-md flex items-center gap-1.5 animate-pulse">
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>نداء تشييد طاعة مفقودة!</span>
              </div>

              <div className="mt-3 text-right">
                <h4 className="text-base font-black text-white">
                  حان وقت سقاية وتشييد ملكك في الفردوس!
                </h4>
                
                <p className="mt-2 text-gray-300 text-xs sm:text-sm font-light">
                  المهمة المعمارية المقترحة لبناء <strong className="text-purple-300 font-bold">{activeNotification.target}</strong> هي:
                </p>

                <div className="mt-2.5 p-3.5 rounded-xl bg-purple-950/40 text-purple-100 text-center font-bold text-sm border-r-4 border-purple-400 font-sans shadow-inner">
                  {activeNotification.task}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => {
                      toggleTask(activeNotification.index);
                      setActiveNotification(null);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-purple-400 hover:bg-purple-300 text-slate-950 font-black shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    نفذتها الآن وأنجزت البناء ✓
                  </button>
                  <button
                    onClick={() => {
                      setActiveNotification(null);
                      playHeavenlyChime();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 font-semibold transition-all cursor-pointer active:scale-95"
                  >
                    لاحقاً
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. INITIAL WELCOME & API KEY MODAL - STYLISH LIQUID GLASS, NO SOLID WHITE LIGHT CARD */}
      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xl rounded-2xl liquid-glass text-white border border-white/10 p-6 md:p-8 shadow-2xl relative"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500/20 to-fuchsia-400/20 border border-purple-400/30 p-0.5 mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-3xl">🌅</span>
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                  مرحباً بك في مُحرك هندسة النعيم
                </h3>
                <p className="text-xs sm:text-sm text-purple-200 font-bold mb-5">
                  لوحة همم تفاعلية وتصور معماري للملك والقصور وبساتين الفردوس طبقاً للأحاديث النبوية
                </p>

                {/* Prominent warning disclaimer matching exact text req */}
                <div className="p-4 rounded-xl bg-purple-900/10 border border-purple-500/20 text-[12px] sm:text-xs leading-relaxed text-right font-light mb-6 shadow-inner relative text-amber-200">
                  <span className="absolute -top-3 right-4 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">إقرار هام ومسؤولية شرعية</span>
                  هذا التصميم هو مجرد محاكاة بصرية مبسطة لتحفيز الهمم وتذكير المؤمن بالأعمال الصالحة ومضاعفتها. ما أعده الله عز وجل لك في دار النعيم والجنان أعظم من أي بكسل أو ذكاء اصطناعي أو خوارزمية صاغها بشر، مصداقاً للحديث (فِيهَا مَا لاَ عَيْنٌ رَأَتْ، وَلاَ أُذُنٌ سَمِعَتْ، وَلاَ خَطَرَ عَلَى قَلْبِ بَشَرٍ).
                </div>

                <form onSubmit={handleStartApp} className="text-right space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center justify-between">
                      <span>مفتاح API الخاص بـ Gemini (اختياري)</span>
                      <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">يحفظ محلياً بخصوصية تامة</span>
                    </label>
                    <input
                      type="password"
                      placeholder="AI_STUDIO_GEMINI_API_KEY..."
                      disabled={isUsingBuiltIn}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full p-3 rounded-xl bg-black/40 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-xs sm:text-sm font-mono text-center"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="use_builtin_key"
                      checked={isUsingBuiltIn}
                      onChange={(e) => {
                        setIsUsingBuiltIn(e.target.checked);
                        if (e.target.checked) {
                          setApiKey("BUILT_IN");
                        } else {
                          setApiKey("");
                        }
                      }}
                      className="w-4.5 h-4.5 rounded text-purple-600 border-white/20 focus:ring-purple-400 bg-black/40 focus:ring-offset-0"
                    />
                    <label htmlFor="use_builtin_key" className="text-xs font-extrabold text-purple-300 cursor-pointer user-select-none">
                      استخدام الرمز السحابي المدمج (تخطي المفتاح الخاص بي)
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-purple-200 via-purple-300 to-fuchsia-300 hover:opacity-90 transform hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg font-sans"
                  >
                    <Hammer className="w-5 h-5 text-purple-900" />
                    <span className="font-black text-sm sm:text-base text-slate-900">ابدأ البناء</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. KEY EDITOR MODAL - STYLISH LIQUID GLASS, NO LIGHT BG */}
      <AnimatePresence>
        {showKeyEditor && (
          <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl liquid-glass text-white p-6 shadow-2xl relative border border-white/10"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-400" />
                  <span>إدارة مفتاح الذكاء الاصطناعي</span>
                </h4>
                <button
                  onClick={() => setShowKeyEditor(false)}
                  className="p-1 px-2.5 text-xs font-bold text-gray-200 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg"
                >
                  إغلاق
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  يمكنك تغيير أو إزالة مفتاح API لـ Gemini وحفظه بمحرك التصفح المحلي لديك:
                </p>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1.5">
                    رمز المفتاح (Gemini API Key):
                  </label>
                  <input
                    type="password"
                    placeholder="مفتاح API..."
                    disabled={isUsingBuiltIn}
                    value={apiKey === "BUILT_IN" ? "" : apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs text-white focus:ring-1 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="edit_use_builtin_key"
                    checked={isUsingBuiltIn}
                    onChange={(e) => {
                      setIsUsingBuiltIn(e.target.checked);
                      if (e.target.checked) {
                        setApiKey("BUILT_IN");
                      } else {
                        setApiKey("");
                      }
                    }}
                    className="w-4 h-4 rounded text-purple-600 border-white/20 focus:ring-purple-400 bg-black/40"
                  />
                  <label htmlFor="edit_use_builtin_key" className="text-xs font-bold text-purple-300 cursor-pointer">
                    استخدام المفتاح السحابي المدمج
                  </label>
                </div>

                <div className="flex gap-2 text-xs font-semibold tracking-wider pt-2">
                  <button
                    onClick={() => {
                      if (isUsingBuiltIn) {
                        localStorage.setItem("gemini_api_key", "BUILT_IN");
                      } else {
                        if (!apiKey) {
                          alert("يرجى إدخال مفتاح ساري المفعول");
                          return;
                        }
                        localStorage.setItem("gemini_api_key", apiKey.trim());
                      }
                      setShowKeyEditor(false);
                      playHeavenlyChime();
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-purple-600 text-slate-950 text-center font-bold hover:bg-purple-500 transition-colors cursor-pointer"
                  >
                    حفظ التغييرات
                  </button>
                  <button
                    onClick={() => {
                      handleClearKey();
                      setShowKeyEditor(false);
                    }}
                    className="py-2.5 px-3.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-300" />
                    <span>حذف البيانات</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CENTRAL SPIRITUAL GUARDRAIL MODAL ON ENTRY */}
      <AnimatePresence>
        {showGuardrailEntry && (
          <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-3xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="w-full max-w-2xl rounded-2xl liquid-glass text-white border border-white/20 p-6 sm:p-10 text-center shadow-[0_0_80px_rgba(168,85,247,0.3)] relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-gradient-to-br from-amber-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              
              <div className="w-16 h-16 rounded-full bg-amber-400/10 border-2 border-amber-400 text-amber-200 flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                <AlertCircle className="w-8 h-8 text-amber-300 animate-pulse" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-amber-200 mb-6 drop-shadow tracking-wide font-sans">
                مسؤولية شرعية وتنبيه عقدي هام
              </h2>

              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-right text-gray-200 mb-8 font-light max-h-[300px] overflow-y-auto pr-2">
                تنبيه إيماني هام ومسؤولية شرعية: هذا التصميم هو مجرد محاكاة بصرية مبسطة لتحفيز الهمم وتذكير المؤمن بالأعمال الصالحة ومضاعفتها. ما أعده الله عز وجل لك في دار النعيم والجنّة أعظم من أي بكسل أو ذكاء اصطناعي أو خوارزمية، مصداقاً للحديث القدسي المتفق عليه: <span className="font-serif italic font-bold text-amber-100">"أَعْدَدْتُ لِعِبَادِي الصَّالِحِينَ مَا لَا عَيْنٌ رَأَتْ، وَلَا أُذُنٌ سَمِعَتْ، وَلَا خَطَرَ عَلَى قَلْبِ بَشَرٍ"</span>.
              </p>

              <button
                onClick={handleDismissGuardrailEntry}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm sm:text-base tracking-wider active:scale-98 transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] cursor-pointer shadow-lg"
              >
                فهمت واستوعبت، ابدأ الإعمار
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CENTRAL SPIRITUAL GUARDRAIL MODAL ON GENERATION (3 SEC COUNTDOWN) */}
      <AnimatePresence>
        {isGuardrailBlockingForGen && (
          <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-3xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="w-full max-w-2xl rounded-2xl liquid-glass text-white border border-fuchsia-500/20 p-6 sm:p-10 text-center shadow-[0_0_80px_rgba(236,72,153,0.25)] relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-gradient-to-br from-fuchsia-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              
              <div className="w-16 h-16 rounded-full bg-fuchsia-500/10 border-2 border-fuchsia-400 text-fuchsia-200 flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(236,72,153,0.2)]">
                <span className="text-xl font-black font-mono animate-pulse">{genCountdown}s</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-fuchsia-300 mb-6 drop-shadow tracking-wide font-sans">
                يرجى الانتظار وتأمل مسؤوليتك الشرعية
              </h2>

              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-right text-gray-200 mb-8 font-light">
                تنبيه إيماني هام ومسؤولية شرعية: هذا التصميم هو مجرد محاكاة بصرية مبسطة لتحفيز الهمم وتذكير المؤمن بالأعمال الصالحة ومضاعفتها. ما أعده الله عز وجل لك في دار النعيم والجنّة أعظم من أي بكسل أو ذكاء اصطناعي أو خوارزمية، مصداقاً للحديث القدسي المتفق عليه: <span className="font-serif italic font-bold text-amber-100">"أَعْدَدْتُ لِعِبَادِي الصَّالِحِينَ مَا لَا عَيْنٌ رَأَتْ، وَلَا أُذُنٌ سَمِعَتْ، وَلَا خَطَرَ عَلَى قَلْبِ بَشَرٍ"</span>.
              </p>

              <div className="flex items-center justify-center gap-2.5 text-xs text-fuchsia-300 font-bold bg-fuchsia-500/10 p-3 rounded-lg border border-fuchsia-500/20">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
                <span>يجري المهندس المعماري الخوارزمي أعمال التشييد التقديرية... المتبقي {genCountdown} ثوانٍ</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. COMPLETION BLESSING MODAL - MAJESTIC GLASS MODAL OVERLAY */}
      <AnimatePresence>
        {showCompletionModal && (
          <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="w-full max-w-lg rounded-2xl liquid-glass text-white border border-white/20 p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.35)] relative overflow-hidden"
            >
              {/* Golden decorative accent */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-purple-600/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-5 shadow-[0_0_35px_rgba(245,158,11,0.5)] animate-bounce">
                <Sparkles className="w-8 h-8 text-stone-900" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-amber-200 mb-4 tracking-tight drop-shadow">
                مبارك لك إتمام مخططك اليومي! 🎉
              </h3>

              <div className="bg-white/5 rounded-xl p-4.5 mb-5 border border-white/10 text-right">
                <p className="text-[10px] uppercase tracking-wider text-purple-300 font-black mb-1">
                  حصيلة إعمارك الأخروية اليوم:
                </p>
                <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
                  {(() => {
                    const completedCounts = {
                      palaces: 0,
                      gardens: 0,
                      treasures: 0,
                      other: [] as string[]
                    };
                    blueprint.daily_checklist.forEach(item => {
                      const cur = typeof item.current_count === "number" ? item.current_count : 0;
                      if (cur > 0) {
                        if (item.unit_name === "قصر") {
                          completedCounts.palaces += cur;
                        } else if (item.unit_name === "حديقة نخيل") {
                          completedCounts.gardens += cur;
                        } else if (item.unit_name === "كنز") {
                          completedCounts.treasures += cur;
                        } else {
                          completedCounts.other.push(`${cur} ${item.unit_name}`);
                        }
                      }
                    });

                    const parts = [
                      completedCounts.palaces > 0 ? `${completedCounts.palaces} قصر` : "",
                      completedCounts.gardens > 0 ? `${completedCounts.gardens} حديقة نخيل` : "",
                      completedCounts.treasures > 0 ? `${completedCounts.treasures} كنز` : ""
                    ].filter(Boolean);
                    
                    completedCounts.other.forEach(ot => parts.push(ot));
                    const finalBuiltText = parts.length > 0 ? parts.join("، و ") : "جميع كتل الطاعات المستهدفة";

                    return (
                      <span>
                        لقد قمت اليوم ببناء وتحقيق كتل هندسية حقيقية: (<span className="text-amber-300">{finalBuiltText}</span>)
                      </span>
                    );
                  })()}
                </p>
              </div>

              {/* Crucial Advice prominent box */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 text-amber-100 text-xs sm:text-sm leading-relaxed text-right font-light">
                <p className="font-extrabold text-amber-300 mb-1 flex items-center gap-1.5 justify-end">
                  <span>تذكرة ربانية</span>
                  <span>✨</span>
                </p>
                احرص أن يكون هذا العمل خالصاً لوجه الله تعالى، فالإخلاص هو شرط القبول، وما عند الله خير وأبقى.
              </div>

              <button
                onClick={handleResetChecklist}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm tracking-wider active:scale-98 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
              >
                إغلاق وبدء مخطط جديد
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}

// Custom simple interfaces for local helper icons if they missing from bundle
function Trash2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
