"""IMKON Telegram bot (PRIMARY channel scaffold).

Runs only if TELEGRAM_BOT_TOKEN is set in .env — otherwise it prints how to
enable it and exits (so the rest of the system runs without a token).

Flow (need-centric):
  /start -> language -> age bucket -> city -> needs (14-17 vs 18+ branches)
         -> parents abroad? -> register via API -> show top-5 matches
         -> "Построить мой путь" -> ask goal -> roadmap -> link to web map.

Enforces: age 14-17 NEVER sees work options/questions (server enforces too).

Run:  python telegram_bot/bot.py
"""
from __future__ import annotations

import os
import pathlib
import sys

import httpx
from dotenv import load_dotenv

ROOT = pathlib.Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
API = os.getenv("API_BASE_URL", "http://localhost:8000").rstrip("/")
WEB = os.getenv("PUBLIC_BASE_URL", "http://localhost:5173").rstrip("/")

if not TOKEN:
    print("TELEGRAM_BOT_TOKEN is not set in .env — bot stays OFF (this is expected).")
    print("To enable: put your BotFather token in .env as TELEGRAM_BOT_TOKEN=... and re-run.")
    sys.exit(0)

from telegram import (  # noqa: E402
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Update,
)
from telegram.ext import (  # noqa: E402
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

AGE_BUCKETS = [("14-17", 16), ("18-22", 20), ("23-27", 25), ("28-35", 31)]


def kb(rows):
    return InlineKeyboardMarkup([[InlineKeyboardButton(t, callback_data=d) for t, d in row] for row in rows])


async def api_get(path):
    async with httpx.AsyncClient() as c:
        r = await c.get(f"{API}{path}", timeout=30)
        r.raise_for_status()
        return r.json()


async def api_post(path, body, token=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    async with httpx.AsyncClient() as c:
        r = await c.post(f"{API}{path}", json=body, headers=headers, timeout=60)
        r.raise_for_status()
        return r.json()


async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    ctx.user_data.clear()
    await update.message.reply_text(
        "Салом! 👋 Имкон — платформаи имкониятҳо.\nЗабонро интихоб кунед / Выберите язык:",
        reply_markup=kb([[("Тоҷикӣ", "lang:tajik"), ("Русский", "lang:russian")]]),
    )


async def on_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    data = q.data
    ud = ctx.user_data

    if data.startswith("lang:"):
        ud["lang"] = data.split(":")[1]
        await q.edit_message_text("Сколько тебе лет?",
            reply_markup=kb([[(b, f"age:{a}")] for b, a in AGE_BUCKETS]))

    elif data.startswith("age:"):
        ud["age"] = int(data.split(":")[1])
        meta = await api_get("/meta")
        cities = [c for c in meta["cities"] if c != "all"][:9]
        ud["_cities"] = cities
        rows = [[(c, f"city:{i}")] for i, c in enumerate(cities)]
        await q.edit_message_text("Где ты живёшь?", reply_markup=kb(rows))

    elif data.startswith("city:"):
        ud["city"] = ud["_cities"][int(data.split(":")[1])]
        meta = await api_get(f"/meta?age={ud['age']}")
        ud["_needs_meta"] = meta["needs"]
        ud["needs"] = []
        await q.edit_message_text(_need_text(ud), reply_markup=_need_kb(ud))

    elif data.startswith("needtoggle:"):
        nid = data.split(":")[1]
        if nid in ud["needs"]:
            ud["needs"].remove(nid)
        else:
            ud["needs"].append(nid)
        await q.edit_message_reply_markup(reply_markup=_need_kb(ud))

    elif data == "needdone":
        if not ud.get("needs"):
            await q.answer("Выбери хотя бы одну потребность", show_alert=True)
            return
        await q.edit_message_text("Родители работают за рубежом?",
            reply_markup=kb([[("Да", "parents:1"), ("Нет", "parents:0")]]))

    elif data.startswith("parents:"):
        ud["is_migrant_child"] = data.split(":")[1] == "1"
        await _register_and_match(q, ud)

    elif data == "buildpath":
        ud["awaiting_goal"] = True
        await q.message.reply_text("Кем ты хочешь стать? Напиши свою цель (например: веб-разработчиком).")


def _need_text(ud):
    return "Что тебе сейчас нужно? (можно несколько, потом нажми «Готово»)" + \
        ("\n🛡️ Тебе ещё нет 18 — раздел работы скрыт для твоей безопасности." if ud["age"] < 18 else "")


def _need_kb(ud):
    rows = []
    for n in ud["_needs_meta"]:
        chosen = "✅ " if n["id"] in ud["needs"] else ""
        label = n["label"]["tj"] if ud.get("lang") == "tajik" else n["label"]["ru"]
        rows.append([(f"{chosen}{n['icon']} {label}", f"needtoggle:{n['id']}")])
    rows.append([("Готово ➡️", "needdone")])
    return kb(rows)


async def _register_and_match(q, ud):
    reg = await api_post("/users", {
        "age": ud["age"], "city": ud["city"], "needs": ud["needs"],
        "is_migrant_child": ud.get("is_migrant_child", False),
        "consent_given": True, "language_pref": ud.get("lang", "russian"),
        "telegram_id": str(q.message.chat_id),
    })
    ud["token"] = reg["token"]
    ud["user_id"] = reg["user"]["id"]
    matches = (await api_get_auth(f"/users/{ud['user_id']}/matches?limit=5", ud["token"]))["matches"]
    if not matches:
        await q.edit_message_text("Пока нет подходящих возможностей. Попробуй изменить потребности через /start.")
        return
    lines = ["Вот что мы нашли для тебя:\n"]
    for i, o in enumerate(matches, 1):
        free = "бесплатно" if o.get("is_free") else "платно"
        lines.append(f"{i}. {o['title']} — {o.get('organization','')} ({free})")
    await q.edit_message_text("\n".join(lines),
        reply_markup=kb([[("🧭 Построить мой путь", "buildpath")]]))


async def api_get_auth(path, token):
    async with httpx.AsyncClient() as c:
        r = await c.get(f"{API}{path}", headers={"Authorization": f"Bearer {token}"}, timeout=30)
        r.raise_for_status()
        return r.json()


async def on_text(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    ud = ctx.user_data
    if ud.get("awaiting_goal") and ud.get("token"):
        ud["awaiting_goal"] = False
        await update.message.reply_text("Строю твой путь… ⏳")
        rm = await api_post("/ai/roadmap",
            {"user_id": ud["user_id"], "goal_text": update.message.text}, token=ud["token"])
        link = f"{WEB}/path"
        steps = "\n".join(f"{s['order']}. {s['label']}" for s in rm.get("steps", []))
        await update.message.reply_text(
            f"🧭 Твой путь «{rm.get('goal')}»:\n\n{steps}\n\nОткрой карту-путь: {link}")
    else:
        await update.message.reply_text("Нажми /start, чтобы начать.")


def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(on_callback))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, on_text))
    print(f"IMKON bot running. API={API}")
    app.run_polling()


if __name__ == "__main__":
    main()
