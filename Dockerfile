# Estágio de Build
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos essenciais primeiro para cache das dependências
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/rules/package.json ./packages/rules/
COPY services/api/package.json ./services/api/
COPY services/worker/package.json ./services/worker/
COPY apps/web/package.json ./apps/web/

# Instala as dependências
RUN npm ci

# Copia todo o código-fonte restante
COPY . .

# Faz o build de todos os projetos (Shared, Rules, API, Worker, Web)
RUN npm run build --workspaces --if-present

# --- Estágio de Produção ---
FROM node:20-alpine AS runner

WORKDIR /app

# Copia todo o app construído da etapa de build
COPY --from=builder /app /app

# Define a variável de ambiente para produção
ENV NODE_ENV=production

# Expõe a porta que a API usa
EXPOSE 3001
