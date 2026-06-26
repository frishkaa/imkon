import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useSession } from "../store";
import { Icon } from "../components/icons";
import { BackBar, Empty, Loading, Phone, Screen, Status } from "../components/ui";
import type { Notif } from "../types";

export function Notifications() {
  const nav = useNavigate();
  const { t } = useSession();
  const [items, setItems] = useState<Notif[] | null>(null);

  useEffect(() => {
    api.notifications().then((r) => setItems(r.items)).catch(() => setItems([]));
    api.markRead().catch(() => {});
  }, []);

  return (
    <Phone>
      <Status />
      <BackBar onBack={() => nav(-1)} />
      <Screen style={{ padding: "8px 22px 20px" }}>
        <div className="im-q" style={{ fontSize: 24, marginTop: 12, marginBottom: 16 }}>{t.nt.title}</div>
        {items === null ? <Loading /> : items.length === 0 ? <Empty>{t.nt.empty}</Empty> :
          <div className="listgap">{items.map((n, i) => (
            <div key={i} className="im-card" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface-tint)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="bell" size={18} color="var(--teal)" /></div>
              <div className="im-body" style={{ color: "var(--ink)", flex: 1 }}>{n.text}</div>
            </div>))}</div>}
      </Screen>
    </Phone>
  );
}
