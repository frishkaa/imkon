"""IMKON — service-deserts dashboard for government & donors.

READ-ONLY and ANONYMIZED: uses only aggregated counts and the anonymized
dimensions logged in matches_log (city / category / age_bucket). NO PII
(no names, phones, emails) is ever read or displayed.

Run:  streamlit run dashboard/streamlit_app.py
"""
from __future__ import annotations

import os
import pathlib

import pandas as pd
import streamlit as st
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

ROOT = pathlib.Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")
DB_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://imkon:imkon@localhost:5433/imkon")

# Approx coordinates for the Tajik cities we seed (for the demand map).
CITY_COORDS = {
    "Dushanbe": (38.5598, 68.7870), "Khujand": (40.2833, 69.6228),
    "Bokhtar": (37.8364, 68.7800), "Kulob": (37.9090, 69.7800),
    "GBAO": (37.4900, 71.5500), "Istaravshan": (39.9100, 69.0100),
    "Tursunzoda": (38.5100, 68.2300), "Vahdat": (38.5530, 68.9760),
    "Konibodom": (40.2900, 70.4300), "Isfara": (40.1300, 70.6300),
    "Panjakent": (39.4950, 67.6100),
}

engine = create_engine(DB_URL, pool_pre_ping=True)


@st.cache_data(ttl=30)
def load() -> dict:
    with engine.connect() as c:
        users = c.execute(text("select count(*) from user_profiles")).scalar() or 0
        minors = c.execute(text("select count(*) from user_profiles where age < 18")).scalar() or 0
        opps = c.execute(text("select count(*) from opportunities where is_active")).scalar() or 0
        ach = c.execute(text("select count(*) from achievements where verified")).scalar() or 0
        apps = c.execute(text("select count(*) from applications")).scalar() or 0

        # demand = anonymized match-log rows per city/category (+ age bucket)
        demand = pd.read_sql(text(
            "select coalesce(city,'—') city, coalesce(category,'—') category, "
            "coalesce(age_bucket,'—') age_bucket, count(*) demand "
            "from matches_log group by 1,2,3"), c)
        # users per city (count only — no PII)
        users_city = pd.read_sql(text(
            "select coalesce(city,'—') city, count(*) users from user_profiles group by 1"), c)
        # supply = active opportunities; explode location array to city rows
        supply = pd.read_sql(text(
            "select category, unnest(location) city from opportunities where is_active"), c)
    return {"kpi": {"users": users, "minors": minors, "opps": opps, "ach": ach, "apps": apps},
            "demand": demand, "users_city": users_city, "supply": supply}


st.set_page_config(page_title="IMKON · Карта сервисных пустынь", layout="wide")
st.title("IMKON — карта сервисных пустынь")
st.caption("Анонимизированные агрегаты для государства и доноров. Без персональных данных.")

try:
    d = load()
except Exception as exc:  # pragma: no cover
    st.error(f"Нет соединения с БД: {exc}")
    st.stop()

k = d["kpi"]
c1, c2, c3, c4, c5 = st.columns(5)
c1.metric("Пользователей", k["users"])
c2.metric("из них 14–17", k["minors"])
c3.metric("Активных возможностей", k["opps"])
c4.metric("Подтв. достижений", k["ach"])
c5.metric("Откликов", k["apps"])

st.divider()

# --- Service desert: demand vs supply by city ---
st.subheader("Спрос против предложения по городам")
demand = d["demand"]
supply = d["supply"]
if demand.empty:
    st.info("Пока нет данных спроса. Откройте подборки в приложении (или запустите синтетику через POST /dev/synthetic).")
else:
    dem_city = demand.groupby("city", as_index=False)["demand"].sum()
    sup_city = supply.groupby("city", as_index=False).size().rename(columns={"size": "supply"})
    merged = dem_city.merge(sup_city, on="city", how="outer").fillna(0)
    merged = merged[merged["city"] != "all"]
    merged["gap"] = merged["demand"] / (merged["supply"] + 1)
    merged = merged.sort_values("gap", ascending=False)

    left, right = st.columns([3, 2])
    with left:
        st.bar_chart(merged.set_index("city")[["demand", "supply"]])
    with right:
        st.markdown("**Города с наибольшим дефицитом (desert score)**")
        st.dataframe(merged[["city", "demand", "supply", "gap"]].round(2),
                     hide_index=True, use_container_width=True)

    # demand map
    map_df = merged.copy()
    map_df["lat"] = map_df["city"].map(lambda c: CITY_COORDS.get(c, (None, None))[0])
    map_df["lon"] = map_df["city"].map(lambda c: CITY_COORDS.get(c, (None, None))[1])
    map_df = map_df.dropna(subset=["lat", "lon"])
    if not map_df.empty:
        st.subheader("Карта спроса")
        st.map(map_df.rename(columns={"demand": "size"})[["lat", "lon"]])

    st.divider()
    st.subheader("Дефицит по направлениям (город × категория)")
    pivot = demand.groupby(["city", "category"], as_index=False)["demand"].sum()
    sup_cc = supply.groupby(["city", "category"], as_index=False).size().rename(columns={"size": "supply"})
    cc = pivot.merge(sup_cc, on=["city", "category"], how="left").fillna({"supply": 0})
    cc["gap"] = (cc["demand"] / (cc["supply"] + 1)).round(2)
    cc = cc[cc["city"] != "all"].sort_values("gap", ascending=False).head(20)
    st.dataframe(cc, hide_index=True, use_container_width=True)

    st.subheader("Распределение спроса по возрастным группам")
    age = demand.groupby("age_bucket", as_index=False)["demand"].sum()
    st.bar_chart(age.set_index("age_bucket"))
