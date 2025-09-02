# Desenvolvimento Full-Stack Moderno (JS/TS)

## Projeto de Mensageria Acadêmico

### Descrição
Aplicativo de mensagens em tempo real, construído com Next.js (React) no front-end e Node.js (Express) no back-end. Permite cadastro de usuários, envio de mensagens de texto e mídia, notificações em tempo real.

### Funcionalidades
- Autenticação de usuários (e-mail/senha ou OAuth)
- Lista de contatos e conversas individuais
- Envio e recebimento de texto e arquivos de mídia
- Notificações em tempo real via WebSocket
- Testes automatizados (unitários, integração e E2E)

### Tecnologias
- **Front-end:** Next.js, React, TypeScript  
- **Back-end:** Node.js, Express.js, TypeScript  
- **Banco de Dados:** MongoDB, PostgreSQL, Redis  
- **Testes:** Jest, Cypress



### Instalação
1° criar banco chamado "trabalho"
2° entrar na pasta desenvolvimento-fullstack-moderno
3° dar os seguintes comandos

cd frontend/
npm i

cd ..

cd backend/
npm i

4° criar arquivo .env e colocar segundo esse modelo:

DATABASE_URL="mysql://<seu usuario>:<sua senha>@<url do banco>:<porta do banco>/trabalho"
JWT_SECRET=default
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

5° mover .env para a pasta do backend

6° entrar na pasta do backend e dar os seguintes comandos:

npx prisma generate
npx prisma migrate deploy


### Iniciar as aplicações
- **Front-end:**  npm run dev  
- **Back-end:** npm run dev