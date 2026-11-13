import { prisma } from "@/lib/db";
import type { TipoCadastro } from "./config";

type Row = Record<string, unknown> & { id: number; uso: number };

/** Acesso uniforme aos cadastros auxiliares */
export const repos: Record<
  TipoCadastro,
  {
    list: () => Promise<Row[]>;
    create: (data: Record<string, unknown>) => Promise<unknown>;
    update: (id: number, data: Record<string, unknown>) => Promise<unknown>;
    remove: (id: number) => Promise<unknown>;
  }
> = {
  construtoras: {
    list: async () =>
      (await prisma.construtora.findMany({ orderBy: { razaoSocial: "asc" }, include: { _count: { select: { obras: true } } } })).map(
        ({ _count, ...r }) => ({ ...r, uso: _count.obras }),
      ),
    create: (data) => prisma.construtora.create({ data: data as never }),
    update: (id, data) => prisma.construtora.update({ where: { id }, data: data as never }),
    remove: (id) => prisma.construtora.delete({ where: { id } }),
  },
  imobiliarias: {
    list: async () =>
      (await prisma.imobiliaria.findMany({ orderBy: { razaoSocial: "asc" }, include: { _count: { select: { locacoes: true } } } })).map(
        ({ _count, ...r }) => ({ ...r, uso: _count.locacoes }),
      ),
    create: (data) => prisma.imobiliaria.create({ data: data as never }),
    update: (id, data) => prisma.imobiliaria.update({ where: { id }, data: data as never }),
    remove: (id) => prisma.imobiliaria.delete({ where: { id } }),
  },
  inquilinos: {
    list: async () =>
      (await prisma.inquilino.findMany({ orderBy: { nome: "asc" }, include: { _count: { select: { locacoes: true } } } })).map(
        ({ _count, ...r }) => ({ ...r, uso: _count.locacoes }),
      ),
    create: (data) => prisma.inquilino.create({ data: data as never }),
    update: (id, data) => prisma.inquilino.update({ where: { id }, data: data as never }),
    remove: (id) => prisma.inquilino.delete({ where: { id } }),
  },
};
