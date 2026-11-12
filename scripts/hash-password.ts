/**
 * Prints a bcrypt hash for the admin password.
 *   npm run hash-password -- "my-strong-password"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: npm run hash-password -- "<password of at least 12 characters>"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
// Next.js expands "$VAR" in .env files, so each "$" of the hash must be escaped there.
console.log(`
1) Local: replace the ADMIN_PASSWORD_HASH line in .env with:

ADMIN_PASSWORD_HASH="${hash.replace(/\$/g, "\\$")}"

2) Vercel (Settings → Environment Variables): paste the raw hash, without escaping:

${hash}

Then restart "npm run dev".`);
