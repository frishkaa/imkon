-- ===========================================================================
-- IMKON — Postgres Row Level Security policies (PRODUCTION).
--
-- In dev we run as the superuser-ish `imkon` role and enforce access in the app
-- (see app/security/access.py). In PRODUCTION, run this against the Babilon
-- Postgres as the owner, and have the API connect as a NON-superuser role
-- `imkon_app` that sets `app.current_user` / `app.current_org` per request:
--
--     SET app.current_user = '<uuid>';   -- after authenticating a user
--     SET app.current_org  = '<uuid>';   -- after authenticating an org
--
-- Then these policies are enforced by Postgres itself (defense in depth).
-- ===========================================================================

-- a dedicated, non-superuser application role (RLS is bypassed by superusers)
-- CREATE ROLE imkon_app LOGIN PASSWORD '...';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO imkon_app;

-- ---- user_profiles: a row is readable/writable only by its owner ----
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS up_owner ON user_profiles;
CREATE POLICY up_owner ON user_profiles
  USING (id = current_setting('app.current_user', true)::uuid)
  WITH CHECK (id = current_setting('app.current_user', true)::uuid);

-- an employer/org may READ a profile only if it is public, or an application links them
DROP POLICY IF EXISTS up_public_or_linked ON user_profiles;
CREATE POLICY up_public_or_linked ON user_profiles
  FOR SELECT
  USING (
    profile_public = true
    OR EXISTS (
      SELECT 1 FROM applications a
      JOIN gigs g  ON g.id = a.gig_id  AND g.seller_id  = current_setting('app.current_user', true)::uuid
      WHERE a.user_id = user_profiles.id
    )
  );

-- ---- verification_requests: an org sees ONLY its own org's requests ----
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vr_org ON verification_requests;
CREATE POLICY vr_org ON verification_requests
  USING (
    org_id  = current_setting('app.current_org', true)::uuid
    OR user_id = current_setting('app.current_user', true)::uuid
  );

-- ---- achievements: readable by owner; public profiles expose verified ones via the API ----
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ach_owner ON achievements;
CREATE POLICY ach_owner ON achievements
  USING (user_id = current_setting('app.current_user', true)::uuid);

-- ---- applications: visible to the applicant (and the gig/task owner in the app layer) ----
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_owner ON applications;
CREATE POLICY app_owner ON applications
  USING (user_id = current_setting('app.current_user', true)::uuid);

-- NOTE: opportunities / universities / organizations are public catalogs (no RLS).
-- matches_log is anonymized aggregate input for the dashboard (no PII columns).
