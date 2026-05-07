import { createHash } from "crypto";

function checkinPassword() {
  return process.env.CHECKIN_PASSWORD || "";
}

function checkinSecret() {
  return process.env.CHECKIN_SESSION_SECRET || checkinPassword();
}

export function checkinSessionValue() {
  const secret = checkinSecret();

  if (!secret) return "";

  return createHash("sha256").update(`checkin:${secret}`).digest("hex");
}

export function isCheckinPasswordValid(senha: string) {
  const password = checkinPassword();

  if (!password) return false;

  return senha === password;
}

export function isCheckinAuthenticated(session?: string) {
  const expected = checkinSessionValue();

  return Boolean(session && expected && session === expected);
}
