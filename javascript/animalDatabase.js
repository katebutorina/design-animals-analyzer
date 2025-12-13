/**
 * animalDatabase.js - База данных животных с поддержкой мультиязычности
 */

// Единая мультиязычная база данных животных
const animalDatabase = [
    {
        en: {
            name: "Turtle",
            instinct: "foundation",
            // В английской версии нет необходимости в родительном падеже и роде
        },
        ru: {
            name: "Черепаха",
            instinct: "основа",
            nameGenitive: "Черепахи", // Форма в родительном падеже
            gender: "feminine", // Женский род
        },
        // Общее описание для обоих языков
        description: {
            en: "You build through steadiness and depth. Your process is grounded, deliberate, and uncompromising in structure. You create solutions that endure — thoughtful, stable, and reinforced at every layer.",
            ru: "Вы создаёте через основательность и глубину. Ваш процесс — вдумчивый, структурный, неизменно устойчивый. Вы формируете решения, которые выдерживают время — продуманные, стабильные и укреплённые на каждом уровне."
        },
        // Метрики одинаковы для всех языков
        metrics: {
            speed: {min: 0, max: 25},
            pattern: {min: 85, max: 100},
            range: {min: 0, max: 20}
        }
    },

    {
        en: {
            name: "Fox",
            instinct: "adaptability",
        },
        ru: {
            name: "Лиса",
            instinct: "гибкость",
            nameGenitive: "Лисы",
            gender: "feminine",
        },
        description: {
            en: "You move quickly and think fluidly. Constraints energize you, and shifting requirements open new paths instead of blocking them. Your design comes from curiosity, versatility, and clever navigation of complexity.",
            ru: "Вы двигаетесь быстро и мыслите гибко. Ограничения вас заряжают, а изменения раскрывают новые ходы. Ваш дизайн рождается из любопытства, универсальности и умения тонко ориентироваться в сложности."
        },
        metrics: {
            speed: {min: 50, max: 75},
            pattern: {min: 10, max: 35},
            range: {min: 35, max: 55}
        }
    },

    {
        en: {
            name: "Hummingbird",
            instinct: "precision",
        },
        ru: {
            name: "Колибри",
            instinct: "точность",
            nameGenitive: "Колибри",
            gender: "feminine",
        },
        description: {
            en: "You operate at micro-scale: clarity in motion, accuracy in detail. Your design approach is refined and intentional, guiding every pixel toward balance and purpose.",
            ru: "Вы работаете в масштабе микро: чистота движения, точность деталей. Ваш подход — утончённый и осознанный, направляющий каждый пиксель к балансу и смыслу."
        },
        metrics: {
            speed: {min: 85, max: 100},
            pattern: {min: 40, max: 60},
            range: {min: 5, max: 20}
        }
    },

    {
        en: {
            name: "Eagle",
            instinct: "vision",
        },
        ru: {
            name: "Орел",
            instinct: "видение",
            nameGenitive: "Орла",
            gender: "neuter", // Средний род
        },
        description: {
            en: "You think in altitude. Your strength is in long-range clarity — seeing patterns, direction, and strategy before form takes shape. You design from perspective, priority, and purpose.",
            ru: "Вы мыслите с высоты. Ваша сила — дальняя ясность: видеть закономерности, направление и стратегию ещё до появления формы. Вы проектируете через перспективу, приоритет и цель."
        },
        metrics: {
            speed: {min: 45, max: 65},
            pattern: {min: 65, max: 80},
            range: {min: 80, max: 100}
        }
    },

    {
        en: {
            name: "Elephant",
            instinct: "wisdom",
        },
        ru: {
            name: "Слон",
            instinct: "мудрость",
            nameGenitive: "Слона",
            gender: "feminine", // Женский род
        },
        description: {
            en: "You design through meaning. Every decision connects to context, history, and intention. Your solutions are substantial, layered, and emotionally grounded.",
            ru: "Вы проектируете через смысл. Каждое решение связано с контекстом, историей и намерением. Ваши решения — основательные, многослойные и эмоционально наполненные."
        },
        metrics: {
            speed: {min: 5, max: 30},
            pattern: {min: 75, max: 90},
            range: {min: 45, max: 65}
        }
    },

    {
        en: {
            name: "Dolphin",
            instinct: "intuition",
        },
        ru: {
            name: "Дельфин",
            instinct: "интуиция",
            nameGenitive: "Дельфина",
            gender: "feminine", // Женский род
        },
        description: {
            en: "You sense patterns before you articulate them. Your design process is fluid, empathetic, and rooted in how people naturally move and feel. You build experiences that resonate instinctively.",
            ru: "Вы ощущаете структуру прежде, чем формулируете её. Ваш процесс — текучий, эмпатичный, основанный на том, как люди естественно двигаются и чувствуют. Вы создаёте опыт, который откликается интуитивно."
        },
        metrics: {
            speed: {min: 60, max: 80},
            pattern: {min: 50, max: 70},
            range: {min: 30, max: 50}
        }
    },

    {
        en: {
            name: "Wolf",
            instinct: "balance",
        },
        ru: {
            name: "Волк",
            instinct: "баланс",
            nameGenitive: "Волка",
            gender: "masculine", // Мужской род
        },
        description: {
            en: "You think systemically. Harmony, rhythm, and interconnection shape your design process. You build ecosystems — coherent, resilient, and aligned toward a shared purpose.",
            ru: "Вы мыслите системно. Гармония, ритм и взаимосвязанность формируют ваш процесс. Вы создаёте экосистемы — согласованные, устойчивые и направленные на общую цель."
        },
        metrics: {
            speed: {min: 40, max: 65},
            pattern: {min: 60, max: 80},
            range: {min: 50, max: 70}
        }
    },

    {
        en: {
            name: "Deer",
            instinct: "elegance",
        },
        ru: {
            name: "Олень",
            instinct: "изящество",
            nameGenitive: "Оленя",
            gender: "neuter", // Средний род
        },
        description: {
            en: "You design through grace and restraint. You sense proportion, rhythm, and visual harmony. Your work feels effortless — quiet in expression, strong in presence.",
            ru: "Вы создаёте через изящество и сдержанность. Вы чувствуете пропорцию, ритм и визуальную гармонию. Ваша работа кажется лёгкой — спокойной в форме, но сильной по содержанию."
        },
        metrics: {
            speed: {min: 25, max: 50},
            pattern: {min: 55, max: 75},
            range: {min: 25, max: 45}
        }
    }
];

// Экспортируем базу данных
window.animalDatabase = animalDatabase;