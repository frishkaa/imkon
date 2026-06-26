"""Domain vocabulary shared across matching, AI, bot and frontend.

IMPORTANT: ``needs`` are stored in the SAME vocabulary as opportunity ``category``
so the matching score (`opp.category in user.needs` -> +15) works directly.
"""
from __future__ import annotations

# --- Cities / regions of Tajikistan ("all" = nationwide opportunity) ---
CITIES = [
    "Dushanbe", "Khujand", "Bokhtar", "Kulob", "GBAO",
    "Istaravshan", "Tursunzoda", "Vahdat", "Konibodom", "Isfara", "Panjakent",
]
LOCATION_ALL = "all"

# --- Age buckets used by registration / bot ---
AGE_BUCKETS = ["14-17", "18-22", "23-27", "28-35"]
ADULT_AGE = 18
WORK_LEGAL_AGE = 18

# --- 18+ status ---
STATUSES = ["studying", "working", "both", "neither"]  # 'neither' == NEET

# --- Opportunity categories (canonical) ---
CATEGORIES = [
    "education", "vocational", "legal", "health", "grant",
    "youth_program", "child_protection", "volunteer",
    "employment", "gig", "task", "internship",
]
# Categories that are work / earning -> hidden from minors (<18) by legal filter
WORK_CATEGORIES = {"employment", "internship", "gig", "task"}

# --- Need options shown in registration / bot (need-centric, multi-select) ---
# Each maps to one or more canonical categories. `min_age` gates work needs to 18+.
NEED_OPTIONS = [
    {"id": "study",     "categories": ["education", "grant"], "icon": "📚",
     "min_age": 14, "label": {"tj": "Таҳсил/стипендия", "ru": "Учёба/стипендии"}},
    {"id": "courses",   "categories": ["vocational", "education"], "icon": "💻",
     "min_age": 14, "label": {"tj": "Курсҳо", "ru": "Курсы"}},
    {"id": "legal",     "categories": ["legal"], "icon": "⚖️",
     "min_age": 14, "label": {"tj": "Кӯмаки ҳуқуқӣ", "ru": "Юрпомощь"}},
    {"id": "health",    "categories": ["health"], "icon": "🏥",
     "min_age": 14, "label": {"tj": "Кӯмаки тиббӣ", "ru": "Медпомощь"}},
    {"id": "volunteer", "categories": ["volunteer", "youth_program"], "icon": "🤝",
     "min_age": 14, "label": {"tj": "Ихтиёрӣ", "ru": "Волонтёрство"}},
    {"id": "grant",     "categories": ["grant"], "icon": "💰",
     "min_age": 14, "label": {"tj": "Грантҳо", "ru": "Гранты"}},
    # --- 18+ ONLY (work) ---
    {"id": "job",       "categories": ["employment"], "icon": "💼",
     "min_age": 18, "label": {"tj": "Кор", "ru": "Работа"}},
    {"id": "tasks",     "categories": ["task", "gig"], "icon": "🧩",
     "min_age": 18, "label": {"tj": "Корҳои иловагӣ", "ru": "Подработки"}},
    {"id": "freelance", "categories": ["gig"], "icon": "🌐",
     "min_age": 18, "label": {"tj": "Фриланс", "ru": "Фриланс"}},
]
NEED_BY_ID = {n["id"]: n for n in NEED_OPTIONS}


def needs_to_categories(need_ids: list[str]) -> list[str]:
    cats: list[str] = []
    for nid in need_ids or []:
        for c in NEED_BY_ID.get(nid, {}).get("categories", []):
            if c not in cats:
                cats.append(c)
    return cats


def need_options_for_age(age: int) -> list[dict]:
    return [n for n in NEED_OPTIONS if age >= n["min_age"]]


# --- Interests for 14-17 (no work questions allowed) ---
INTERESTS = [
    {"id": "it",        "icon": "💻", "label": {"tj": "IT", "ru": "IT"}},
    {"id": "creative",  "icon": "🎨", "label": {"tj": "Эҷодӣ", "ru": "Творчество"}},
    {"id": "science",   "icon": "🔬", "label": {"tj": "Илм", "ru": "Наука"}},
    {"id": "trades",    "icon": "🔧", "label": {"tj": "Касбҳо", "ru": "Ремёсла"}},
    {"id": "languages", "icon": "🗣️", "label": {"tj": "Забонҳо", "ru": "Языки"}},
    {"id": "business",  "icon": "📈", "label": {"tj": "Бизнес", "ru": "Бизнес"}},
    {"id": "medicine",  "icon": "🩺", "label": {"tj": "Тиб", "ru": "Медицина"}},
    {"id": "sport",     "icon": "⚽", "label": {"tj": "Варзиш", "ru": "Спорт"}},
]

# --- Verification / trust weights (growth-based, NOT origin/prestige) ---
TRUST_WEIGHTS = {
    "course": 10,
    "job": 20,
    "employment": 20,
    "degree": 25,
    "project": 10,   # +5..+15 by score, see services/trust.py
    "test": 5,
    "language": 5,
}

CLAIM_TYPES = ["course", "employment", "degree", "project", "test", "language"]

# --- Languages offered in UI ---
LANGUAGES = ["tajik", "russian", "both"]

# --- "Кто ты сейчас?" status options (drives need filtering) ---
STATUS_OPTIONS = [
    {"id": "school",  "icon": "book", "label": {"tj": "Хонанда", "ru": "Школьник", "en": "School student"},
     "sub": {"tj": "Дар мактаб, синфи 9–11", "ru": "Учусь в школе, 9–11 класс", "en": "In school, grades 9–11"}},
    {"id": "student", "icon": "cap",  "label": {"tj": "Донишҷӯ", "ru": "Студент", "en": "Student"},
     "sub": {"tj": "Коллеҷ ё донишгоҳ", "ru": "Колледж или университет", "en": "College or university"}},
    {"id": "grad",    "icon": "work", "label": {"tj": "Хатмкарда", "ru": "Выпускник", "en": "Graduate"},
     "sub": {"tj": "Таҳсилро тамом кардам, кор меҷӯям", "ru": "Закончил учёбу, ищу работу", "en": "Finished studies, job-seeking"}},
    {"id": "working", "icon": "up",   "label": {"tj": "Кор мекунам", "ru": "Работаю", "en": "Working"},
     "sub": {"tj": "Рушд ё иваз кардани касб", "ru": "Хочу расти или сменить профессию", "en": "Want to grow or switch careers"}},
]

# --- Education levels ---
EDUCATION_LEVELS = [
    {"id": "school",   "label": {"tj": "Мактаб", "ru": "Школа", "en": "School"}},
    {"id": "college",  "label": {"tj": "Коллеҷ", "ru": "Колледж", "en": "College"}},
    {"id": "bachelor", "label": {"tj": "Бакалавр", "ru": "Бакалавриат", "en": "Bachelor's"}},
    {"id": "master",   "label": {"tj": "Магистр", "ru": "Магистратура", "en": "Master's"}},
    {"id": "none",     "label": {"tj": "Ҳоло не", "ru": "Пока нет", "en": "None yet"}},
]

# --- "В чём разбираешься" domains -> concrete technologies/skills ---
SKILL_DOMAINS = [
    {"id": "programming", "icon": "code", "label": {"tj": "Барномасозӣ", "ru": "Программирование", "en": "Programming"},
     "tech": ["Python", "JavaScript", "TypeScript", "C++", "C#", "Java", "Go", "PHP", "Kotlin", "Swift", "SQL", "React", "Node.js", "Django", "Flutter"]},
    {"id": "design", "icon": "spark", "label": {"tj": "Дизайн", "ru": "Дизайн", "en": "Design"},
     "tech": ["Figma", "Photoshop", "Illustrator", "After Effects", "UI/UX", "Брендинг", "3D / Blender"]},
    {"id": "marketing", "icon": "up", "label": {"tj": "Маркетинг", "ru": "Маркетинг", "en": "Marketing"},
     "tech": ["SMM", "SEO", "Таргетинг", "Копирайтинг", "Email-маркетинг", "Аналитика", "Контент"]},
    {"id": "data", "icon": "server", "label": {"tj": "Маълумот ва таҳлил", "ru": "Данные и аналитика", "en": "Data & Analytics"},
     "tech": ["SQL", "Python (pandas)", "Excel", "Power BI", "Tableau", "Статистика", "ML"]},
    {"id": "business", "icon": "coin", "label": {"tj": "Бизнес", "ru": "Бизнес и финансы", "en": "Business & Finance"},
     "tech": ["Бухучёт / 1С", "Финансы", "Продажи", "Менеджмент", "Предпринимательство"]},
    {"id": "content", "icon": "globe", "label": {"tj": "Контент ва медиа", "ru": "Контент и медиа", "en": "Content & Media"},
     "tech": ["Видеомонтаж", "Фото", "Reels / TikTok", "Подкасты", "Сторителлинг", "Блогинг"]},
    {"id": "languages", "icon": "book", "label": {"tj": "Забонҳо", "ru": "Языки", "en": "Languages"},
     "tech": ["Преподавание", "Перевод", "Копирайтинг"]},
    {"id": "trades", "icon": "puzzle", "label": {"tj": "Касбҳои амалӣ", "ru": "Рабочие профессии", "en": "Trades"},
     "tech": ["Электрик", "Повар", "Швея", "Сварщик", "Авторемонт", "Строительство"]},
]
DOMAIN_BY_ID = {d["id"]: d for d in SKILL_DOMAINS}

# --- Spoken languages + proficiency levels ---
SPOKEN_LANGUAGES = [
    {"id": "tajik",   "label": {"tj": "Тоҷикӣ", "ru": "Таджикский", "en": "Tajik"}},
    {"id": "russian", "label": {"tj": "Русӣ", "ru": "Русский", "en": "Russian"}},
    {"id": "english", "label": {"tj": "Англисӣ", "ru": "Английский", "en": "English"}},
    {"id": "uzbek",   "label": {"tj": "Ӯзбекӣ", "ru": "Узбекский", "en": "Uzbek"}},
    {"id": "persian", "label": {"tj": "Форсӣ", "ru": "Персидский", "en": "Persian"}},
    {"id": "arabic",  "label": {"tj": "Арабӣ", "ru": "Арабский", "en": "Arabic"}},
    {"id": "turkish", "label": {"tj": "Туркӣ", "ru": "Турецкий", "en": "Turkish"}},
    {"id": "chinese", "label": {"tj": "Хитоӣ", "ru": "Китайский", "en": "Chinese"}},
    {"id": "german",  "label": {"tj": "Олмонӣ", "ru": "Немецкий", "en": "German"}},
]
LANG_LEVELS = [
    {"id": "native", "label": {"tj": "Модарӣ", "ru": "Родной", "en": "Native"}},
    {"id": "fluent", "label": {"tj": "Озод", "ru": "Свободно", "en": "Fluent"}},
    {"id": "B2", "label": {"tj": "B2", "ru": "B2", "en": "B2"}},
    {"id": "B1", "label": {"tj": "B1", "ru": "B1", "en": "B1"}},
    {"id": "A2", "label": {"tj": "A2", "ru": "A2", "en": "A2"}},
    {"id": "A1", "label": {"tj": "A1", "ru": "A1", "en": "A1"}},
]

# --- Need option icons (Lucide ids, matches the design icon set) ---
NEED_ICONS = {
    "study": "book", "courses": "code", "legal": "scale", "health": "cross",
    "volunteer": "hands", "grant": "coin", "job": "work", "tasks": "puzzle", "freelance": "globe",
}
