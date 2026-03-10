# Dashboard Financeiro

Aplicação web simples para gerenciar extratos, categorias e dívidas pessoais.

Resumo
- Importação de CSV (Inter / Nubank) com pré-visualização e revisão de categorias.
- Cadastro e controle de dívidas (movimentações e parcelamentos).
- Dashboard com KPIs (receitas, gastos, saldo, poupança) por mês.
- Filtragem por categoria, paginação do extrato e separadores por dia.
- Persistência local via `localStorage`.

Requisitos
- Node.js (>=16) e npm ou yarn

Instalação
1. Clone o repositório:

```bash
git clone <url-do-repo>
cd dashboard-financeiro
```

2. Instale dependências (não commitadas no repositório):

```bash
npm install
# ou
yarn
```

3. Variáveis de ambiente (opcional)
- Se você usar integrações externas, crie um arquivo `.env` a partir de `.env.sample` e preencha os valores localmente. Nunca adicione `.env` ao Git.

4. Rodar em modo de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

Checagem de tipos

```bash
npx tsc --noEmit
```

Build para produção

```bash
npm run build
npm run preview
```

Estrutura principal
- `src/` — código fonte React + TypeScript
- `src/hooks/useStore.ts` — gerenciamento de estado e persistência local
- `src/utils/csvImport.ts` — parser de CSVs de extrato
- `src/components/` — componentes de UI (ImportReviewModal, ExtratoList, Breakdown, etc.)

Boas práticas de segurança
- Não versionar arquivos de ambiente ou chaves (ex.: `.env`).
- Use `.env.sample` para compartilhar a lista de variáveis esperadas.
- Para compartilhar credenciais entre colaboradores, use um cofre seguro (GitHub Secrets, 1Password, Vault).

Contribuição
- Abra issues para bugs e solicitações de features.
- Envie PRs com descrições claras e testes quando aplicável.

Licença
- Projeto está sem licença explícita — adicione um `LICENSE` se quiser publicar.

Arquivo criado: [README.md](README.md)
