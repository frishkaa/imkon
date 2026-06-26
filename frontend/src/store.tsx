import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import { api, setToken } from "./api";
import { DICTS, LANG_PREF, pickLang, type Lang } from "./i18n";
import type { User } from "./types";

interface Ctx {
  user: User | null;
  token: string | null;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof DICTS["ru"];
  langPref: string;
  login: (token: string, user: User) => void;
  logout: () => void;
  refresh: () => Promise<void>;
  toast: (msg: string) => void;
}

const SessionCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTok] = useState<string | null>(localStorage.getItem("imkon_token"));
  const [lang, setLangState] = useState<Lang>(pickLang(localStorage.getItem("imkon_lang") || "ru"));
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("imkon_lang", l);
  }, []);

  const login = useCallback((tk: string, u: User) => {
    setToken(tk);
    setTok(tk);
    setUser(u);
    if (u.language_pref) setLang(pickLang(u.language_pref));
  }, [setLang]);

  const logout = useCallback(() => {
    setToken(null);
    setTok(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("imkon_token")) return;
    try { setUser(await api.me()); } catch { logout(); }
  }, [logout]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg((m) => (m === msg ? null : m)), 2200);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const value = useMemo<Ctx>(() => ({
    user, token, lang, setLang, t: DICTS[lang], langPref: LANG_PREF[lang],
    login, logout, refresh, toast,
  }), [user, token, lang, setLang, login, logout, refresh, toast]);

  return (
    <SessionCtx.Provider value={value}>
      {children}
      <div className={`toast${toastMsg ? " show" : ""}`}>{toastMsg}</div>
    </SessionCtx.Provider>
  );
}

export function useSession(): Ctx {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession outside provider");
  return ctx;
}
