# Dashboard Financeiro

Aplicação web pessoal para gerenciar extratos, categorias e dívidas com importação de CSV, visualização mensal e acesso protegido por senha.

---

## Funcionalidades

- **Autenticação por senha** — acesso bloqueado até inserir a senha correta. Senha hasheada (SHA-256 + salt) e armazenada no Supabase.
- **Importação de CSV** — suporte a extratos do Banco Inter e Nubank com pré-visualização e revisão antes de confirmar.
- **Compras parceladas** — itens parcelados do Nubank são convertidos automaticamente em dívidas de crédito.
- **Controle de dívidas** — cadastro de dívidas gerais e de crédito, com histórico de pagamentos e acréscimos.
- **Painel mensal** — KPIs de receita, total de gastos, saldo e % de poupança com navegação por mês.
- **Gráficos** — visão geral mensal (barras), distribuição de gastos (rosca) e ranking por categoria (barras horizontal).
- **Breakdown por categoria** — clique em uma categoria para filtrar a lista de extratos.
- **Gerenciamento de categorias** — crie, remova e personalize cores das categorias.
- **Saldo atual** — defina o saldo da conta manualmente; pode ser ocultado com um clique.
- **Persistência remota** — todos os dados são salvos no Supabase (PostgreSQL). Nenhum dado fica apenas no navegador.

---

## Requisitos

- Node.js >= 18
- Conta no [Supabase](https://supabase.com) com as tabelas `extratos` e `kv_store` criadas

### Tabelas necessárias no Supabase

Execute no **SQL Editor** do Supabase:

```sql
-- Lançamentos financeiros
CREATE TABLE extratos (
  id           TEXT PRIMARY KEY,
  valor        NUMERIC NOT NULL,
  descricao    TEXT NOT NULL,
  categoria    TEXT NOT NULL,
  tipo         TEXT NOT NULL CHECK (tipo IN ('receita', 'gasto')),
  data         DATE NOT NULL,
  criado_em    TIMESTAMPTZ,
  saldo_conta  NUMERIC
);

-- Configurações genéricas (categorias, dívidas, saldo, senha)
CREATE TABLE kv_store (
  key         TEXT PRIMARY KEY,
  value       JSONB,
  updated_at  TIMESTAMPTZ
);

-- Desabilitar RLS (app pessoal sem multi-usuário)
ALTER TABLE extratos DISABLE ROW LEVEL SECURITY;
ALTER TABLE kv_store DISABLE ROW LEVEL SECURITY;
```

---

## Configuração

1. Clone o repositório:

```bash
git clone <url-do-repo>
cd dashboard-financeiro
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` na raiz com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key>
```

> **Importante:** o `.env` já está no `.gitignore` e nunca deve ser commitado.

4. Execute em modo de desenvolvimento:

```bash
npm run dev
```

No primeiro acesso, o sistema pedirá para você criar uma senha de proteção.

---

## Deploy (gratuito)

Recomendado: **Vercel**, **Netlify** ou **Cloudflare Pages**.

1. Conecte o repositório GitHub no dashboard do serviço escolhido.
2. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Adicione as variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) como secrets no painel do serviço.
4. Faça deploy — cada `git push` gera um novo deploy automaticamente.

---

## Comandos úteis

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm run preview    # preview do build local
npx tsc --noEmit   # checagem de tipos
```

---

## Estrutura do projeto

```
src/
├── components/
│   ├── AuthGate.tsx          # tela de senha / proteção de acesso
│   ├── Breakdown.tsx         # breakdown por categoria
│   ├── BreakdownCard.tsx
│   ├── CategoryManager.tsx   # gerenciar categorias
│   ├── ChartBar.tsx
│   ├── ChartOverview.tsx
│   ├── ChartPie.tsx
│   ├── DividaCard.tsx
│   ├── DividaForm.tsx
│   ├── DividasSection.tsx
│   ├── ExtratoForm.tsx       # formulário + importação CSV
│   ├── ExtratoList.tsx
│   ├── Header.tsx
│   ├── ImportReviewModal.tsx
│   ├── KpiCard.tsx
│   ├── KpiGrid.tsx
│   └── MonthSelector.tsx
├── data/
│   └── financeiro.ts         # categorias padrão e paleta de cores
├── hooks/
│   ├── useFinanceiro.ts      # agregação de dados por mês
│   └── useStore.ts           # estado global + persistência Supabase
├── lib/
│   ├── hash.ts               # hashing SHA-256 + salt (Web Crypto API)
│   └── supabase.ts           # cliente Supabase
├── services/
│   └── storage.ts            # todas as operações de leitura/escrita no banco
├── types/
│   └── index.ts              # interfaces TypeScript
└── utils/
    └── csvImport.ts          # parser CSV Inter / Nubank
```
