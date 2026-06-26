# Button / action wiring checklist (A.5) — v2 design

Every interactive element + the backend call it triggers. ✅ = wired & exercised
(build passes, backend endpoints live-tested, onClick audit: 0 dead buttons).
UI is trilingual **EN / RU / TJ** — the language pill switches everything live.

## Welcome (`/`)
- ✅ EN / RU / TJ language pills (live)
- ✅ «Создать аккаунт» → `/register` · «Войти через Telegram» → register
- ✅ «Войти» → `/login` · «Вход для организации» → `/org`

## Login (`/login`)
- ✅ Войти → `POST /auth/login` → `/home` · «Создать аккаунт» → `/register`

## Register wizard (`/register`) — account + **10 questions**
- ✅ Account: name + email + password (≥6) → validated
- ✅ Step 1 status (school/student/grad/working) · 2 age · 3 city · 4 needs (age-gated)
- ✅ 5 parents abroad · 6 education level
- ✅ **7 domains** ("в чём разбираешься": programming/design/data/…) → drives…
- ✅ **8 tech skills** (chips from chosen domains incl. C++/Python/Figma + custom add)
- ✅ **9 spoken languages + level** (Tajik/Russian/English/… × native…A1)
- ✅ 10 bio + «✨ Улучшить с AI» → `POST /ai/improve`
- ✅ Finish → `POST /users` (full structured profile) → `/home`

## Home (`/home`)
- ✅ Lang pills · 🔔 → `/notifications`
- ✅ AI hero + quick chips → `/ai`
- ✅ Continue-path card (live roadmap progress) → `/path`
- ✅ Stats (trust / steps / applications)
- ✅ Filter pills (Все/Стипендии/Курсы/Работа) · match cards → `/opp/:id` · «Показать ещё»

## Opportunity detail (`/opp/:id`)
- ✅ Loads `GET /opportunities/{id}` (with company logo) · «Подать заявку» → `POST /applications`

## AI chat (`/ai`)
- ✅ Send / quick chips → `POST /ai/dialog` (typing animation); on done → «Открыть карту пути» → `/path`

## Path / Роҳи Ман (`/path`)
- ✅ Empty: goal + «Построить мой путь» → `POST /ai/roadmap`
- ✅ **Map ⇄ Graph** toggle: Duolingo winding path + draggable/zoomable graph
- ✅ Tap node → sheet: «Пройти курс» (→ `/opp/:id`) / goal «Подать заявку» / locked
- ✅ «Подтвердить шаг» → org picker (`GET /organizations`) → `POST /verifications`
- ✅ «Поделиться путём» → `/share` · «Изменить цель» (rebuild)

## Profile (`/profile`) — **résumé style**
- ✅ Résumé header (avatar, name, education, bio) + Trust passport
- ✅ Domains / Skills (verified ✓) / Languages+levels / Verified experience (logos) / mini-path
- ✅ «✨ Резюме от AI» → `POST /ai/resume` → sheet → «✨ Улучшить» (`/ai/improve`) + «Резюме PDF»
- ✅ «Поделиться» → `/share` · «Резюме PDF» → share+`GET /p/{token}/resume.pdf` · «Добавить достижение» → `/path`

## Share (`/share`)
- ✅ `POST /profiles/{id}/share` · Копировать · Предпросмотр (`/p/:token`) · PDF · Отозвать (`DELETE`)

## Public profile (`/p/:token`) — employer view (résumé)
- ✅ `GET /p/{token}` (badge, trust, bio, skills, verified+logos, read-only roadmap) · Пригласить · PDF

## Work (`/work`) — 18+ (minors see protection note)
- ✅ Tabs: Вакансии · Стажировки · Фриланс · **Компании** · Мои заявки
- ✅ Job cards with **company logos** + apply (`POST /applications`)
- ✅ **Companies tab**: `GET /companies` → logo + grouped vacancies, apply each
- ✅ «+ Создать гиг» → `/work/create` · application status badges

## Create gig (`/work/create`)
- ✅ Form + «✨ AI поможет с описанием» → `POST /ai/text` / `POST /ai/improve` · Опубликовать → `POST /gigs`

## Universities (`/uni`)
- ✅ `GET /universities` (logos) · city + scholarship filters · expand → programs

## Org cabinet (`/org`) — second window
- ✅ Org login (`POST /auth/org-login`, prefilled Ilmhona) · queue (`GET /org/{id}/verifications`)
- ✅ Подтвердить / Отклонить → `POST /verifications/{id}/resolve` → achievement + trust + step ✅

## Notifications (`/notifications`)
- ✅ `GET /notifications` + mark read

## AI quality (benchmarked)
- ✅ 10-profession judge-panel benchmark: relevance 4.1, ordering 4.3, final-job 4.2, overall 3.5/5
- ✅ Prompt hardened (relevance gate, free-first, local licensing) → off-topic injections removed, verified
