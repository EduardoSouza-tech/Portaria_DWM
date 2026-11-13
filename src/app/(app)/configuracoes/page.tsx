import { ActionButton } from "@/components/forms";
import { Badge, Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dataBR, docMask } from "@/lib/format";
import { alterarSenha, alternarUsuario, criarUsuario, redefinirSenha, salvarEmpresa } from "./actions";
import { EmpresaForm, ResetSenhaForm, SenhaForm, UsuarioForm } from "./Forms";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const s = await requireUser();
  const admin = s.role === "ADMIN";
  const [empresas, usuarios] = await Promise.all([
    prisma.empresa.findMany({ orderBy: { id: "asc" } }),
    admin ? prisma.user.findMany({ orderBy: { nome: "asc" } }) : Promise.resolve([]),
  ]);
  const e = (id: number) => empresas.find((x) => x.id === id);

  return (
    <>
      <PageHeader title="Configurações" subtitle="Empresas, usuários e acesso." />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {admin &&
          ([1, 2] as const).map((id) => (
            <Card
              key={id}
              title={
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${id === 1 ? "bg-e1" : "bg-e2"}`} />
                  Empresa {id} — {id === 1 ? "Obras por administração" : "Leilão de imóveis"}
                </span>
              }
            >
              <EmpresaForm
                action={salvarEmpresa.bind(null, id)}
                cor={id === 1 ? "btn-e1" : "btn-e2"}
                d={{ nome: e(id)?.nome ?? `Empresa ${id}`, cnpj: e(id)?.cnpj ? docMask(e(id)!.cnpj) : "", descricao: e(id)?.descricao ?? "" }}
              />
            </Card>
          ))}
        <Card title="Minha senha">
          <p className="mb-3 text-sm text-slate-500">
            Conectado como <strong>{s.nome}</strong> ({s.email}).
          </p>
          <SenhaForm action={alterarSenha} />
        </Card>
      </div>

      {admin && (
        <Card title="Usuários" bodyClass="table-wrap">
          <div className="border-b border-slate-100 p-5">
            <UsuarioForm action={criarUsuario} />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Situação</th>
                <th>Criado em</th>
                <th>Redefinir senha</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.nome}</td>
                  <td>{u.email}</td>
                  <td>{u.role === "ADMIN" ? <Badge tone="violet">Administrador</Badge> : <Badge>Usuário</Badge>}</td>
                  <td>{u.ativo ? <Badge tone="green">Ativo</Badge> : <Badge tone="red">Inativo</Badge>}</td>
                  <td>{dataBR(u.createdAt)}</td>
                  <td>
                    <ResetSenhaForm action={redefinirSenha.bind(null, u.id)} />
                  </td>
                  <td className="text-right">
                    {u.id !== s.uid && (
                      <ActionButton action={alternarUsuario.bind(null, u.id)} className="btn btn-ghost btn-sm">
                        {u.ativo ? "Desativar" : "Ativar"}
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
