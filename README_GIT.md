# Preparar o repositório para Git

Passos recomendados antes de subir o projeto para um repositório remoto:

- Não inclua dependências: `node_modules/` já está no `.gitignore`.
- Nunca adicione arquivos com credenciais (por exemplo `.env`). Use `.env.sample` como referência.
- Verifique o `.gitignore` para garantir que arquivos sensíveis e build outputs estão ignorados.

Comandos sugeridos para criar o repositório e fazer o primeiro commit:

```bash
# inicializar git
git init

# adicionar todos os arquivos (respeitando .gitignore)
git add .

# criar o commit inicial
git commit -m "chore: initial project import (no secrets)"

# adicionar remoto e enviar (substitua URL)
git remote add origin git@github.com:your-username/your-repo.git
git branch -M main
git push -u origin main
```

Como lidar com variáveis de ambiente:

- Crie um arquivo `.env` localmente a partir de `.env.sample` e preencha os valores.
- Nunca faça `git add .env` — o `.gitignore` impede isso.
- Se precisar compartilhar credenciais com colaboradores, use um cofre seguro (ex.: Secrets do GitHub, 1Password, Vault).

Verificações rápidas antes de subir:

- `git status` — verifique arquivos listados antes de dar `git add`.
- `git diff --staged` — confirme o que será commitado.
- `rg "(API_KEY|PRIVATE|SECRET|PASSWORD|AKIA|PGPASSWORD)" --hidden --glob "!node_modules"` — (opcional) procura por padrões comuns de segredos.

Quer que eu crie um `.gitattributes` ou adicione instruções para CI/CD também? 