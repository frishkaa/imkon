# Security checklist (spec §11) — implementation map

We handle vulnerable-minor data, so this is treated as load-bearing.

| Control | Status | Where |
|---|---|---|
| HTTPS/TLS in transit | ⚠️ deploy-time | terminate TLS at the reverse proxy in prod (nginx/Caddy) |
| AES-256 at rest for `phone` + `full_name` | ✅ | `app/security/crypto.py` (`EncryptedString` = AES-256-GCM); test `test_security.py::test_phone_and_name_encrypted_at_rest` reads raw ciphertext |
| Passwords hashed (argon2) | ✅ | `app/security/hashing.py`; users + org accounts; test `test_password_hashing` |
| Postgres Row-Level Security | ✅ dev=app-level / ✅ prod=SQL | app: `app/security/access.py` (owner-only profile, org-only verifications, employer-on-link); prod: `backend/db/rls_policies.sql` |
| Explicit consent on registration (TJ/RU, plain) | ✅ | `POST /users` rejects without `consent_given`; minors → minimal-data mode (status + work needs stripped) |
| Revocable share links (TTL / one-time) | ✅ | `app/services/share.py`; `test_share_revoke_and_public`, `test_one_time_share` |
| Verified-org-only verification (no self-verify) | ✅ | resolve requires an **org** token; `test_user_cannot_resolve_own_verification` |
| Rate-limit registration + applications | ✅ | `app/security/ratelimit.py` (fixed window); `test_rate_limiter_blocks_after_limit` (bypassed only in `APP_ENV=test`) |
| Access logs on sensitive reads | ✅ | `access_logs` table + `log_access()` on profile reads / shared-profile views |
| Analytics dashboard anonymized / aggregated only | ✅ | `dashboard/streamlit_app.py` reads counts + `matches_log` anonymized dims (city/category/age_bucket) — **no PII** |
| Data residency (prod DB in Tajikistan / Babilon) | ⚠️ deploy-time | `DATABASE_URL` points at Babilon Postgres in prod; dev uses local Docker |
| Secrets never committed | ✅ | `api.txt`, `.env` in `.gitignore`; DeepSeek key read at runtime |
| Minor protection (no work exposure < 18) | ✅ | `apply_legal_filter` first; needs stripped at registration; earning endpoints `_require_adult`; property test over 800 synthetic minors + 300-user DB scale → **0 leaks** |
| Injection safety | ✅ | SQLAlchemy parameterized queries; `test_injection_string_stored_safely` |
| AI privacy (prod) | ✅ design | `LLM_PROVIDER=local` keeps all inference on-server (Qwen via Ollama); dev uses DeepSeek on synthetic data only |

⚠️ items are deployment-time concerns (TLS termination, physical DB location), not code.
