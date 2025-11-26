# Sabor na Nuvem - Frontend White Label para Redes de Fast Food

> ⚠️ **Aviso de Propriedade Intelectual**
>
> Este é um projeto de código-fonte fechado desenvolvido para fins de portfólio. O código está disponível publicamente para demonstrar minhas habilidades técnicas e arquiteturais. A licença deste repositório **não permite** o uso, cópia, modificação ou distribuição do código para fins comerciais. Por favor, consulte o arquivo `LICENSE` para mais detalhes.

---

## 📄 Sobre o projeto

**Sabor na Nuvem** é uma plataforma white label projetada para atender às necessidades de redes de fast food. A solução permite que diferentes marcas personalizem e gerenciem suas operações de venda, incluindo cardápios, lojas, pedidos e clientes, tudo através de uma infraestrutura centralizada e robusta.

Este repositório contém o código-fonte do Frontend.

---

## 🛠️ Tecnologias utilizadas

O projeto foi construído como um **SPA (Single Page Application)**, focando em performance e manutenção:

- **Framework:** **React** (v19, com `prop-types` para validação)

- **Roteamento:** `react-router-dom`

- **Build Tool:** Vite

- **Comunicação API:** Axios

- **Geolocalização/Mapas:** **Leaflet** e **`react-leaflet`** (Para exibição e interação com mapas, crucial para localizar lojas ou áreas de entrega).

- **Estilização/Ícones:** `react-icons`

- **Qualidade:** ESLint, Prettier (Para manter o código padronizado).

---

## 🔗 Links de Acesso Rápido (Deploy)

O frontend está implantado na CDN do **Vercel** e se conecta à **API no Render**.

| Recurso          | URL                                           | Observação           |
| :--------------- | :-------------------------------------------- | :------------------- |
| **Frontend URL** | `https://sabor-na-nuvem-frontend.vercel.app`  | Aplicação principal. |
| **API Base URL** | `https://sabor-na-nuvem-api.onrender.com/api` | Backend no Render.   |

---

## ☁️ Arquitetura de Deploy (Produção)

O projeto usa uma arquitetura desagregada para máxima performance e baixo custo de manutenção, com o **Vercel** otimizado para servir o frontend estático.

1.  **Frontend (Vercel):** Hospeda os arquivos estáticos (HTML, CSS, JS) com roteamento configurado via `vercel.json` para suportar rotas de SPA (evitando o erro 404 ao recarregar).
2.  **Conexão:** O frontend se comunica com a **API no Render** através da variável de ambiente `VITE_API_URL`.
3.  **CD/CI:** O Vercel está configurado para **Continuous Deployment (CD)**, fazendo um novo build e deploy automaticamente após cada merge na branch `main`.

---

## ⚙️ Como rodar o ambiente de desenvolvimento

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.

### Pré-requisitos

- Node.js (v20.x ou superior)
- Git

### Passo a passo

1. **Realize o clone do projeto e entre na pasta criada**

```bash
git clone https://github.com/Sabor-na-Nuvem/sabor-na-nuvem-frontend.git
cd sabor-na-nuvem-frontend
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o seu `.env`**

   Crie o arquivo `.env` a partir do exemplo fornecido. Certifique-se de que a variável `VITE_API_URL` aponte para o seu ambiente local de desenvolvimento (se você estiver rodando a API localmente via Docker) ou para o seu deploy do Render.

```bash
cp .env.example .env
```

4. **Inicie o Frontend**

   Certifique-se de que a API de Backend está rodando (localmente ou no Render).

```bash
npm run dev
```

O frontend estará acessível em `http://localhost:5173`.

---

## 📄 Licença

© 2025 [João Matheus de Oliveira Schmitz]. Todos os direitos reservados.
