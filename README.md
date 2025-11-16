# 📓 Diário de Treinos --- Aplicação Full-Stack

Aplicação web Full-Stack desenvolvida como projeto final do Programa de
Trainees **2025.2 da Comp Junior (UFLA)**.\
O sistema permite ao usuário **gerenciar suas fichas de treino e
exercícios**, com autenticação segura, CRUD completo e uma API
profissional estruturada com boas práticas.

---

## 📖 Sobre o Projeto

Este projeto foi construído seguindo o cronograma e os requisitos das
trilhas de **Back-end** e **Front-end**, resultando em uma aplicação
moderna, funcional e totalmente integrada.

A aplicação oferece:

- Registro e login com autenticação via **JWT**\
- Recuperação de senha via e-mail (Mailtrap)\
- CRUD completo de **FichaTreino** e **Exercicio**\
- Rotas protegidas e nível de permissão (`admin` e `padrao`)\
- Dashboard intuitivo para visualizar e editar treinos\
- Interface reativa desenvolvida com React

---

## 🚀 Funcionalidades Implementadas

- **Autenticação Segura** -- Registro, login e recuperação de senha\
- **Gerenciamento de Treinos** -- Criar, editar e excluir fichas\
- **Gerenciamento de Exercícios** -- Adicionar, editar e remover
  exercícios\
- **Níveis de Usuário** -- Rotas exclusivas para administradores\
- **Fluxo Completo de Front-end** -- Rotas protegidas, interceptores e
  estado global\
- **Responsividade** -- Interface adaptada para telas maiores e
  menores

---

## 🛠️ Tecnologias Utilizadas

### Back-End

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### Front-End

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React
Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### Infraestrutura

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![Insomnia](https://img.shields.io/badge/Insomnia-4000BF?style=for-the-badge&logo=insomnia&logoColor=white)

---

## 🧱 Arquitetura

Camada Ferramenta

---

**Back-End (API)** Node.js, Express, JWT, Prisma, PostgreSQL
**Front-End** React.js, React Router, Axios
**Banco de Dados** PostgreSQL (via Docker)
**Testes de API** Insomnia
**ORM** Prisma
**Deploy local** Docker Compose

---

## ⚙️ Como Executar o Projeto

### **1. Clonar o Repositório**

```bash
git clone https://github.com/DamasoRafael/diario-de-treinos-fullstack.git
cd diario-de-treinos-fullstack
```

---

### **2. Configurar Variáveis de Ambiente (backend/.env)**

Crie o arquivo `.env` dentro da pasta **backend**:

```env
DATABASE_URL="postgresql://rafael:minhasenhasecreta@localhost:5432/diariotreino"
JWT_SECRET="SEU_SEGREDO_SUPER_SECRETO_AQUI"

MAIL_HOST="smtp.mailtrap.io"
MAIL_PORT=2525
MAIL_USER="SEU_USER_DO_MAILTRAP_AQUI"
MAIL_PASS="SUA_SENHA_DO_MAILTRAP_AQUI"
```

---

### **3. Instalar Dependências**

**Back-end**

```bash
cd backend
npm install
```

**Front-end**

```bash
cd ../frontend
npm install
```

---

### **4. Iniciar o Banco com Docker**

Na raiz do projeto:

```bash
docker-compose up -d db
```

Aguarde cerca de **20 segundos** até o PostgreSQL iniciar.

---

### **5. Rodar as Migrações do Prisma**

```bash
cd backend
npx prisma migrate dev
```

---

### **6. Iniciar Back-end e Front-end**

**Back-end**

```bash
cd backend
node src/server.js
```

Servidor: **http://localhost:3333**

**Front-end**

```bash
cd frontend
npm start
```

Aplicação: **http://localhost:3000**

---

## 🧠 Desafios e Aprendizados

- Problemas causados por sincronização com **OneDrive**, afetando
  `.env` e permissões\
- Conflitos de volume no Docker ao usar `postgres:latest`\
- Correção ao fixar versão do banco: `postgres:16-alpine`\
- Uso de comandos de diagnóstico: `docker logs`, `docker ps`\
- Entendimento mais profundo de ambiente de desenvolvimento Full-Stack

---

## 📌 Melhorias Futuras

- Testes automatizados (Jest + SuperTest)\
- Upload de imagens (Cloudinary)\
- Melhor responsividade\
- Dark Mode\
- Organização visual avançada do dashboard

---

## 👨‍💻 Desenvolvido por

**Rafael Rabelo Pereira Damaso**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rafael-damaso-26b678284/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/DamasoRafael)
