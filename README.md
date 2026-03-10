# Dashboard Financeiro

Aplicação web para gerenciar extratos, categorias e dívidas pessoais com importação de CSV e visualização mensal.

Funcionalidades principais
- Importação de extratos (Inter / Nubank) com pré-visualização e revisão de categorias.
- Cadastro e controle de dívidas (movimentos, parcelamentos, histórico).
- Painel mensal com KPIs: receitas, gastos, saldo e poupança.
- Filtragem por categoria, paginação do extrato e separadores por dia.
- Persistência local via `localStorage` (sem backend por padrão).

Requisitos
- Node.js (recomendado >= 16)
- npm ou yarn

Instalação e execução
1. Clone o repositório e entre na pasta do projeto:

```bash
git clone <url-do-repo>
cd dashboard-financeiro
```

2. Instale dependências:

```bash
npm install
# ou
yarn
```

3. Execute em modo de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

Verificações e build
- Checagem de tipos: `npx tsc --noEmit`
- Build para produção: `npm run build` e `npm run preview`

Estrutura
- `src/` — código-fonte React + TypeScript
- `src/hooks/useStore.ts` — estado da aplicação e persistência local
- `src/utils/csvImport.ts` — parser de CSVs de extrato
- `src/components/` — componentes de interface (ImportReviewModal, ExtratoList, Breakdown, etc.)