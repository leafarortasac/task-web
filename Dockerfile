# Estágio 1: Build (Ambiente Node.js)
FROM node:20-alpine AS build
WORKDIR /app

# Instalação de dependências
# Copiamos apenas os arquivos de pacotes primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm install

# Copia o código fonte e gera o build de produção
COPY . .
RUN npm run build

# Estágio 2: Execução (Servidor Estático Nginx)
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Remove os arquivos padrão do Nginx
RUN rm -rf ./*

# Copia os arquivos estáticos gerados pelo Vite (pasta dist)
COPY --from=build /app/dist .

# Configuração de fuso horário para Manaus
RUN apk add --no-cache tzdata
ENV TZ=America/Manaus

# Expõe a porta do servidor web
EXPOSE 80

# O Nginx roda em foreground por padrão na imagem alpine
CMD ["nginx", "-g", "daemon off;"]