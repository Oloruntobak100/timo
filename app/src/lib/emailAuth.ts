import { z } from 'zod';

const emailAuthSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email')
  .email({ message: 'Enter a valid email address' })
  .transform((s) => s.toLowerCase());

export type ValidatedEmail = z.infer<typeof emailAuthSchema>;

/** Rejects malformed addresses before calling Supabase. Returns normalized lowercase email. */
export function validateAuthEmail(raw: string): { ok: true; email: string } | { ok: false; message: string } {
  const result = emailAuthSchema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? 'Invalid email';
    return { ok: false, message: msg };
  }
  return { ok: true, email: result.data };
}
