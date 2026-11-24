---
name: "Secure coding by OWASP Top 10 (2025)"
description: Secure coding rules for web and backend code, ordered by the ten OWASP Top 10 2025 risks. Each rule says what to do, how severe a violation is, and a search pattern to spot the anti-pattern. Apply when writing or reviewing code that handles requests, users, data, secrets, dependencies or model output.
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: security
---

# Secure coding by OWASP Top 10 (2025)

Apply these rules to every change you write or review. Each rule carries a severity:

- **[critical]**: exploitable vulnerability. Fix before merge.
- **[important]**: significant risk. Fix in the same iteration.
- Items under "Should" are defence-in-depth. Plan them.

"Find:" gives a search pattern (regular expression) that points at the anti-pattern. A hit is a lead to check, not
proof; no hit is not proof of safety. Most patterns target JavaScript/TypeScript; translate them for other languages.
Frameworks named here are examples. Use the equivalent in your stack.

| # | Risk | Key mitigation |
| --- | --- | --- |
| A01 | Broken Access Control | Auth on every endpoint, ownership checks, deny by default, SSRF allowlists |
| A02 | Security Misconfiguration | Security headers, strict CORS, no debug or default credentials in production |
| A03 | Software Supply Chain Failures | Vulnerability audit in CI, reviewed new dependencies, SBOM and provenance |
| A04 | Cryptographic Failures | Argon2id/bcrypt for passwords, secure randomness, TLS verified, no secrets in code |
| A05 | Injection | Parameterised queries, no shell, output encoding, server-side validation, bounded input |
| A06 | Insecure Design | Threat modelling, abuse cases, secure-by-default patterns |
| A07 | Authentication Failures | Strict JWT checks, rate-limited login, session regeneration, safe token storage |
| A08 | Software or Data Integrity Failures | Lockfile installs, signed webhooks, SRI, no unsafe deserialisation |
| A09 | Security Logging and Alerting Failures | Log security events, no secrets in logs, structured logs, alerts |
| A10 | Mishandling of Exceptional Conditions | Handle every error, no internals to clients, fail secure |

## Must

### A01 Broken Access Control

- [critical] Put authentication and authorisation on every new endpoint, route handler and server action; deny by
  default. Find: `(?:app|router)\.\w+\s*\(\s*['"]\/api\/(?:admin|users|settings)` without auth middleware; `'use server'`
  functions without a session check.
- [critical] Enforce authorisation on the server. Frontend guards (route guards, hidden buttons) are UX only.
- [critical] Check ownership on every access by id (IDOR), and answer 404 for objects the caller does not own.
  Find: `params\.(?:id|userId|orderId)` used without an ownership check.
- [critical] Never pass the request body straight into create or update (mass assignment); pick allowed fields
  explicitly. Find: `(?:create|update|findOneAndUpdate)\s*\(\s*req\.body\s*\)`.
- [critical] Never take `role`, `isAdmin` or `permissions` from user input; set them on the server.
  Find: `req\.body\.role|req\.body\.isAdmin|req\.body\.permissions`.
- [critical] SSRF: for server-side requests to user-supplied URLs, allow only `https`, allowlist hostnames, resolve all
  A/AAAA records and reject private, loopback, link-local and unique-local addresses (normalise IPv4-mapped IPv6 first),
  disable redirects, and pin the resolved IP in the HTTP client so DNS cannot change between check and request.
  Find: `fetch\((?:req\.|params\.|query\.|body\.|url|href)`.
- [critical] Path traversal: resolve user-supplied names against a fixed base directory and reject any result outside
  it. Find: `(?:readFile|readFileSync|createReadStream|path\.join)\s*\(.*(?:req\.|params\.|query\.|body\.)`.
- [important] In every `message` event listener, compare `event.origin` with an exact allowlist before using the data.
  Find: `addEventListener\s*\(\s*['"]message['"]` without an `origin` check.
- [important] Redirect only to relative paths (start with `/`, not `//`) or to an allowlist, never to a raw parameter.
  Find: `(?:window\.location|location\.href|router\.push)\s*=\s*(?:req\.|params\.|query\.)`.
- [important] Protect state-changing requests against CSRF: synchroniser or double-submit token, or `SameSite`
  cookies plus an Origin check. Server actions with a built-in Origin check count.
- [important] Require re-authentication (current password or fresh MFA) before account deletion, email change and
  other sensitive operations.
- [important] Send client components only the fields they need; never serialise whole database objects to the browser.
- [important] Make sure route middleware matchers cover API routes, not only pages.

### A02 Security Misconfiguration

- [critical] Never combine CORS `*` (or a reflected origin) with credentials; allow an explicit list of origins.
  Find: `(?:cors|Access-Control-Allow-Origin).*\*`.
- [critical] No default credentials in configuration; read them from the environment and validate at startup.
  Find: `(?:admin|root|default|test).*(?:password|pass|pwd)\s*[:=]\s*['"](?:admin|root|password|1234|test)`.
- [critical] Never expose server secrets to the client bundle (public environment prefixes such as `NEXT_PUBLIC_`,
  frontend `environment.ts` files). Find: `NEXT_PUBLIC_.*(?:SECRET|PRIVATE|PASSWORD|KEY(?!.*PUBLIC))`.
- [important] Client-side code reads only variables meant to be public.
- [important] Send `Content-Security-Policy` with nonces and without `'unsafe-inline'` or `'unsafe-eval'`.
  Find: `Content-Security-Policy.*(?:'unsafe-inline'|'unsafe-eval')`.
- [important] Send `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`,
  `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY` together with CSP `frame-ancestors 'none'`.
- [important] Use the framework's security-header middleware (for example helmet in Express) and remove `X-Powered-By`.
- [important] Debug mode, verbose errors and API introspection (for example GraphQL introspection) are off in production.

### A03 Software Supply Chain Failures

- [critical] CI fails on known high or critical vulnerabilities: `npm audit --audit-level=high` or the ecosystem's
  equivalent (`pip-audit`, `cargo audit`, `govulncheck`, `dotnet list package --vulnerable`).
- [important] Check every new dependency for typosquatting (exact name, publisher, age, adoption) before adding it.
- [important] Check every new dependency for install scripts (`"postinstall"` in its manifest) and justify them.

### A04 Cryptographic Failures

- [critical] Hash passwords with Argon2id (or bcrypt with cost 12 or more); never plaintext, MD5, SHA-1 or a plain
  SHA-256. Find: `(?:createHash|md5|sha1|sha256)\s*\(.*password`.
- [critical] No hardcoded API keys, tokens or passwords in source; load them from the environment or a secret store.
  Find: `(?:password|secret|api_key|token|apiKey)\s*[:=]\s*['"][A-Za-z0-9+/=]{8,}['"]`.
- [critical] Never commit `.env` or key files: `git ls-files .env` returns nothing, and `.gitignore` covers `.env`,
  `.env.local`, `.env.*.local`, `*.pem`, `*.key`.
- [critical] Use a cryptographically secure random source for tokens, ids and nonces (`crypto.randomBytes`,
  `crypto/rand`, `secrets`), never `Math.random` or Go's `math/rand`. Find: `math/rand` in security-related files.
- [critical] Never disable TLS certificate verification. Find: `InsecureSkipVerify:\s*true`,
  `rejectUnauthorized:\s*false`, `verify=False`.
- [important] Use TLS for every connection that carries credentials or personal data.

### A05 Injection

- [critical] Parameterise every SQL query; never build SQL with interpolation or concatenation.
  Find: `\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)`, `fmt\.Sprintf\s*\(.*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)`.
- [critical] NoSQL: cast input to the expected type before querying so `{ "$gt": "" }` cannot become an operator, and
  verify passwords against a stored hash, never inside the query. Find: `\{\s*\$(?:gt|gte|lt|lte|ne|in|nin|regex|where|exists)`.
- [critical] Commands: no shell. Pass an argument array (`execFile`, `spawn`, `subprocess.run([...])`), reject values
  starting with `-` and put `--` before them, allowlist where possible, and bound time and output size.
  Find: `(?:exec|execSync|execFile|execFileSync)\s*\(.*(?:req\.|params\.|query\.|body\.)`.
- [critical] XSS: render user content as text. If raw HTML is unavoidable, sanitise it with a vetted sanitiser (for
  example DOMPurify) first. This covers `dangerouslySetInnerHTML`, `[innerHTML]`, `bypassSecurityTrust*` and `v-html`.
  Find: `(?:v-html|\[innerHTML\]|dangerouslySetInner|bypassSecurityTrust)`.
- [critical] Templates: user input is only ever data, never template source; never compile user-supplied templates at
  runtime. Find: `(?:render|compile|template)\s*\(.*(?:req\.|params\.|query\.|body\.)`.
- [critical] XML: disable external entities and entity processing for untrusted XML.
  Find: `(?:parseXml|DOMParser|xml2js|libxmljs).*(?:req\.|body\.|file)`.
- [critical] No `eval`, `new Function` or similar with dynamic input; use structured parsers such as `JSON.parse`.
  Find: `eval\s*\(`.
- [critical] Treat language-model output as untrusted input: parameterise, escape or sanitise it before it reaches SQL,
  a shell, HTML or code.
- [critical] Keep instructions and user content in separate message roles; never splice user input into the instruction
  text. Role separation reduces prompt injection but does not stop it, so never give the model data or actions the
  user is not allowed to have.
- [important] Validate all input on the server with a schema validator (zod, joi, class-validator, pydantic or
  similar). Client-side validation is UX only.
- [important] Drop `__proto__`, `constructor` and `prototype` keys from user input before merging it into objects
  (prototype pollution). Find: `(?:__proto__|constructor\.prototype|Object\.assign)\s*.*(?:req\.|body\.|query\.)`.
- [important] Bound every request: body size limit (`express.json({ limit: '100kb' })`), upload size and MIME-type
  allowlist, GraphQL depth and complexity limits. Find: `express\.json\(\)` without `limit`; `multer|formidable|busboy`
  without limits; `new ApolloServer` without validation rules.
- [important] Rate-limit every new endpoint according to its cost. With several instances or serverless, keep counters
  in a shared store, not in process memory.
- [important] In server handlers, prefer asynchronous process APIs with a timeout; synchronous calls block the event
  loop and amplify denial of service.

### A06 Insecure Design

- [important] Before building a feature that touches money, permissions, personal data or external input, write down
  its abuse cases (who could misuse it, how) and add tests for them.
- [important] Use secure-by-default patterns: deny by default, server-side state transitions, least privilege.

### A07 Authentication Failures

- [critical] Verify JWTs with an explicit algorithm allowlist (`algorithms: ['RS256']` or `['ES256']`); reject
  `alg: none`. Find: `jwt\.verify\((?![^)]*\balgorithms\b)[^)]*\)`.
- [critical] Every token expires: access tokens about 15 minutes, refresh tokens one-time use and rotated.
  Find: `jwt\.sign\((?![^)]*\b(?:expiresIn|exp)\b)[^)]*\)`.
- [critical] Check `exp`, `iat`, `aud` and `iss` on every token and reject unknown issuers or audiences.
- [critical] Rate-limit login, registration and password reset (for example 5 attempts per 15 minutes); use a shared
  store when running more than one instance. Find: `(?:post|router\.post)\s*\(\s*['"]\/(?:login|signin|auth|register|reset)`.
- [critical] OAuth: send a random `state` per request and verify it on the callback.
  Find: `authorize\?(?![^\n#]*\bstate=)[^\n#]*`.
- [important] Public OAuth clients (single-page and mobile apps) use PKCE with the `S256` method.
- [important] Regenerate the session id after login. On password change or privilege change, invalidate the user's
  other sessions (for example by bumping a token version).
- [important] Keep tokens and session ids in cookies with `HttpOnly; Secure; SameSite`, never in `localStorage` or
  `sessionStorage`. Find: `localStorage\.setItem\(.*(?:token|jwt|auth|session|password)`.
- [important] Session cookies: `HttpOnly`, `Secure`, `SameSite=Strict` (`Lax` only for cookies that must survive a
  cross-site top-level navigation, such as an OAuth return), `Path=/`, explicit `Max-Age`.
- [important] Offer MFA for privileged accounts.
- [important] Attach auth tokens in one central HTTP client or interceptor, not per call.

### A08 Software or Data Integrity Failures

- [critical] Verify webhook signatures (HMAC or the provider's scheme, compared in constant time) before processing.
- [important] Commit the lockfile and install from it in CI (`npm ci` or the equivalent); a lockfile out of sync with
  the manifest fails the build.
- [important] Load scripts from a CDN only with Subresource Integrity (`integrity` and `crossorigin` attributes).
- [important] Validate model output against an expected schema before application logic uses it; reject what does not
  match.
- [important] Never deserialise untrusted data with formats that can instantiate arbitrary types.

### A09 Security Logging and Alerting Failures

- [critical] Never log passwords, tokens, secrets or personal data; configure redaction in the logger (for example
  pino `redact`). Find: `(?:log|logger)\.\w+\(.*(?:password|token|secret|ssn|credit)`.
- [important] Log security events: authentication failures, access denied, rate-limit hits, input validation
  failures, password changes.
- [important] Use structured (JSON) logging; never build log lines by concatenating user input (log injection).
  Find: `console\.log\(.*\+.*(?:req\.|user\.|body\.)`.
- [important] Never echo secrets in CI; use the CI system's masked secrets.
  Find: `(?:echo|console\.log|print).*(?:\$SECRET|\$TOKEN|\$PASSWORD|process\.env)`.
- [important] Alert on anomalous patterns such as bursts of authentication failures or access denials.

### A10 Mishandling of Exceptional Conditions

- [important] Handle every error. Clients get a generic message; stack traces, SQL and internal paths go only to server
  logs, and details reach the client only in development. Find: `(?:stack|trace|query|sql).*(?:res\.json|res\.send|c\.JSON)`.
- [important] Fail secure: when a check, a dependency or the configuration fails, deny instead of allowing.

## Should

- Send `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy` that turns off unused features
  (`camera=(), microphone=(), geolocation=(), payment=()`), and same-origin `Cross-Origin-Opener-Policy` and
  `Cross-Origin-Resource-Policy`.
- Pin production dependency versions; no `*` or `latest`. Find: `":\s*["']\*["']|":\s*["']latest["']`.
- Produce an SBOM and build provenance (for example SLSA) for releases.
- Add correlation or trace ids to every log line.
- Validate all environment variables at startup with a schema.
- Rotate signing keys periodically.

## Examples

TypeScript is used for brevity; the same patterns apply in other languages.

SQL (A05):

```typescript
// BAD
await db.query(`SELECT * FROM users WHERE id = ${userId}`);
// GOOD: parameterised
await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

```go
// GOOD: parameterised
db.Where("id = ?", userID).Find(&user)
```

Command execution (A05):

```typescript
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pExecFile = promisify(execFile);

const dir = String(req.query.dir ?? '');
if (!dir || dir.startsWith('-')) throw new Error('Invalid directory');
if (!['/data', '/public'].includes(dir)) throw new Error('Invalid directory'); // allowlist
const { stdout } = await pExecFile('ls', ['-la', '--', dir], { timeout: 5_000, maxBuffer: 1 << 20 });
```

SSRF (A01):

```typescript
import { promises as dns } from 'node:dns';

function isPrivateIP(ip: string): boolean {
  const v4 = ip.startsWith('::ffff:') ? ip.slice(7) : ip; // IPv4-mapped IPv6
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|169\.254\.)/.test(v4)) return true;
  return /^(::1|fe[89ab]|fc|fd)/i.test(v4); // IPv6 loopback, link-local, unique-local
}

const target = new URL(req.body.url);
if (target.protocol !== 'https:') throw new Error('Only HTTPS allowed');
if (!['api.example.com', 'cdn.example.com'].includes(target.hostname)) throw new Error('Host not allowed');
const addresses = await dns.lookup(target.hostname, { all: true });
if (addresses.length === 0 || addresses.some(({ address }) => isPrivateIP(address))) {
  throw new Error('Private or reserved IPs not allowed');
}
// In production also pin the resolved IP in the HTTP client to close the DNS-rebinding window.
const data = await fetch(target.toString(), { redirect: 'error' });
```

Path traversal (A01):

```typescript
import path from 'node:path';
const base = '/data';
const filePath = path.resolve(base, req.params.filename);
if (!filePath.startsWith(base + path.sep)) throw new Error('Path traversal detected');
```

Ownership check and mass assignment (A01):

```typescript
router.get('/api/orders/:orderId', authenticate, async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order || order.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

const { name, email, avatar } = req.body;            // never User.findByIdAndUpdate(id, req.body)
await User.findByIdAndUpdate(id, { name, email, avatar });
```

JWT and passwords (A07, A04):

```typescript
const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'], audience: 'orders-api', issuer: 'https://id.example.com' });
const accessToken = jwt.sign({ sub: user.id }, privateKey, { algorithm: 'RS256', expiresIn: '15m' });

import { hash as argon2Hash, argon2id } from 'argon2';
const passwordHash = await argon2Hash(password, { type: argon2id, memoryCost: 65536, timeCost: 3 });
```

Login rate limit across instances (A07):

```typescript
import rateLimit from 'express-rate-limit';
app.post('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), loginHandler);
// With several instances or serverless, back the counter with a shared store (for example Redis).
```

Error handler (A10):

```typescript
app.use((err, req, res, _next) => {
  logger.error({ err, path: req.path, method: req.method });
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({ error: 'Internal Server Error', ...(isDev && { message: err.message }) });
});
```

Security headers with helmet (A02):

```typescript
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"], connectSrc: ["'self'"], frameAncestors: ["'none'"], objectSrc: ["'none'"],
      baseUri: ["'self'"], formAction: ["'self'"], upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
}));
app.disable('x-powered-by');
```

Secure cookie (A07):

```text
Set-Cookie: session=value; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
```

---
Adapted from Security Standards (security-and-owasp.instructions.md) by contributors to github/awesome-copilot, copyright GitHub, Inc. (https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/instructions/security-and-owasp.instructions.md), MIT.
Changes: condensed 1,088 lines into Must/Should rules grouped by OWASP risk, kept detection patterns and the key code examples, made the language-model rules more precise, removed tool-specific front matter. See SOURCE.md.
