import { useSession } from "../store";
import type { Opportunity } from "../types";
import { Icon } from "./icons";

const CAT: Record<string, { icon: string; ru: string; tg: string; en: string }> = {
  education: { icon: "book", ru: "Стипендия", tg: "Стипендия", en: "Scholarship" },
  grant: { icon: "coin", ru: "Грант", tg: "Грант", en: "Grant" },
  vocational: { icon: "code", ru: "Курс", tg: "Курс", en: "Course" },
  legal: { icon: "scale", ru: "Юрпомощь", tg: "Ҳуқуқӣ", en: "Legal" },
  health: { icon: "cross", ru: "Здоровье", tg: "Тиб", en: "Health" },
  volunteer: { icon: "hands", ru: "Волонтёрство", tg: "Волонтёрӣ", en: "Volunteering" },
  youth_program: { icon: "spark", ru: "Программа", tg: "Барнома", en: "Program" },
  child_protection: { icon: "hands", ru: "Поддержка", tg: "Дастгирӣ", en: "Support" },
  employment: { icon: "work", ru: "Работа", tg: "Кор", en: "Job" },
  internship: { icon: "cap", ru: "Стажировка", tg: "Коромӯзӣ", en: "Internship" },
  gig: { icon: "globe", ru: "Фриланс", tg: "Фриланс", en: "Freelance" },
  task: { icon: "puzzle", ru: "Подработка", tg: "Кори иловагӣ", en: "Gig" },
};

export function OppCard({ opp, onClick }: { opp: Opportunity; onClick?: () => void }) {
  const { t, lang } = useSession();
  const c = CAT[opp.category] || { icon: "spark", ru: opp.category, tg: opp.category, en: opp.category };
  const cat = lang === "tg" ? c.tg : lang === "en" ? c.en : c.ru;
  const soon = opp.deadline ? Math.round((new Date(opp.deadline).getTime() - Date.now()) / 86400000) : null;
  return (
    <button className="im-card im-job im-lift" style={{ width: "100%", textAlign: "left", marginBottom: 11 }} onClick={onClick}>
      <div className="im-opp">
        <div className="icon"><Icon name={c.icon} size={20} color="var(--teal)" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="im-spread">
            <span className="cat">{cat}</span>
            {soon !== null && soon >= 0 && soon < 14 && <span className="days">{soon} {t.h.d}</span>}
          </div>
          <div className="im-title" style={{ fontSize: 15, marginTop: 4 }}>{opp.title}</div>
          <div className="im-meta" style={{ marginTop: 2 }}>{opp.organization}</div>
        </div>
      </div>
    </button>
  );
}
