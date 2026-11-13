// Token de sessão (edge-safe: usado no middleware e no servidor)
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sass_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export type Session = { uid: number; nome: string; email: string; role: "ADMIN" | "USUARIO" };

function secret() {
  const s = process.env.AUTH_SECRET || "sass-dev-secret-troque-em-producao-0123456789";
  return new TextEncoder().encode(s);
}

export async function signSession(s: Session): Promise<string> {
  return new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.uid !== "number") return null;
    return {
      uid: payload.uid,
      nome: String(payload.nome ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role === "ADMIN" ? "ADMIN" : "USUARIO",
    };
  } catch {
    return null;
  }
}
