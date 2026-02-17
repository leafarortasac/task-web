Frontend Web - Task Management System 🌐

Esta é a interface web responsiva do ecossistema de gerenciamento de tarefas, desenvolvida com Vite.js e React. A aplicação foi projetada 

para oferecer uma experiência de utilizador fluida, com atualizações em tempo real e integração total com o núcleo de segurança (IAM).

🚀 Tecnologias e Ferramentas

React 18 & Vite: Build ultra-rápido e interface reativa.

Axios: Cliente HTTP com interceptores para gestão centralizada de tokens JWT.

MQTT.js: Integração com o broker Mosquitto para notificações em tempo real.

Lucide React: Biblioteca de ícones moderna e leve.

Tailwind CSS / Styled Components: Design responsivo e modular.

🛠️ Funcionalidades Implementadas

Dashboard de Métricas: Visualização rápida de tarefas pendentes, em andamento e concluídas.

Gestão de Tarefas (CRUD): Criação, edição, conclusão e exclusão de atividades.

Filtros Inteligentes: Listagem de tarefas com filtros dinâmicos por status e busca por texto.

Central de Notificações: Recebimento de alertas em tempo real via MQTT quando novas tarefas são atribuídas.

Sistema de Autenticação: Fluxo completo de Login e Registo integrado com o IAM Service.


📡 Integração com o Ecossistema

A aplicação comunica com os microsserviços através de variáveis de ambiente configuradas no Docker:

IAM API: Gestão de tokens e perfis.
Task API: Operações de persistência de dados.
Notification API: Api de notificações
MQTT Broker: Subscrição de tópicos para notificações push.

📦 Execução e Desenvolvimento

Via Docker (Recomendado)

O Frontend já está orquestrado no docker-compose.yml principal do projeto.

Bash
docker-compose up -d --build task-web

Desenvolvimento Local

Instale as dependências:

Bash
npm install
Configure o arquivo .env com os IPs dos serviços:

Snippet de código

VITE_API_IAM_URL=http://localhost:8080/v1

VITE_API_TASK_URL=http://localhost:8081/v1

VITE_NOTIFICATION_TASK_URL=http://localhost:8082/v1

VITE_MQTT_HOST=localhost

Inicie o servidor de desenvolvimento:

Bash
npm run dev
