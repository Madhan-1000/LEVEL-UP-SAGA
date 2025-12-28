import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed: Level Up Saga core domains + task templates.
 * Note: This app is not medical advice. Tasks should be scaled to the user's level.
 */
async function main() {
  console.log('🚀 Seeding Level Up Saga: domains + task templates...')

  const domainsData = [
  {
    "priority": 1,
    "name": "Steel Body",
    "icon": "Dumbbell",
    "color": "hsl(0, 84%, 60%)",
    "desc": "Strength, fitness, and mobility with scalable options."
  },
  {
    "priority": 2,
    "name": "Knowledge Quest",
    "icon": "BookOpen",
    "color": "hsl(217, 91%, 60%)",
    "desc": "Learning, reading, and skill-building in small consistent blocks."
  },
  {
    "priority": 3,
    "name": "Code Craft",
    "icon": "Terminal",
    "color": "hsl(25, 95%, 50%)",
    "desc": "Programming practice with measurable outcomes and review loops."
  },
  {
    "priority": 4,
    "name": "Iron Cognitive Mind",
    "icon": "Brain",
    "color": "hsl(180, 100%, 45%)",
    "desc": "Focus, attention control, and mental clarity through sustainable routines."
  },
  {
    "priority": 5,
    "name": "Sleeping Maniac",
    "icon": "Moon",
    "color": "hsl(280, 67%, 60%)",
    "desc": "Sleep consistency and recovery habits that compound over time."
  },
  {
    "priority": 6,
    "name": "Healthy Mind & Body",
    "icon": "Heart",
    "color": "hsl(330, 81%, 60%)",
    "desc": "Nutrition, movement, and stress management with realistic baselines."
  },
  {
    "priority": 7,
    "name": "Social Skills",
    "icon": "Users",
    "color": "hsl(142, 71%, 45%)",
    "desc": "Communication and relationships through simple weekly reps."
  },
  {
    "priority": 8,
    "name": "Zenith Wealth",
    "icon": "Coins",
    "color": "hsl(45, 93%, 47%)",
    "desc": "Money management, income growth, and career stability basics."
  },
  {
    "priority": 9,
    "name": "Superhuman Physicality",
    "icon": "Zap",
    "color": "hsl(10, 90%, 55%)",
    "desc": "Performance-oriented training with extra recovery and safety built in."
  },
  {
    "priority": 10,
    "name": "Superhuman Mentality",
    "icon": "Shield",
    "color": "hsl(200, 85%, 55%)",
    "desc": "Resilience, discipline, and emotional regulation through practical habits."
  },
  {
    "priority": 11,
    "name": "Typing",
    "icon": "Keyboard",
    "color": "hsl(210, 90%, 60%)",
    "desc": "Typing speed and accuracy with short deliberate sessions."
  },
  {
    "priority": 12,
    "name": "Chess",
    "icon": "Crown",
    "color": "hsl(120, 60%, 45%)",
    "desc": "Chess improvement via tactics, analysis, and focused practice."
  },
  {
    "priority": 13,
    "name": "Home & Environment",
    "icon": "Home",
    "color": "hsl(260, 70%, 60%)",
    "desc": "Order, cleanliness, and environment design that supports your goals."
  },
  {
    "priority": 14,
    "name": "Spiritual & Reflection",
    "icon": "Sparkles",
    "color": "hsl(290, 80%, 65%)",
    "desc": "Values, gratitude, and reflection without pressure or guilt."
  }
] as const

  for (const d of domainsData) {
    await prisma.domain.upsert({
      where: { name: d.name },
      update: { icon: d.icon, color: d.color, description: d.desc, priority: d.priority },
      create: { name: d.name, icon: d.icon, color: d.color, description: d.desc, priority: d.priority },
    })
  }

  const allDomains = await prisma.domain.findMany()

  const taskPool = [
  {
    "name": "Strength Session (Gym or Bodyweight)",
    "desc": "Complete 30\u201345 minutes of strength training: basic lifts (gym) or a bodyweight circuit (push-ups/squats/rows). Stop if sharp pain; scale reps to form.",
    "xp": 160,
    "diff": "medium",
    "type": "timed",
    "d": "Steel Body"
  },
  {
    "name": "Zone 2 Cardio",
    "desc": "Do 25\u201340 minutes easy cardio (brisk walk, cycling, jogging). Keep a pace where you can talk in short sentences.",
    "xp": 140,
    "diff": "medium",
    "type": "timed",
    "d": "Steel Body"
  },
  {
    "name": "Steps Baseline",
    "desc": "Hit 6,000 steps today (or 45 minutes total walking split across the day).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Mobility: Hips + Hamstrings",
    "desc": "Do 10 minutes of hip and hamstring mobility (or a beginner yoga video). Move slowly; no bouncing.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Mobility: Shoulders + Upper Back",
    "desc": "Do 10 minutes shoulder + thoracic mobility (wall slides, band pull-aparts or towel stretches).",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Core Stability",
    "desc": "Do 8\u201312 minutes core work: planks/dead bug (or gym cable core). Keep spine neutral.",
    "xp": 90,
    "diff": "medium",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Protein Target",
    "desc": "Hit a realistic protein target today (e.g., 20\u201330g in one meal) or add one protein-rich snack.",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Hydration Check",
    "desc": "Drink 2 liters of water today (or 6\u20138 cups).",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Warm-up First",
    "desc": "Before any workout, do 5 minutes warm-up (walk, jumping jacks, dynamic mobility).",
    "xp": 50,
    "diff": "easy",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Rest Day: Active Recovery",
    "desc": "Take an active recovery day: 20\u201330 minute easy walk + 5 minutes stretching.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Sleep Support",
    "desc": "Finish your last heavy meal 2\u20133 hours before bed (or keep dinner lighter).",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Progressive Overload (Small)",
    "desc": "Increase one thing today: +1 rep, +1 set, or +2.5kg (or slower tempo) while keeping good form.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Cardio Intervals (Optional)",
    "desc": "Do 10\u201315 minutes intervals: 30s faster + 90s easy (or incline walking). Keep effort sustainable.",
    "xp": 150,
    "diff": "hard",
    "type": "timed",
    "d": "Steel Body"
  },
  {
    "name": "Stretch Before Bed",
    "desc": "Do 8 minutes gentle stretching before bed (hips, calves, chest).",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Rest Day: Full Rest",
    "desc": "Full rest day: no training required; only normal daily movement. Log how you feel (energy 1\u201310).",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Steel Body"
  },
  {
    "name": "Read 10 Pages",
    "desc": "Read 10 pages of a book (or 15 minutes on a quality article).",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Knowledge Quest"
  },
  {
    "name": "Write 5 Bullet Notes",
    "desc": "Write 5 bullet notes summarizing what you learned today (paper or notes app).",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Knowledge Quest"
  },
  {
    "name": "One Lesson Block",
    "desc": "Complete 20\u201330 minutes of a course/lecture (or a focused tutorial).",
    "xp": 110,
    "diff": "medium",
    "type": "timed",
    "d": "Knowledge Quest"
  },
  {
    "name": "Spaced Repetition",
    "desc": "Do 10 minutes of flashcards (Anki or a simple list review).",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Knowledge Quest"
  },
  {
    "name": "Teach-back",
    "desc": "Explain one concept out loud in 2 minutes (or write a short explanation).",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Knowledge Quest"
  },
  {
    "name": "Deep Dive",
    "desc": "Read one long-form piece (20+ minutes) and highlight key points.",
    "xp": 130,
    "diff": "medium",
    "type": "timed",
    "d": "Knowledge Quest"
  },
  {
    "name": "Skill Practice",
    "desc": "Practice a non-coding skill for 20 minutes (language, drawing, music, etc.).",
    "xp": 110,
    "diff": "medium",
    "type": "timed",
    "d": "Knowledge Quest"
  },
  {
    "name": "Curate Sources",
    "desc": "Save 3 high-quality resources for later (articles, videos, docs) and label them.",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Knowledge Quest"
  },
  {
    "name": "Question Log",
    "desc": "Write 3 questions you want to answer this week.",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Knowledge Quest"
  },
  {
    "name": "Weekly Review (Mini)",
    "desc": "Review last 7 days of notes for 10 minutes; pick 1 thing to revisit.",
    "xp": 100,
    "diff": "medium",
    "type": "daily",
    "d": "Knowledge Quest"
  },
  {
    "name": "Podcast Walk",
    "desc": "Listen to 15\u201325 minutes of an educational podcast while walking (or seated).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Knowledge Quest"
  },
  {
    "name": "Apply One Idea",
    "desc": "Apply one learning today: do a small experiment or solve a small problem using it.",
    "xp": 140,
    "diff": "medium",
    "type": "daily",
    "d": "Knowledge Quest"
  },
  {
    "name": "No Doomscroll Window",
    "desc": "Replace 15 minutes of scrolling with 15 minutes reading/learning.",
    "xp": 70,
    "diff": "easy",
    "type": "streak",
    "d": "Knowledge Quest"
  },
  {
    "name": "Rest Day: Light Learning",
    "desc": "Light day: only 5 minutes review of notes or flashcards\u2014keep it easy.",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Knowledge Quest"
  },
  {
    "name": "Create a One-Page Summary",
    "desc": "Write a one-page summary (or 12 bullet points) of a topic you studied recently.",
    "xp": 180,
    "diff": "hard",
    "type": "timed",
    "d": "Knowledge Quest"
  },
  {
    "name": "LeetCode (1 Problem)",
    "desc": "Solve 1 problem (easy or medium). If stuck, spend 20 minutes then read editorial and write your own summary.",
    "xp": 140,
    "diff": "medium",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Project Work (30 min)",
    "desc": "Work 30 minutes on your main project (feature, bugfix, refactor). Define a clear finish line before starting.",
    "xp": 130,
    "diff": "medium",
    "type": "timed",
    "d": "Code Craft"
  },
  {
    "name": "Read Docs (15 min)",
    "desc": "Read official docs or a spec for 15 minutes and note 3 takeaways.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Refactor One Function",
    "desc": "Refactor one function for clarity (naming, early returns, smaller blocks) without changing behavior.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Write Tests (Small)",
    "desc": "Add 1\u20133 tests (or a minimal manual test checklist if no test setup yet).",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Fix One Bug",
    "desc": "Fix one bug/issue and write a short commit message describing what changed.",
    "xp": 150,
    "diff": "hard",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Code Review Time",
    "desc": "Spend 20 minutes reading someone else\u2019s code (open-source or your old code) and note 2 improvements.",
    "xp": 100,
    "diff": "medium",
    "type": "timed",
    "d": "Code Craft"
  },
  {
    "name": "Ship a Small PR",
    "desc": "Push a small improvement: UI polish, error handling, or docs update. Keep it under 30\u201360 minutes.",
    "xp": 150,
    "diff": "medium",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Performance Pass",
    "desc": "Profile one slow page/query and improve one measurable thing (or remove an obvious inefficiency).",
    "xp": 170,
    "diff": "hard",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Database Practice",
    "desc": "Design or adjust one Prisma model or query; verify with a quick test script.",
    "xp": 140,
    "diff": "medium",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Clean Up 20 Lines",
    "desc": "Delete or simplify 20+ lines of unused code (or remove one unused dependency).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Learning Loop",
    "desc": "Write a 5-line \u201cwhat I learned today\u201d dev log (or a short README note).",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Focus Sprint",
    "desc": "25-minute focus sprint (Pomodoro) with phone away; stop at the timer.",
    "xp": 90,
    "diff": "easy",
    "type": "streak",
    "d": "Code Craft"
  },
  {
    "name": "Rest Day: Maintenance Only",
    "desc": "Rest day: only handle essentials (dependency update or notes). No new features.",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Code Craft"
  },
  {
    "name": "Build a Tiny Tool",
    "desc": "Build a tiny utility (CLI/script/component) that saves you time in future work.",
    "xp": 200,
    "diff": "hard",
    "type": "timed",
    "d": "Code Craft"
  },
  {
    "name": "Deep Work Block",
    "desc": "Do 60\u201390 minutes deep work on one task with notifications off (or 2\u00d730 minutes).",
    "xp": 200,
    "diff": "hard",
    "type": "timed",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Plan Tomorrow (5 min)",
    "desc": "Write tomorrow\u2019s top 3 tasks and one \u201cmust-not-do\u201d.",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Meditation (10 min)",
    "desc": "Meditate 10 minutes (or quiet breathing). If anxious, do 5 minutes.",
    "xp": 100,
    "diff": "medium",
    "type": "daily",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Single-Tab Sprint",
    "desc": "Work 25 minutes with a single tab/app; capture distractions on paper.",
    "xp": 110,
    "diff": "medium",
    "type": "streak",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Cognitive Break",
    "desc": "Take a 10-minute walk break without phone (or sit and stretch).",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Journal: 5 Lines",
    "desc": "Write 5 lines: what went well, what didn\u2019t, what to change.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Attention Training",
    "desc": "Read 10 minutes with no music and no tab switching.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Screen Curfew (Mini)",
    "desc": "No short-form video for the last 60 minutes before bed (or set app limit).",
    "xp": 120,
    "diff": "medium",
    "type": "streak",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Declutter Mind",
    "desc": "Brain dump: list everything on your mind, then pick the next single action.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Stress Reset",
    "desc": "Do 3 cycles of box breathing (4-4-4-4) or a 5-minute guided relaxation.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Hard Thing First",
    "desc": "Do the hardest task first for 20 minutes. Stop at 20 even if unfinished.",
    "xp": 140,
    "diff": "medium",
    "type": "daily",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "No Multitask Meal",
    "desc": "Eat one meal without screens; focus on the meal.",
    "xp": 70,
    "diff": "easy",
    "type": "streak",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Rest Day: Gentle Mode",
    "desc": "Gentle day: only plan + one 25-minute focus sprint. Protect recovery.",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Cognitive Hygiene",
    "desc": "Tidy workspace for 5 minutes before starting work.",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Weekly Reflection",
    "desc": "Write 10 bullets: wins, misses, lessons, and one change for next week.",
    "xp": 160,
    "diff": "hard",
    "type": "timed",
    "d": "Iron Cognitive Mind"
  },
  {
    "name": "Consistent Wake Time",
    "desc": "Wake up within a 30-minute window of your target time.",
    "xp": 150,
    "diff": "hard",
    "type": "streak",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Morning Light",
    "desc": "Get 10 minutes of daylight within 1 hour of waking (or sit near bright window).",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Caffeine Cutoff",
    "desc": "No caffeine after 2:00 PM (or 8 hours before bedtime).",
    "xp": 100,
    "diff": "medium",
    "type": "streak",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Wind-down Routine",
    "desc": "Do a 20-minute wind-down (shower, stretch, reading). Keep lights low.",
    "xp": 140,
    "diff": "medium",
    "type": "daily",
    "d": "Sleeping Maniac"
  },
  {
    "name": "No Screens (30 min)",
    "desc": "No screens 30 minutes before bed (or use grayscale + dim + only messages).",
    "xp": 120,
    "diff": "medium",
    "type": "streak",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Bedroom Setup",
    "desc": "Prepare sleep environment: cool room, dim lights, tidy bed area.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Sleep Journal",
    "desc": "Log bedtime, wake time, and sleep quality (1\u201310) in 1 minute.",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Late Meal Rule",
    "desc": "Avoid heavy meals 2\u20133 hours before bed (or keep portion lighter).",
    "xp": 90,
    "diff": "easy",
    "type": "streak",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Stretch for Sleep",
    "desc": "Do 8 minutes gentle stretching focused on hips/neck.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Sleeping Maniac"
  },
  {
    "name": "NSDR / Nap Protocol",
    "desc": "10\u201320 minutes NSDR or short nap before 3 PM (or skip if it hurts night sleep).",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Bedtime Target",
    "desc": "Be in bed by your target bedtime (within 30 minutes).",
    "xp": 150,
    "diff": "hard",
    "type": "streak",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Evening Cleanup",
    "desc": "5-minute room reset to reduce bedtime friction tomorrow.",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Rest Day: Protect Sleep",
    "desc": "Recovery day: no new habits; just hit wake time + wind-down.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Limit Late Scrolling",
    "desc": "If you use phone at night, set a 10-minute timer and stop at it.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Weekend Consistency",
    "desc": "On a weekend day, keep wake time within 60 minutes of weekday target.",
    "xp": 160,
    "diff": "hard",
    "type": "streak",
    "d": "Sleeping Maniac"
  },
  {
    "name": "Balanced Plate",
    "desc": "Eat one balanced meal: protein + fiber + healthy fat (or add fruit/veg to your usual meal).",
    "xp": 100,
    "diff": "medium",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Vegetable Minimum",
    "desc": "Eat 2 servings of vegetables today (or one salad bowl).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Protein + Fiber Snack",
    "desc": "Replace one snack with protein + fiber (curd + fruit, eggs + fruit, nuts + banana).",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "No Sugary Drink",
    "desc": "No sugary drinks today (or switch to zero-sugar).",
    "xp": 90,
    "diff": "easy",
    "type": "streak",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Walk After Meal",
    "desc": "10-minute walk after one meal (or light indoor steps).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Stretch Break",
    "desc": "Do 5 minutes stretching mid-day (neck/hips) to reduce stiffness.",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Mindful Check-in",
    "desc": "2-minute check-in: hunger level, stress level, and next best action.",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Cook Once",
    "desc": "Cook one simple meal at home (or assemble a no-cook healthy meal).",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Sunlight + Water",
    "desc": "Get 10 minutes sunlight and drink a glass of water after waking.",
    "xp": 80,
    "diff": "easy",
    "type": "streak",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Limit Ultra-Processed",
    "desc": "Keep ultra-processed foods to one portion today (or swap one item for whole food).",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Sleep Support Meal Timing",
    "desc": "Keep last snack/meal 2 hours before bed (or reduce portion).",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Rest Day: Gentle Walk",
    "desc": "Gentle recovery: 20\u201330 minute easy walk + 5 minutes mobility.",
    "xp": 110,
    "diff": "easy",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Workout (Light)",
    "desc": "Do 15\u201320 minutes light workout: yoga, mobility flow, or bodyweight basics.",
    "xp": 110,
    "diff": "medium",
    "type": "timed",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Hydration Target",
    "desc": "Drink 2\u20132.5 liters water today (adjust for heat/activity).",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Weekly Meal Plan (Simple)",
    "desc": "Plan 3 simple meals for the week and list ingredients.",
    "xp": 150,
    "diff": "hard",
    "type": "timed",
    "d": "Healthy Mind & Body"
  },
  {
    "name": "Reach Out",
    "desc": "Send a friendly message to one person (or reply to a pending message).",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Small Talk Rep",
    "desc": "Have a 2-minute conversation with someone (shopkeeper/classmate) and ask one question.",
    "xp": 100,
    "diff": "medium",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Active Listening",
    "desc": "In one conversation, summarize what the other person said before responding.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Compliment (Genuine)",
    "desc": "Give one genuine compliment focused on effort or character.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Voice Note (Optional)",
    "desc": "Send one short voice note (or make a quick call) to practice confidence.",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Boundary Practice",
    "desc": "Say \u201cno\u201d or \u201cnot now\u201d once respectfully (or negotiate a smaller commitment).",
    "xp": 140,
    "diff": "hard",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Ask for Help",
    "desc": "Ask one clear question to get help (tech, study, life).",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Social Event",
    "desc": "Attend a small social setting for 30\u201360 minutes (or join an online community call).",
    "xp": 160,
    "diff": "hard",
    "type": "timed",
    "d": "Social Skills"
  },
  {
    "name": "Follow-up",
    "desc": "Follow up with someone you met recently (message + simple question).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Public Speaking Mini",
    "desc": "Speak up once in class/meeting (or practice a 2-minute talk alone and record).",
    "xp": 150,
    "diff": "hard",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Empathy Rep",
    "desc": "Do one helpful act without being asked (small and realistic).",
    "xp": 100,
    "diff": "medium",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Conversation Reflection",
    "desc": "Write 3 bullets: what went well, what to improve, one next step.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Rest Day: Low Social Load",
    "desc": "Low load: only one message or one short conversation. No pressure.",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Networking",
    "desc": "Introduce yourself to one new person (or comment meaningfully in an online group).",
    "xp": 140,
    "diff": "hard",
    "type": "daily",
    "d": "Social Skills"
  },
  {
    "name": "Conflict Skill",
    "desc": "Use \u201cI feel / I need\u201d once in a difficult conversation (or write the message draft).",
    "xp": 170,
    "diff": "hard",
    "type": "timed",
    "d": "Social Skills"
  },
  {
    "name": "Track Spending (5 min)",
    "desc": "Log today\u2019s spending (or estimate) in 5 minutes.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Budget Review",
    "desc": "Review your budget for 10 minutes (or set one spending limit for the week).",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Cancel One Waste",
    "desc": "Cancel or pause one unused subscription (or reduce one recurring expense).",
    "xp": 140,
    "diff": "medium",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Income Skill Block",
    "desc": "Spend 30 minutes building an income skill (portfolio, freelancing skill, resume).",
    "xp": 160,
    "diff": "medium",
    "type": "timed",
    "d": "Zenith Wealth"
  },
  {
    "name": "Apply to One Opportunity",
    "desc": "Apply to one job/internship/gig (or improve one application item).",
    "xp": 170,
    "diff": "hard",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Emergency Buffer",
    "desc": "Set aside a small amount for savings (or commit to a savings rule).",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Learn Finance (15 min)",
    "desc": "Read/watch 15 minutes finance basics (index funds, budgeting, taxes).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Negotiate",
    "desc": "Negotiate one thing: price, deadline, salary expectations (or practice script).",
    "xp": 160,
    "diff": "hard",
    "type": "timed",
    "d": "Zenith Wealth"
  },
  {
    "name": "Weekly Goals Sheet",
    "desc": "Update your 12-month goals sheet for 10 minutes.",
    "xp": 130,
    "diff": "medium",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Side Project Time",
    "desc": "Spend 45\u201360 minutes on a side project (or 2\u00d725 minutes).",
    "xp": 190,
    "diff": "hard",
    "type": "timed",
    "d": "Zenith Wealth"
  },
  {
    "name": "Invoice / Admin",
    "desc": "Handle one admin task: email, bill, document, or schedule.",
    "xp": 100,
    "diff": "medium",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Expense Swap",
    "desc": "Find one cheaper alternative for a regular expense and act on it.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Rest Day: No Money Stress",
    "desc": "Rest day: only log spending (2 minutes). Avoid deep money decisions today.",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Investing Basics",
    "desc": "Learn one concept and write 3 bullet notes (risk, diversification, fees).",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Zenith Wealth"
  },
  {
    "name": "Monthly Review",
    "desc": "Review last month spending + savings and set one target for next month.",
    "xp": 200,
    "diff": "hard",
    "type": "timed",
    "d": "Zenith Wealth"
  },
  {
    "name": "Power Session (Scaled)",
    "desc": "20\u201340 minutes: sprints (outdoor) or cycling intervals (indoor). Keep it controlled; stop if dizzy.",
    "xp": 190,
    "diff": "hard",
    "type": "timed",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Strength (Heavy or Slow)",
    "desc": "3\u20135 sets compound lifts (gym) or slow-tempo bodyweight (push-ups, split squats). Focus on form.",
    "xp": 180,
    "diff": "hard",
    "type": "timed",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Mobility Flow (15 min)",
    "desc": "15 minutes full-body mobility flow (or yoga). Keep it gentle.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Conditioning Circuit",
    "desc": "12\u201318 minutes circuit: squats, push-ups, rows (or bands), planks. Moderate pace.",
    "xp": 160,
    "diff": "hard",
    "type": "timed",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Grip + Posture",
    "desc": "10 minutes grip/posture: dead hangs (or towel holds) + scapular retractions.",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Superhuman Physicality"
  },
  {
    "name": "RPE Awareness",
    "desc": "During training, rate effort 1\u201310 and keep most work at 6\u20138.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Recovery Walk",
    "desc": "30 minutes easy walk to support recovery.",
    "xp": 120,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Stretching (Deep)",
    "desc": "12 minutes stretching: calves, hips, chest. No pain; breathe slowly.",
    "xp": 100,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Prehab",
    "desc": "Do 10 minutes prehab (knees/ankles/shoulders) using bands or bodyweight.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Rest Day: Full Rest",
    "desc": "Full rest: no structured training. Hydrate and sleep on time.",
    "xp": 100,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Sleep Priority",
    "desc": "Aim for 7.5+ hours sleep (or go to bed 30 minutes earlier than usual).",
    "xp": 140,
    "diff": "medium",
    "type": "streak",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Protein + Carb Post-Workout",
    "desc": "After training, have a protein + carb meal/snack (or regular meal with extra protein).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Cardio Base",
    "desc": "40 minutes steady cardio (or 3\u00d715 minutes). Keep it easy.",
    "xp": 160,
    "diff": "medium",
    "type": "timed",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Rest Day: Mobility Only",
    "desc": "Mobility-only day: 15 minutes mobility + 10 minutes walk.",
    "xp": 120,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Form Check",
    "desc": "Record one set (or use mirror) and fix one form cue next session.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Superhuman Physicality"
  },
  {
    "name": "Hard Task Commitment",
    "desc": "Commit to one hard task for 20 minutes. If resistance hits, continue until the timer ends.",
    "xp": 150,
    "diff": "medium",
    "type": "streak",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Values Check",
    "desc": "Write 3 values and one action that matches them today.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Discomfort Training",
    "desc": "Do one small uncomfortable action (cold water face splash or difficult email). Keep it safe.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Emotion Labeling",
    "desc": "When stressed, label the emotion in 5 words and choose the next action.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Gratitude (Specific)",
    "desc": "Write 3 specific things you\u2019re grateful for (not generic).",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Limit Complaints",
    "desc": "Catch and reframe one complaint into a request or action.",
    "xp": 100,
    "diff": "medium",
    "type": "daily",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Social Media Limit",
    "desc": "Keep social media under 20 minutes today (or use app timer).",
    "xp": 130,
    "diff": "medium",
    "type": "streak",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Workout for Mood",
    "desc": "Do 10 minutes movement for mood: walk, mobility, or light workout.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Read 5 Pages (Mindset)",
    "desc": "Read 5 pages of a practical book (psychology, habits, business).",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Rest Day: Compassion",
    "desc": "Rest day: do one small task only; avoid self-criticism. Log one win.",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Sleep Discipline",
    "desc": "Start wind-down 30 minutes before bed (or set alarms to remind).",
    "xp": 120,
    "diff": "medium",
    "type": "streak",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Weekly Goal",
    "desc": "Choose one weekly goal and break it into 3 steps.",
    "xp": 130,
    "diff": "medium",
    "type": "daily",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Talk It Out",
    "desc": "Have a 10-minute honest conversation with someone (or journal it).",
    "xp": 140,
    "diff": "medium",
    "type": "timed",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Failure Review",
    "desc": "Write a 6-line post-mortem on a recent failure: trigger, action, fix.",
    "xp": 140,
    "diff": "medium",
    "type": "daily",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Long Reflection",
    "desc": "30 minutes reflection: wins, patterns, and one change for next week.",
    "xp": 180,
    "diff": "hard",
    "type": "timed",
    "d": "Superhuman Mentality"
  },
  {
    "name": "Home Row Warm-up",
    "desc": "5 minutes home-row warm-up on a typing site (or a local app).",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Typing"
  },
  {
    "name": "Accuracy Session",
    "desc": "10 minutes focusing on 98%+ accuracy (slow down to keep accuracy).",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Typing"
  },
  {
    "name": "Speed Session",
    "desc": "10 minutes speed drills: 3 rounds with 2-minute rest.",
    "xp": 120,
    "diff": "medium",
    "type": "timed",
    "d": "Typing"
  },
  {
    "name": "Numbers + Symbols",
    "desc": "8 minutes practicing numbers/symbols (or code-like typing text).",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Typing"
  },
  {
    "name": "Ergonomics Check",
    "desc": "Adjust chair/keyboard posture for 2 minutes; wrists neutral.",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Typing"
  },
  {
    "name": "Copy Practice",
    "desc": "Type a short paragraph (3\u20135 minutes) focusing on minimal errors.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Typing"
  },
  {
    "name": "Weak Keys",
    "desc": "Practice 5 minutes on your weakest keys (or common bigrams).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Typing"
  },
  {
    "name": "Timed Test",
    "desc": "Do 3 timed tests and record best WPM and accuracy.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Typing"
  },
  {
    "name": "Breaks",
    "desc": "After 45 minutes screen work, take a 2-minute hand/neck stretch break.",
    "xp": 70,
    "diff": "easy",
    "type": "streak",
    "d": "Typing"
  },
  {
    "name": "Consistency",
    "desc": "Practice typing 5 minutes every day this week.",
    "xp": 130,
    "diff": "medium",
    "type": "streak",
    "d": "Typing"
  },
  {
    "name": "Rest Day: Light Practice",
    "desc": "Rest day: only 2 minutes warm-up. Avoid strain.",
    "xp": 50,
    "diff": "easy",
    "type": "daily",
    "d": "Typing"
  },
  {
    "name": "Proper Finger Use",
    "desc": "Do 10 minutes strict touch-typing (no looking) at comfortable speed.",
    "xp": 120,
    "diff": "medium",
    "type": "timed",
    "d": "Typing"
  },
  {
    "name": "Code Typing",
    "desc": "Type 10 lines of code from memory or from a snippet focusing on accuracy.",
    "xp": 130,
    "diff": "medium",
    "type": "daily",
    "d": "Typing"
  },
  {
    "name": "Measure Progress",
    "desc": "Write down weekly baseline: average WPM and accuracy from 5 tests.",
    "xp": 150,
    "diff": "hard",
    "type": "timed",
    "d": "Typing"
  },
  {
    "name": "Hand Care",
    "desc": "5 minutes hand/wrist mobility (or warm water soak if sore).",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Typing"
  },
  {
    "name": "Tactics (10 puzzles)",
    "desc": "Solve 10 tactics puzzles (or 15 minutes). Focus on calculation, not speed.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Chess"
  },
  {
    "name": "Analyze One Game",
    "desc": "Analyze one of your games for 15 minutes (or watch a short analysis).",
    "xp": 130,
    "diff": "medium",
    "type": "daily",
    "d": "Chess"
  },
  {
    "name": "Endgame Basics",
    "desc": "Study one endgame idea for 15 minutes (king activity, pawn endings).",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Chess"
  },
  {
    "name": "Play One Slow Game",
    "desc": "Play one slower game (10+ minutes) and review key moments after.",
    "xp": 150,
    "diff": "hard",
    "type": "timed",
    "d": "Chess"
  },
  {
    "name": "Opening Reps",
    "desc": "Review your opening lines for 10 minutes (or learn one new idea).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Chess"
  },
  {
    "name": "Blunder Check Habit",
    "desc": "In every move today, ask: \u201cWhat is my opponent threatening?\u201d",
    "xp": 100,
    "diff": "medium",
    "type": "streak",
    "d": "Chess"
  },
  {
    "name": "Puzzle Review",
    "desc": "Review 5 puzzles you got wrong and write the correct pattern.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Chess"
  },
  {
    "name": "One Theme",
    "desc": "Study one theme (pins, forks, discovered attacks) for 15 minutes.",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Chess"
  },
  {
    "name": "Annotated Notes",
    "desc": "Write 5 bullets from today\u2019s study: what to do, what to avoid.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Chess"
  },
  {
    "name": "Rest Day: Watch Only",
    "desc": "Rest day: watch one short instructive video (10 minutes) with notes.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Chess"
  },
  {
    "name": "Play 3 Blitz (Optional)",
    "desc": "Play 3 blitz games only if you can stay calm; otherwise skip. Review 1 mistake.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Chess"
  },
  {
    "name": "Endgame Drill",
    "desc": "Do 10 minutes endgame drills (or replay a pawn ending vs engine).",
    "xp": 130,
    "diff": "medium",
    "type": "timed",
    "d": "Chess"
  },
  {
    "name": "Study a Master Game",
    "desc": "Study one master game for 20 minutes and identify 3 key decisions.",
    "xp": 160,
    "diff": "hard",
    "type": "timed",
    "d": "Chess"
  },
  {
    "name": "Rating Goal (SMART)",
    "desc": "Set a 4-week goal: +50 rating or +X tactics accuracy; write weekly plan.",
    "xp": 170,
    "diff": "hard",
    "type": "timed",
    "d": "Chess"
  },
  {
    "name": "Mindset",
    "desc": "After a loss, write one lesson and stop. No tilt queueing.",
    "xp": 100,
    "diff": "medium",
    "type": "streak",
    "d": "Chess"
  },
  {
    "name": "5-Min Reset",
    "desc": "5 minutes quick reset: clear desk + throw trash + put items back.",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Laundry Step",
    "desc": "Do one laundry step: wash, dry, fold, or put away.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Clean One Surface",
    "desc": "Clean one surface (desk, table, sink) for 10 minutes.",
    "xp": 100,
    "diff": "medium",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Organize One Drawer",
    "desc": "Organize one drawer/shelf for 15 minutes. Stop at 15.",
    "xp": 120,
    "diff": "medium",
    "type": "timed",
    "d": "Home & Environment"
  },
  {
    "name": "Phone Files",
    "desc": "Delete 20 photos/files or organize one folder.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Prepare Tomorrow",
    "desc": "Prepare clothes/bag for tomorrow in 5 minutes.",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Meal Setup",
    "desc": "Prep one thing: wash veggies, cook rice, or pack snacks.",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "No Clutter Drop Zone",
    "desc": "Create one \u201cdrop zone\u201d for keys/wallet/ID and use it today.",
    "xp": 80,
    "diff": "easy",
    "type": "streak",
    "d": "Home & Environment"
  },
  {
    "name": "Air + Light",
    "desc": "Open windows for 10 minutes (or just get sunlight in the room).",
    "xp": 70,
    "diff": "easy",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Rest Day: Minimal",
    "desc": "Rest day: only 2-minute tidy. No deep cleaning today.",
    "xp": 50,
    "diff": "easy",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Clean Floor Spot",
    "desc": "Sweep/mop one small area (or vacuum one room).",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Digital Declutter",
    "desc": "Unsubscribe from 5 emails (or clean one inbox label).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Habit Environment",
    "desc": "Set up environment for one habit (water bottle visible, book on desk).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Weekly Reset",
    "desc": "30-minute weekly reset: tidy + plan space for next week.",
    "xp": 160,
    "diff": "hard",
    "type": "timed",
    "d": "Home & Environment"
  },
  {
    "name": "Repair/Replace",
    "desc": "Fix one small thing (tighten screw) or replace a broken item.",
    "xp": 130,
    "diff": "medium",
    "type": "daily",
    "d": "Home & Environment"
  },
  {
    "name": "Quiet Time",
    "desc": "Spend 10 minutes in quiet (prayer, meditation, or silence).",
    "xp": 100,
    "diff": "medium",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Gratitude List",
    "desc": "Write 3 gratitude points with one reason each.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Values Action",
    "desc": "Do one action aligned with your values (help, honesty, patience).",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Forgiveness Practice",
    "desc": "Write a short note: what you can let go of today (no need to send).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Nature Time",
    "desc": "Spend 15 minutes in nature (or on a terrace/near a tree).",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Service",
    "desc": "Do one small act of service at home or for a friend.",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Mindful Meal",
    "desc": "Eat one meal mindfully: slow down and notice taste/texture.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Breathing",
    "desc": "Do 5 minutes breathing practice (4-6 breathing) to calm the nervous system.",
    "xp": 80,
    "diff": "easy",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Reading",
    "desc": "Read 10 minutes of meaningful text (spiritual, philosophy, or ethics).",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Journaling",
    "desc": "Write 8 lines: what matters, what you learned, what you\u2019ll do tomorrow.",
    "xp": 110,
    "diff": "medium",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Rest Day: Light Reflection",
    "desc": "Rest day: only 2 minutes gratitude; keep it gentle.",
    "xp": 60,
    "diff": "easy",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Digital Sabbath (Mini)",
    "desc": "Stay off social media for 3 hours (or one evening block).",
    "xp": 140,
    "diff": "hard",
    "type": "streak",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Compassion",
    "desc": "Do one kind thing for yourself (walk, rest, meal) without guilt.",
    "xp": 90,
    "diff": "easy",
    "type": "daily",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Weekly Review",
    "desc": "20 minutes weekly review: patterns, lessons, and one intention.",
    "xp": 150,
    "diff": "hard",
    "type": "timed",
    "d": "Spiritual & Reflection"
  },
  {
    "name": "Connect",
    "desc": "Have one meaningful conversation (or write a letter you don\u2019t send).",
    "xp": 120,
    "diff": "medium",
    "type": "daily",
    "d": "Spiritual & Reflection"
  }
] as const

  for (const t of taskPool) {
    const domain = allDomains.find((d) => d.name === t.d)
    if (!domain) continue

    await prisma.taskTemplate.upsert({
      where: {
        name_domainId: {
          name: t.name,
          domainId: domain.id,
        },
      },
      update: {
        description: t.desc,
        xpReward: t.xp,
        difficulty: t.diff as any,
        taskType: t.type,
        domainId: domain.id,
      },
      create: {
        name: t.name,
        description: t.desc,
        xpReward: t.xp,
        difficulty: t.diff as any,
        taskType: t.type,
        domainId: domain.id,
      },
    })
  }

  console.log(`🏁 Seed complete. Domains: ${domainsData.length} | Task templates: ${taskPool.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
