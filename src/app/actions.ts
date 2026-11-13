"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { destroySession } from "@/lib/auth";
import { ESCOPO_COOKIE, type Escopo } from "@/lib/escopo";

export async function setEscopo(v: Escopo) {
  const valor: Escopo = v === "1" || v === "2" ? v : "ambas";
  (await cookies()).set(ESCOPO_COOKIE, valor, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
