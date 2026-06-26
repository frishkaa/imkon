import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../store";
import { Icon } from "./icons";
import { Phone, Status } from "./ui";

export function BottomNav() {
  const nav = useNavigate();
  const loc = useLocation();
  const { t, user } = useSession();
  const items = [
    { key: "home", path: "/home", icon: "home", label: t.nav.home },
    { key: "path", path: "/path", icon: "path", label: t.nav.path },
    ...(user?.is_adult ? [{ key: "work", path: "/work", icon: "work", label: t.nav.work }] : []),
    { key: "uni", path: "/uni", icon: "cap", label: t.nav.uni },
    { key: "profile", path: "/profile", icon: "user", label: t.nav.profile },
  ];
  return (
    <div className="im-nav">
      {items.map((it) => {
        const on = loc.pathname === it.path;
        return (
          <a key={it.key} className={on ? "is-on" : ""} onClick={() => nav(it.path)} style={{ cursor: "pointer" }}>
            <Icon name={it.icon} size={22} color={on ? "var(--teal)" : "var(--muted)"} />
            <span>{it.label}</span>
          </a>
        );
      })}
    </div>
  );
}

export function AppScreen({ children, pad = true }: { children: ReactNode; pad?: boolean }) {
  return (
    <Phone>
      <Status />
      <div className="screen">
        <div className={pad ? "pad" : ""} style={{ paddingBottom: 16 }}>{children}</div>
      </div>
      <BottomNav />
    </Phone>
  );
}
