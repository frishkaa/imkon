# Деплой Имкон (публичный тест для жюри)

**Важно:** Netlify хостит только фронтенд (статику). Бэкенд (FastAPI + Postgres +
DeepSeek) нужно поднять отдельно — иначе регистрация/AI/вакансии не работают.

Схема: **Frontend → Netlify** · **Backend + Postgres → Render** (бесплатно).

---

## 0. Залить код на GitHub
`api.txt` и `.env` не уйдут (они в .gitignore) — секреты задаём через переменные окружения хостинга.
```bash
cd c:/Users/AAA/Desktop/Imkon
git add -A && git commit -m "deploy ready"
# создай пустой репозиторий на github.com, затем:
git remote add origin https://github.com/<ты>/imkon.git
git branch -M main && git push -u origin main
```

## 1. Сгенерируй ключ шифрования (понадобится на шаге 2)
```bash
python -c "import secrets,base64;print(base64.b64encode(secrets.token_bytes(32)).decode())"
```
Скопируй вывод — это `ENCRYPTION_KEY`.

## 2. Бэкенд на Render
1. render.com → **New → Blueprint** → выбери свой GitHub-репозиторий (там лежит `render.yaml`).
2. Render создаст **Postgres** (free) + **web-сервис** `imkon-api`. Заполни секреты:
   - `DEEPSEEK_API_KEY` = твой ключ из `api.txt` (строка `sk-…`)
   - `ENCRYPTION_KEY` = значение из шага 1
   - `PUBLIC_BASE_URL` и `CORS_ORIGINS` пока оставь пустыми (заполним на шаге 4)
3. **Create** → дождись деплоя. База засеется автоматически при старте (29 компаний, 151 возможность).
4. Скопируй URL сервиса, напр. `https://imkon-api.onrender.com`. Проверь: открой `…/health` — должно быть `{"status":"ok",…}`.

## 3. Фронтенд на Netlify
1. netlify.com → **Add new site → Import from GitHub** → твой репозиторий.
2. Настройки сборки подхватятся из `netlify.toml` (base `frontend`, build `npm run build`, publish `dist`). Ничего менять не надо.
3. **Site settings → Environment variables** добавь:
   - `VITE_API_BASE` = URL бэкенда с шага 2 (напр. `https://imkon-api.onrender.com`)
4. **Deploys → Trigger deploy** (чтобы переменная попала в сборку). Получишь URL, напр. `https://imkon.netlify.app`.

## 4. Связать фронт и бэк (CORS)
На Render у `imkon-api` → **Environment** добавь/заполни:
- `PUBLIC_BASE_URL` = `https://imkon.netlify.app`  (чтобы ссылки «поделиться профилем» вели на фронт)
- `CORS_ORIGINS` = `https://imkon.netlify.app`
Сохрани → сервис передеплоится.

## 5. Готово — тестируем
Открой `https://imkon.netlify.app`:
- Создать аккаунт → 10 шагов → лента.
- «Мой путь» → построить роадмап (AI).
- «Работа» → фильтры, вакансии, отклик.
- Кабинет организации (`/org`, демо: `org@ilmhona.tj` / `ilmhona123`) — подтвердить достижение во втором окне.

---

## ⚠️ Что учесть для жюри
- **Холодный старт:** бесплатный Render «засыпает» после ~15 мин простоя — первый запрос будет грузиться 30–50 сек. Перед показом «разбуди» бэкенд, открыв `…/health`. (Платный план $7/мес убирает сон.)
- **DeepSeek-ключ:** в этом демо AI-запросы идут через твой ключ — каждый тестер тратит твой баланс. На время демо ок; следи за расходом. (В проде по ТЗ — локальный Qwen, `LLM_PROVIDER=local`.)
- **Данные синтетические**, реальных людей нет — приватность не нарушается.

## Альтернативы Render
Railway / Fly.io — так же: Python web-сервис (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`,
rootDir `backend`) + managed Postgres + те же env-переменные.
