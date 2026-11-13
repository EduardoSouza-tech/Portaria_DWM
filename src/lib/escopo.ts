import { cookies } from "next/headers";

/** Seleção de dados: Empresa 1, Empresa 2 ou ambas */
export type Escopo = "1" | "2" | "ambas";
export const ESCOPO_COOKIE = "sass_escopo";

export async function getEscopo(): Promise<Escopo> {
  const v = (await cookies()).get(ESCOPO_COOKIE)?.value;
  return v === "1" || v === "2" ? v : "ambas";
}

export function incluiE1(e: Escopo) {
  return e === "1" || e === "ambas";
}

export function incluiE2(e: Escopo) {
  return e === "2" || e === "ambas";
}
