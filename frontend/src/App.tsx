import { Navigate, Route, Routes } from "react-router-dom";
import { useSession } from "./store";
import type { ReactNode } from "react";

import { Welcome } from "./screens/Welcome";
import { Login } from "./screens/Login";
import { Register } from "./screens/Register";
import { Home } from "./screens/Home";
import { OpportunityDetail } from "./screens/OpportunityDetail";
import { AiChat } from "./screens/AiChat";
import { Path } from "./screens/Path";
import { Profile } from "./screens/Profile";
import { Share } from "./screens/Share";
import { PublicProfile } from "./screens/PublicProfile";
import { Work } from "./screens/Work";
import { VacancyDetail } from "./screens/VacancyDetail";
import { CreateGig } from "./screens/CreateGig";
import { Universities } from "./screens/Universities";
import { OrgCabinet } from "./screens/OrgCabinet";
import { Notifications } from "./screens/Notifications";
import { ResumeBuilder } from "./screens/ResumeBuilder";
import { Settings } from "./screens/Settings";
import { Support } from "./screens/Support";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, token } = useSession();
  if (!token && !user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/p/:token" element={<PublicProfile />} />
      <Route path="/org" element={<OrgCabinet />} />

      <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/opp/:id" element={<RequireAuth><OpportunityDetail /></RequireAuth>} />
      <Route path="/ai" element={<RequireAuth><AiChat /></RequireAuth>} />
      <Route path="/path" element={<RequireAuth><Path /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/share" element={<RequireAuth><Share /></RequireAuth>} />
      <Route path="/work" element={<RequireAuth><Work /></RequireAuth>} />
      <Route path="/work/create" element={<RequireAuth><CreateGig /></RequireAuth>} />
      <Route path="/vacancy/:id" element={<RequireAuth><VacancyDetail /></RequireAuth>} />
      <Route path="/uni" element={<RequireAuth><Universities /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
      <Route path="/resume-builder" element={<RequireAuth><ResumeBuilder /></RequireAuth>} />
      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/support" element={<RequireAuth><Support /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
