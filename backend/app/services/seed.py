"""Rich seed data: verification orgs, 25+ employer companies across many sectors
(IT, banks, telecom, retail/shops, cafes, salons, logistics, construction,
healthcare, NGOs) with detailed vacancies (salary / experience / format), a wide
catalog of free-first courses, scholarships (incl. Presidential), grants, and
lots of volunteering — so the AI roadmap RAG has rich local grounding.

Idempotent: seed_all() skips if data exists unless reset=True.
"""
from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import Opportunity, Organization, University
from app.security.hashing import hash_password

T = date.today()


def _d(days: int) -> date:
    return T + timedelta(days=days)


# --- Verification / education orgs (can confirm achievements) ---
ORGS = [
    {"name": "Ilmhona", "type": "school", "verified": True, "contact": "info@ilmhona.tj",
     "login_email": "org@ilmhona.tj", "password": "ilmhona123", "brand_color": "#16A34A", "logo_text": "Илм", "sphere": "Образование"},
    {"name": "SmartHub", "type": "school", "verified": True, "contact": "hi@smarthub.tj",
     "login_email": "org@smarthub.tj", "password": "smarthub1", "brand_color": "#5B5BD6", "logo_text": "SH", "sphere": "Образование"},
    {"name": "IELTS Center", "type": "school", "verified": True, "contact": "info@ielts.tj",
     "login_email": "org@ielts.tj", "password": "ielts1234", "brand_color": "#B5121B", "logo_text": "IE", "sphere": "Языки"},
    {"name": "American School of Tajikistan", "type": "school", "verified": True, "contact": "adm@ast.tj",
     "login_email": "org@ast.tj", "password": "amschool1", "brand_color": "#2563EB", "logo_text": "AST", "sphere": "Образование"},
    {"name": "Центр профобучения", "type": "school", "verified": True, "contact": "info@profcenter.tj",
     "login_email": "org@profcenter.tj", "password": "profcen12", "brand_color": "#0E7C66", "logo_text": "ПТУ", "sphere": "Профобучение"},
    {"name": "UNICEF Lab", "type": "school", "verified": True, "contact": "lab@unicef.tj",
     "login_email": "org@unicef.tj", "password": "unicef123", "brand_color": "#1CABE2", "logo_text": "UN", "sphere": "Молодёжь"},
    {"name": "Таджикский национальный университет", "type": "university", "verified": True, "contact": "info@tnu.tj",
     "login_email": "org@tnu.tj", "password": "tnu123456", "brand_color": "#1E7A34", "logo_text": "ТНУ", "sphere": "Образование"},
]

# --- Employer companies with vacancies. exp: none|junior|middle|senior; fmt: office|remote|hybrid ---
COMPANIES = [
    # IT / tech
    {"name": "Alif Tech", "sphere": "IT", "brand_color": "#7A2FF6", "logo_text": "alif", "pass": "aliftech1", "v": [
        {"t": "Junior Frontend-разработчик", "exp": "junior", "fmt": "hybrid", "sal": [4000, 6000], "city": ["Dushanbe"],
         "sk": ["javascript", "react", "git"], "desc": "Разработка интерфейсов финтех-продуктов Alif на React.",
         "resp": "Вёрстка и логика компонентов; ревью кода; работа с дизайнерами и бэкендом."},
        {"t": "Middle Backend-разработчик (Python)", "exp": "middle", "fmt": "hybrid", "sal": [8000, 12000], "city": ["Dushanbe"],
         "sk": ["python", "django", "postgresql"], "desc": "Сервисы платёжной платформы.",
         "resp": "API, интеграции, базы данных, оптимизация."}]},
    {"name": "Alif Academy", "sphere": "IT", "brand_color": "#7A2FF6", "logo_text": "alif", "pass": "alifacad1", "v": [
        {"t": "Frontend-стажёр", "exp": "none", "fmt": "office", "sal": [1500, 2000], "city": ["Dushanbe"],
         "sk": ["html", "css", "javascript"], "desc": "Оплачиваемая стажировка 3 месяца.", "resp": "Вёрстка, базовый React, командная работа.", "cat": "internship"},
        {"t": "Контент-стажёр", "exp": "none", "fmt": "office", "sal": [1200, 1500], "city": ["Dushanbe"],
         "sk": ["content", "smm"], "desc": "Соцсети, тексты, базовый дизайн.", "resp": "Ведение страниц, тексты, отчёты.", "cat": "internship"}]},
    {"name": "Zypl.ai", "sphere": "IT", "brand_color": "#111118", "logo_text": "zypl", "pass": "zyplai123", "v": [
        {"t": "Аналитик данных", "exp": "junior", "fmt": "hybrid", "sal": [4500, 7000], "city": ["Dushanbe"],
         "sk": ["sql", "python", "pandas"], "desc": "Модели кредитного скоринга.", "resp": "Подготовка данных, дашборды, гипотезы."},
        {"t": "ML-инженер", "exp": "middle", "fmt": "remote", "sal": [9000, 14000], "city": ["all"],
         "sk": ["python", "ml", "sql"], "desc": "Обучение и деплой моделей.", "resp": "Пайплайны, фичи, метрики, продакшн."}]},
    {"name": "DC Tech", "sphere": "IT", "brand_color": "#2563EB", "logo_text": "DC", "pass": "dctech123", "v": [
        {"t": "QA-инженер (junior)", "exp": "junior", "fmt": "remote", "sal": [3000, 4000], "city": ["Khujand"],
         "sk": ["testing", "qa"], "desc": "Ручное тестирование веб и мобильных приложений.", "resp": "Тест-кейсы, баги, регресс."}]},
    {"name": "Cloud TJ", "sphere": "IT", "brand_color": "#0EA5E9", "logo_text": "cloud", "pass": "cloudtj12", "v": [
        {"t": "Системный администратор", "exp": "junior", "fmt": "office", "sal": [3500, 5000], "city": ["Dushanbe"],
         "sk": ["linux", "network"], "desc": "Поддержка инфраструктуры и серверов.", "resp": "Серверы, сеть, бэкапы, мониторинг."}]},
    # Banking / finance
    {"name": "Spitamen Bank", "sphere": "Финансы", "brand_color": "#0E7C66", "logo_text": "Spit", "pass": "spitamen1", "v": [
        {"t": "Менеджер по продажам", "exp": "junior", "fmt": "office", "sal": [3500, 5500], "city": ["Dushanbe"],
         "sk": ["sales", "communication"], "desc": "Продажа банковских продуктов физлицам.", "resp": "Клиентская база, план продаж, консультации."},
        {"t": "Стажёр в финансах", "exp": "none", "fmt": "office", "sal": [1800, 2200], "city": ["Dushanbe"],
         "sk": ["finance", "excel"], "desc": "Стажировка в финансовом отделе.", "resp": "Отчётность, расчёты, поддержка отдела.", "cat": "internship"}]},
    {"name": "Eskhata Bank", "sphere": "Финансы", "brand_color": "#C8102E", "logo_text": "Esk", "pass": "eskhata12", "v": [
        {"t": "Кассир-операционист", "exp": "none", "fmt": "office", "sal": [2800, 3500], "city": ["Khujand", "Dushanbe"],
         "sk": ["communication", "1c"], "desc": "Обслуживание клиентов в отделении.", "resp": "Кассовые операции, переводы, консультации."},
        {"t": "Кредитный специалист", "exp": "junior", "fmt": "office", "sal": [3500, 5000], "city": ["Khujand"],
         "sk": ["finance", "sales"], "desc": "Оценка и сопровождение кредитов.", "resp": "Заявки, скоринг, работа с клиентами."}]},
    {"name": "Humo", "sphere": "Финансы", "brand_color": "#E11D48", "logo_text": "Humo", "pass": "humo12345", "v": [
        {"t": "Специалист поддержки платежей", "exp": "none", "fmt": "hybrid", "sal": [3000, 4000], "city": ["Dushanbe"],
         "sk": ["communication"], "desc": "Поддержка пользователей платёжной системы.", "resp": "Чаты, звонки, разбор обращений."}]},
    {"name": "Amonatbank", "sphere": "Финансы", "brand_color": "#15803D", "logo_text": "Amo", "pass": "amonat123", "v": [
        {"t": "Бухгалтер", "exp": "junior", "fmt": "office", "sal": [3200, 4800], "city": ["Dushanbe", "Bokhtar"],
         "sk": ["accounting", "1c"], "desc": "Ведение учёта в отделении банка.", "resp": "Проводки, отчётность, 1С."}]},
    # Telecom
    {"name": "MegaFon Tajikistan", "sphere": "Телеком", "brand_color": "#1FA84B", "logo_text": "Mega", "pass": "megafon12", "v": [
        {"t": "Специалист поддержки", "exp": "none", "fmt": "office", "sal": [2800, 3600], "city": ["Dushanbe"],
         "sk": ["communication"], "desc": "Консультирование абонентов по тарифам.", "resp": "Чат и телефон, решение вопросов абонентов."}]},
    {"name": "Tcell", "sphere": "Телеком", "brand_color": "#E6007E", "logo_text": "Tcell", "pass": "tcell1234", "v": [
        {"t": "Промоутер / консультант салона", "exp": "none", "fmt": "office", "sal": [2500, 3500], "city": ["Dushanbe", "Khujand"],
         "sk": ["sales", "communication"], "desc": "Продажи и консультации в салоне связи.", "resp": "Продажи SIM/устройств, помощь клиентам."}]},
    {"name": "Babilon-T", "sphere": "Маркетинг", "brand_color": "#E23B2E", "logo_text": "Bab", "pass": "babilon12", "v": [
        {"t": "SMM-менеджер", "exp": "junior", "fmt": "office", "sal": [3200, 5000], "city": ["Dushanbe"],
         "sk": ["smm", "content"], "desc": "Ведение соцсетей оператора связи.", "resp": "Контент-план, тексты, подрядчики, аналитика."},
        {"t": "Стажёр-маркетолог", "exp": "none", "fmt": "hybrid", "sal": [1200, 1600], "city": ["Dushanbe"],
         "sk": ["marketing"], "desc": "Стажировка в отделе маркетинга.", "resp": "Исследования, контент, поддержка кампаний.", "cat": "internship"}]},
    # Retail / shops
    {"name": "Auchan Tajikistan", "sphere": "Ритейл", "brand_color": "#E2231A", "logo_text": "Auch", "pass": "auchan123", "v": [
        {"t": "Продавец-консультант", "exp": "none", "fmt": "office", "sal": [2500, 3200], "city": ["Dushanbe"],
         "sk": ["communication", "sales"], "desc": "Работа в торговом зале супермаркета.", "resp": "Выкладка, консультации, касса."},
        {"t": "Администратор магазина", "exp": "middle", "fmt": "office", "sal": [4000, 5500], "city": ["Dushanbe"],
         "sk": ["management", "sales"], "desc": "Управление сменой и персоналом.", "resp": "График, дисциплина, отчётность."}]},
    {"name": "Paykar Market", "sphere": "Ритейл", "brand_color": "#F59E0B", "logo_text": "Pay", "pass": "paykar123", "v": [
        {"t": "Кассир", "exp": "none", "fmt": "office", "sal": [2300, 2900], "city": ["Bokhtar", "Kulob"],
         "sk": ["communication"], "desc": "Касса в супермаркете.", "resp": "Расчёты, вежливое обслуживание."}]},
    {"name": "Sello Electronics", "sphere": "Ритейл", "brand_color": "#1D4ED8", "logo_text": "Sello", "pass": "sello1234", "v": [
        {"t": "Менеджер по продажам электроники", "exp": "junior", "fmt": "office", "sal": [3000, 4500], "city": ["Dushanbe", "Khujand"],
         "sk": ["sales", "communication"], "desc": "Продажа техники и аксессуаров.", "resp": "Консультации, продажи, выполнение плана."}]},
    {"name": "Zoodmall", "sphere": "E-commerce", "brand_color": "#22C55E", "logo_text": "Zood", "pass": "zoodmall1", "v": [
        {"t": "Оператор маркетплейса", "exp": "none", "fmt": "remote", "sal": [2800, 3600], "city": ["all"],
         "sk": ["communication", "excel"], "desc": "Обработка заказов и поддержка продавцов.", "resp": "Заказы, карточки товаров, чаты."}]},
    # Food / cafes / restaurants / shops
    {"name": "Merve Restaurant", "sphere": "HoReCa", "brand_color": "#B45309", "logo_text": "Merve", "pass": "merve1234", "v": [
        {"t": "Повар", "exp": "junior", "fmt": "office", "sal": [3000, 4500], "city": ["Khujand"],
         "sk": ["cooking", "chef"], "desc": "Работа на кухне ресторана.", "resp": "Заготовки, блюда по меню, чистота."},
        {"t": "Официант", "exp": "none", "fmt": "office", "sal": [2200, 3200], "city": ["Khujand"],
         "sk": ["communication"], "desc": "Обслуживание гостей.", "resp": "Приём заказов, сервис, расчёт."}]},
    {"name": "Salsa Café", "sphere": "HoReCa", "brand_color": "#DB2777", "logo_text": "Salsa", "pass": "salsa1234", "v": [
        {"t": "Бариста", "exp": "none", "fmt": "office", "sal": [2400, 3400], "city": ["Dushanbe"],
         "sk": ["communication"], "desc": "Кофе и обслуживание гостей кафе.", "resp": "Напитки, касса, чистота бара."}]},
    {"name": "Пекарня Нон", "sphere": "HoReCa", "brand_color": "#CA8A04", "logo_text": "Нон", "pass": "non12345", "v": [
        {"t": "Помощник пекаря", "exp": "none", "fmt": "office", "sal": [2200, 3000], "city": ["Dushanbe"],
         "sk": ["cooking"], "desc": "Выпечка хлеба и сдобы.", "resp": "Замес, выпечка, упаковка."}]},
    # Beauty / services
    {"name": "Салон Зебо", "sphere": "Услуги", "brand_color": "#A21CAF", "logo_text": "Зебо", "pass": "zebo12345", "v": [
        {"t": "Парикмахер-стажёр", "exp": "none", "fmt": "office", "sal": [2000, 3500], "city": ["Dushanbe"],
         "sk": ["beauty"], "desc": "Обучение и работа в салоне красоты.", "resp": "Стрижки, укладки, уход за клиентами.", "cat": "internship"}]},
    {"name": "Барбершоп Усто", "sphere": "Услуги", "brand_color": "#334155", "logo_text": "Усто", "pass": "usto12345", "v": [
        {"t": "Барбер", "exp": "junior", "fmt": "office", "sal": [3000, 6000], "city": ["Dushanbe"],
         "sk": ["beauty"], "desc": "Мужские стрижки и бритьё.", "resp": "Стрижки, борода, сервис клиентов."}]},
    # Logistics / delivery / transport
    {"name": "Express Post", "sphere": "Логистика", "brand_color": "#0891B2", "logo_text": "Exp", "pass": "express12", "v": [
        {"t": "Курьер", "exp": "none", "fmt": "office", "sal": [2500, 4000], "city": ["Dushanbe", "Khujand"],
         "sk": ["delivery"], "desc": "Доставка по городу.", "resp": "Маршруты, доставка, отчётность."}]},
    {"name": "Yandex Go TJ", "sphere": "Логистика", "brand_color": "#FCE000", "logo_text": "Go", "pass": "yandex123", "v": [
        {"t": "Оператор поддержки водителей", "exp": "none", "fmt": "remote", "sal": [3000, 4200], "city": ["all"],
         "sk": ["communication"], "desc": "Поддержка водителей и курьеров.", "resp": "Чаты, звонки, решение проблем."}]},
    # Construction / industry
    {"name": "Бинокор Строй", "sphere": "Строительство", "brand_color": "#EA580C", "logo_text": "Бин", "pass": "binokor12", "v": [
        {"t": "Электромонтажник", "exp": "junior", "fmt": "office", "sal": [3500, 5500], "city": ["Bokhtar", "Dushanbe"],
         "sk": ["electrician", "trades"], "desc": "Монтаж электрики на объектах.", "resp": "Прокладка, монтаж, ТБ."},
        {"t": "Разнорабочий", "exp": "none", "fmt": "office", "sal": [2500, 3500], "city": ["Bokhtar"],
         "sk": ["trades"], "desc": "Помощь на стройплощадке.", "resp": "Погрузка, подсобные работы."}]},
    {"name": "Барки Точик", "sphere": "Энергетика", "brand_color": "#1E40AF", "logo_text": "БТ", "pass": "barki1234", "v": [
        {"t": "Электрик (с группой допуска)", "exp": "middle", "fmt": "office", "sal": [4000, 6000], "city": ["Dushanbe"],
         "sk": ["electrician"], "desc": "Обслуживание электросетей.", "resp": "Ремонт, обслуживание, безопасность."}]},
    # Healthcare
    {"name": "Клиника Шифо", "sphere": "Медицина", "brand_color": "#0D9488", "logo_text": "Шифо", "pass": "shifo1234", "v": [
        {"t": "Медсестра", "exp": "junior", "fmt": "office", "sal": [3000, 4500], "city": ["Dushanbe"],
         "sk": ["medicine"], "desc": "Сестринский уход в клинике.", "resp": "Процедуры, уход, документация."},
        {"t": "Администратор регистратуры", "exp": "none", "fmt": "office", "sal": [2600, 3400], "city": ["Dushanbe"],
         "sk": ["communication"], "desc": "Приём пациентов.", "resp": "Запись, документы, информирование."}]},
    {"name": "Аптека Дил", "sphere": "Медицина", "brand_color": "#059669", "logo_text": "Дил", "pass": "dil12345", "v": [
        {"t": "Фармацевт-консультант", "exp": "junior", "fmt": "office", "sal": [2800, 4000], "city": ["Khujand"],
         "sk": ["medicine"], "desc": "Работа в аптеке.", "resp": "Отпуск лекарств, консультации."}]},
    # Design / media
    {"name": "OSON", "sphere": "Дизайн", "brand_color": "#F7941D", "logo_text": "OSON", "pass": "oson1234", "v": [
        {"t": "Графический дизайнер", "exp": "junior", "fmt": "hybrid", "sal": [3500, 5000], "city": ["Dushanbe"],
         "sk": ["figma", "design"], "desc": "Дизайн для платёжного сервиса.", "resp": "Баннеры, соцсети, презентации, гайдлайны."},
        {"t": "Стажёр-дизайнер", "exp": "none", "fmt": "office", "sal": [1500, 2000], "city": ["Khujand"],
         "sk": ["figma"], "desc": "Стажировка в дизайн-команде.", "resp": "Макеты, ассеты, помощь команде.", "cat": "internship"}]},
    {"name": "Идея Агентство", "sphere": "Маркетинг", "brand_color": "#7C3AED", "logo_text": "Идея", "pass": "ideya1234", "v": [
        {"t": "Видеомонтажёр (Reels)", "exp": "junior", "fmt": "remote", "sal": [3000, 5000], "city": ["all"],
         "sk": ["video", "design"], "desc": "Монтаж коротких видео для брендов.", "resp": "Монтаж, субтитры, тренды."}]},
]

UNIVERSITIES = [
    {"name": "Таджикский технический университет им. Осими", "city": "Dushanbe",
     "programs": [{"name": "Программная инженерия", "min_score": 135, "cost": 5000, "deadline": "2026-07-28", "scholarship": True},
                  {"name": "Энергетика", "min_score": 120, "cost": 4300, "deadline": "2026-07-28", "scholarship": True}],
     "requirements": "ЦНТ по математике и физике"},
    {"name": "Российско-Таджикский (Славянский) университет", "city": "Dushanbe",
     "programs": [{"name": "Информационные системы", "min_score": 140, "cost": 6500, "deadline": "2026-07-30", "scholarship": True},
                  {"name": "Журналистика", "min_score": 110, "cost": 5200, "deadline": "2026-07-30", "scholarship": False}],
     "requirements": "Русский язык, ЦНТ"},
    {"name": "Таджикский национальный университет (ТНУ)", "city": "Dushanbe",
     "programs": [{"name": "Информатика", "min_score": 140, "cost": 4500, "deadline": "2026-07-25", "scholarship": True},
                  {"name": "Экономика", "min_score": 120, "cost": 4000, "deadline": "2026-07-25", "scholarship": True},
                  {"name": "Право", "min_score": 130, "cost": 4200, "deadline": "2026-07-20", "scholarship": False}],
     "requirements": "Сертификат ЦНТ, аттестат"},
    {"name": "Худжандский государственный университет", "city": "Khujand",
     "programs": [{"name": "Математика", "min_score": 115, "cost": 3800, "deadline": "2026-07-22", "scholarship": True},
                  {"name": "Иностранные языки", "min_score": 120, "cost": 3900, "deadline": "2026-07-22", "scholarship": True}],
     "requirements": "ЦНТ"},
    {"name": "Мед. университет им. Абуали ибни Сино", "city": "Dushanbe",
     "programs": [{"name": "Лечебное дело", "min_score": 160, "cost": 7000, "deadline": "2026-07-18", "scholarship": True},
                  {"name": "Стоматология", "min_score": 155, "cost": 7500, "deadline": "2026-07-18", "scholarship": False}],
     "requirements": "ЦНТ по биологии и химии"},
    {"name": "Таджикский гос. университет коммерции", "city": "Dushanbe",
     "programs": [{"name": "Бухгалтерский учёт", "min_score": 110, "cost": 3500, "deadline": "2026-07-26", "scholarship": True},
                  {"name": "Маркетинг", "min_score": 105, "cost": 3600, "deadline": "2026-07-26", "scholarship": False}],
     "requirements": "ЦНТ"},
    {"name": "Таджикский гос. пед. университет им. Айни", "city": "Dushanbe",
     "programs": [{"name": "Информатика и ИКТ", "min_score": 105, "cost": 3200, "deadline": "2026-07-24", "scholarship": True},
                  {"name": "Английский язык", "min_score": 115, "cost": 3300, "deadline": "2026-07-24", "scholarship": True}],
     "requirements": "ЦНТ, аттестат"},
    {"name": "Таджикский аграрный университет им. Шотемур", "city": "Dushanbe",
     "programs": [{"name": "Агрономия", "min_score": 95, "cost": 3000, "deadline": "2026-07-29", "scholarship": True}],
     "requirements": "ЦНТ"},
    {"name": "Хорогский государственный университет", "city": "GBAO",
     "programs": [{"name": "Педагогика", "min_score": 90, "cost": 2800, "deadline": "2026-07-27", "scholarship": True},
                  {"name": "Экология", "min_score": 95, "cost": 2900, "deadline": "2026-07-27", "scholarship": True}],
     "requirements": "ЦНТ; квоты для жителей ГБАО"},
    {"name": "Кулябский гос. университет им. Рудаки", "city": "Kulob",
     "programs": [{"name": "Информатика", "min_score": 100, "cost": 3000, "deadline": "2026-07-25", "scholarship": True},
                  {"name": "История", "min_score": 90, "cost": 2700, "deadline": "2026-07-25", "scholarship": True}],
     "requirements": "ЦНТ"},
    {"name": "Бохтарский гос. университет им. Носира Хусрава", "city": "Bokhtar",
     "programs": [{"name": "Финансы", "min_score": 105, "cost": 3100, "deadline": "2026-07-23", "scholarship": True}],
     "requirements": "ЦНТ"},
    {"name": "Технологический университет Таджикистана", "city": "Dushanbe",
     "programs": [{"name": "Дизайн", "min_score": 100, "cost": 4000, "deadline": "2026-07-31", "scholarship": False},
                  {"name": "Лёгкая промышленность", "min_score": 90, "cost": 3400, "deadline": "2026-07-31", "scholarship": True}],
     "requirements": "ЦНТ; творческий конкурс для дизайна"},
]


def _courses() -> list[dict]:
    """Free-first courses across MANY domains so any roadmap finds local resources."""
    c = [
        ("Курс Web-разработки (HTML/CSS/JS)", "Ilmhona", ["html", "css", "javascript", "frontend"], True, ["Dushanbe"]),
        ("JavaScript и React с нуля", "SmartHub", ["javascript", "react"], False, ["Dushanbe"]),
        ("Python для начинающих", "SmartHub", ["python", "programming"], False, ["Dushanbe", "Khujand"]),
        ("Анализ данных: SQL и Excel", "SmartHub", ["sql", "excel", "data"], False, ["Dushanbe"]),
        ("Английский язык A1–B1 (бесплатно)", "American School of Tajikistan", ["english", "languages"], True, ["Dushanbe"]),
        ("Подготовка к IELTS", "IELTS Center", ["english", "ielts"], False, ["Dushanbe"]),
        ("Графический дизайн (Figma)", "OSON", ["figma", "design", "creative"], True, ["Dushanbe"]),
        ("Adobe Photoshop и Illustrator", "SmartHub", ["design", "photoshop"], False, ["Dushanbe"]),
        ("Видеомонтаж и Reels", "UNICEF Lab", ["video", "content"], True, ["all"]),
        ("Бухгалтерский учёт и 1С", "SmartHub", ["accounting", "1c", "finance"], False, ["Dushanbe"]),
        ("SMM и таргетинг", "SmartHub", ["smm", "marketing"], False, ["Dushanbe"]),
        ("Курс электрика (профтех)", "Центр профобучения", ["electrician", "trades"], True, ["Bokhtar", "Kulob"]),
        ("Кулинарные курсы (повар)", "Центр профобучения", ["cooking", "chef", "trades"], True, ["Khujand"]),
        ("Парикмахер / барбер (профтех)", "Центр профобучения", ["beauty", "trades"], True, ["Dushanbe"]),
        ("Швея и лёгкая промышленность", "Центр профобучения", ["sewing", "trades"], True, ["Khujand"]),
        ("Сварщик (профтех)", "Центр профобучения", ["welding", "trades"], True, ["Bokhtar"]),
        ("Автомеханик: основы (профтех)", "Центр профобучения", ["auto", "trades"], True, ["Dushanbe"]),
        ("Цифровая грамотность", "UNICEF Lab", ["digital", "it"], True, ["all"]),
        ("Основы предпринимательства", "SmartHub", ["business", "entrepreneurship"], True, ["Dushanbe"]),
        ("Медицинская подготовка (ЦНТ био/хим)", "Ilmhona", ["medicine", "biology"], True, ["Dushanbe"]),
        ("Агрономия: основы (онлайн)", "UNICEF Lab", ["agriculture"], True, ["all"]),
        ("Подготовка к ЦНТ (математика)", "Ilmhona", ["math"], True, ["Dushanbe", "Khujand"]),
    ]
    out = []
    for title, org, sk, free, loc in c:
        out.append({"title": title, "organization": org, "category": "vocational",
                    "description": f"Практический курс. {'Бесплатно' if free else 'Платно'}.",
                    "age_min": 14, "location": loc, "is_free": free, "deadline": _d(12), "skills_tags": sk, "sphere": "Образование"})
    return out


def _scholarships() -> list[dict]:
    return [
        {"title": "Стипендия Президента Республики Таджикистан", "organization": "Президент Республики Таджикистан",
         "category": "education", "description": "Престижная государственная стипендия для одарённой молодёжи: покрывает обучение и проживание.",
         "age_min": 16, "location": ["all"], "is_free": True, "deadline": _d(35), "skills_tags": ["leadership"]},
        {"title": "Стипендия Chevening (магистратура, UK)", "organization": "British Council", "category": "education",
         "description": "Полная стипендия на магистратуру за рубежом.", "age_min": 20, "location": ["all"], "is_free": True,
         "deadline": _d(40), "skills_tags": ["english", "leadership"]},
        {"title": "Erasmus+ молодёжные обмены", "organization": "Erasmus+", "category": "education",
         "description": "Обмены и тренинги в ЕС.", "age_min": 16, "location": ["all"], "is_free": True, "deadline": _d(25)},
        {"title": "Школа лидерства для девушек", "organization": "UN Women", "category": "education",
         "description": "Программа развития для девушек 15–18.", "age_min": 15, "age_max": 18, "gender_req": "female",
         "location": ["all"], "is_free": True, "deadline": _d(18)},
        {"title": "Стипендия для студентов из ГБАО", "organization": "Aga Khan Foundation", "category": "education",
         "description": "Поддержка талантливых студентов из отдалённых районов.", "age_min": 17, "location": ["GBAO", "all"],
         "is_free": True, "deadline": _d(30)},
    ]


def _other() -> list[dict]:
    o = []
    # grants
    o += [
        {"title": "Грант молодым предпринимателям (до 30 000 сомони)", "organization": "Sitora Fund", "category": "grant",
         "description": "На запуск бизнеса. Менторство включено.", "age_min": 18, "location": ["all"], "is_free": True,
         "deadline": _d(21), "skills_tags": ["business"]},
        {"title": "Грант UNICEF для социальных проектов", "organization": "UNICEF Lab", "category": "grant",
         "description": "Поддержка инициатив подростков.", "age_min": 15, "location": ["all"], "is_free": True, "deadline": _d(27)},
        {"title": "Микрогрант на стартап (до $2000)", "organization": "UNDP Tajikistan", "category": "grant",
         "description": "Микрогранты на бизнес-идеи.", "age_min": 18, "location": ["all"], "is_free": True, "deadline": _d(33)},
    ]
    # legal / health / child protection
    o += [
        {"title": "Бесплатная юридическая помощь несовершеннолетним", "organization": "Centre for Children's Rights",
         "category": "legal", "description": "Консультации по правам ребёнка.", "age_min": 14, "location": ["all"], "is_free": True},
        {"title": "Юрпомощь семьям трудовых мигрантов", "organization": "IOM Tajikistan", "category": "legal",
         "description": "Документы, права детей мигрантов.", "age_min": 14, "location": ["all"], "for_migrant_child": True, "is_free": True},
        {"title": "Бесплатная медконсультация для подростков", "organization": "Красный Полумесяц", "category": "health",
         "description": "Здоровье подростков, конфиденциально.", "age_min": 14, "location": ["Dushanbe", "Khujand"], "is_free": True},
        {"title": "Психологическая поддержка молодёжи", "organization": "Youth Health Center", "category": "health",
         "description": "Бесплатные консультации психолога.", "age_min": 14, "location": ["all"], "is_free": True},
        {"title": "Центр поддержки детей трудовых мигрантов", "organization": "Centre for Children's Rights",
         "category": "child_protection", "description": "Психосоциальная поддержка и репетиторы.", "age_min": 14, "age_max": 17,
         "location": ["all"], "for_migrant_child": True, "is_free": True},
    ]
    # MANY volunteering
    vols = [
        ("Волонтёрство в Красном Полумесяце", "Красный Полумесяц", ["all"]),
        ("Эко-волонтёрство: посадка деревьев", "Little Earth", ["Dushanbe", "Khujand"]),
        ("Волонтёр в детском доме", "Caritas", ["Dushanbe"]),
        ("Помощь пожилым на дому", "Красный Полумесяц", ["Khujand"]),
        ("Волонтёр на молодёжном фестивале", "UNICEF Lab", ["Dushanbe"]),
        ("Уборка берегов реки", "Little Earth", ["Bokhtar"]),
        ("Репетиторство для младших школьников", "Maktab+", ["all"]),
        ("Волонтёр приюта для животных", "Animal Care TJ", ["Dushanbe"]),
        ("Помощь в библиотеке", "Городская библиотека", ["Kulob"]),
        ("Волонтёр спортивных соревнований", "Минспорта", ["Dushanbe"]),
    ]
    for title, org, loc in vols:
        o.append({"title": title, "organization": org, "category": "volunteer",
                  "description": "Волонтёрская программа для молодёжи. Сертификат участника.",
                  "age_min": 14, "location": loc, "is_free": True, "deadline": _d(9)})
    # youth programs
    o += [
        {"title": "Молодёжный медиа-лагерь", "organization": "UNICEF Lab", "category": "youth_program",
         "description": "Навыки медиа и блогинга.", "age_min": 14, "age_max": 18, "location": ["Dushanbe"], "is_free": True, "deadline": _d(15)},
        {"title": "Хакатон молодёжных проектов", "organization": "SmartHub", "category": "youth_program",
         "description": "Командный хакатон с менторами и призами.", "age_min": 15, "location": ["Dushanbe"], "is_free": True, "deadline": _d(20)},
    ]
    return o


def seed_all(db: Session, reset: bool = False) -> dict:
    if reset:
        for model in (Opportunity, University, Organization):
            db.query(model).delete()
        db.commit()
    if db.query(Organization).count() and not reset:
        return {"skipped": True, "orgs": db.query(Organization).count(),
                "opportunities": db.query(Opportunity).count(),
                "universities": db.query(University).count()}

    org_by_name: dict[str, Organization] = {}
    for od in ORGS:
        org = Organization(name=od["name"], type=od["type"], verified=od["verified"], contact=od["contact"],
                           login_email=od["login_email"], password_hash=hash_password(od["password"]),
                           brand_color=od.get("brand_color"), logo_text=od.get("logo_text"), sphere=od.get("sphere"))
        db.add(org)
        org_by_name[od["name"]] = org
    db.flush()

    company_vacancies: list[dict] = []
    for co in COMPANIES:
        org = Organization(name=co["name"], type="employer", verified=True, contact=co["pass"] + "@co.tj",
                           login_email=f"org@{co['logo_text'].lower()}.tj", password_hash=hash_password(co["pass"]),
                           brand_color=co["brand_color"], logo_text=co["logo_text"], sphere=co["sphere"])
        db.add(org)
        org_by_name[co["name"]] = org
        db.flush()
        for v in co["v"]:
            sal = v.get("sal") or [None, None]
            company_vacancies.append({
                "title": v["t"], "organization": co["name"], "_org_id": org.id, "category": v.get("cat", "employment"),
                "description": v.get("desc"), "responsibilities": v.get("resp"), "age_min": 18,
                "location": v.get("city", ["Dushanbe"]), "is_free": True, "requires_employment": v.get("cat", "employment") == "employment",
                "min_legal_age": 18, "skills_tags": v.get("sk", []), "sphere": co["sphere"],
                "salary_min": sal[0], "salary_max": sal[1], "experience": v.get("exp", "none"),
                "employment_format": v.get("fmt", "office"), "contact_info": org.login_email,
            })

    for ud in UNIVERSITIES:
        db.add(University(name=ud["name"], city=ud["city"], programs=ud["programs"], requirements=ud["requirements"]))

    base = _courses() + _scholarships() + _other()
    # expand free courses/scholarships/volunteer across more cities
    extra: list[dict] = []
    extra_cities = ["Kulob", "Bokhtar", "Istaravshan", "GBAO", "Vahdat", "Konibodom", "Isfara", "Panjakent"]
    templates = [op for op in base if op["category"] in ("vocational", "education", "volunteer") and op.get("is_free")]
    for i, city in enumerate(extra_cities):
        for tpl in templates[:8]:
            t = dict(tpl)
            t["title"] = f"{tpl['title']} — {city}"
            t["location"] = [city]
            t["deadline"] = _d(8 + i * 2)
            extra.append(t)

    count = 0
    for op in base + extra + company_vacancies:
        org = org_by_name.get(op.get("organization"))
        db.add(Opportunity(
            title=op["title"], organization=op.get("organization"),
            org_id=op.get("_org_id") or (org.id if org else None), category=op["category"],
            description=op.get("description"), responsibilities=op.get("responsibilities"),
            age_min=op.get("age_min"), age_max=op.get("age_max"), gender_req=op.get("gender_req", "all"),
            location=op.get("location", ["all"]), for_migrant_child=op.get("for_migrant_child", False),
            min_legal_age=op.get("min_legal_age", 14), requires_employment=op.get("requires_employment", False),
            requires_education=op.get("requires_education"), is_free=op.get("is_free", True),
            salary_min=op.get("salary_min"), salary_max=op.get("salary_max"), experience=op.get("experience"),
            employment_format=op.get("employment_format"), sphere=op.get("sphere"),
            deadline=op.get("deadline"), contact_info=op.get("contact_info"),
            source_url=op.get("source_url"), skills_tags=op.get("skills_tags", []),
        ))
        count += 1
    db.commit()
    return {"skipped": False, "orgs": len(ORGS) + len(COMPANIES), "companies": len(COMPANIES),
            "universities": len(UNIVERSITIES), "opportunities": count}
