# Admin Frontend (ly-admin)

Painel administrativo do desafio. Responsável pela gestão de clientes, visualização e emissão de cobranças através de uma interface web fluida e moderna.

---

## 1. Arquitetura e Tecnologias

- **Framework**: Angular 22 (Standalone)
- **Linguagem**: TypeScript
- **Design System**: Spartan UI & Tailwind CSS
- **Testes**: Vitest (Unitários)

---

## 2. Requisitos Atendidos

- **Painel de Controle**: Dashboard interativo.
- **Gestão de Clientes**: Formulário responsivo de cadastro.
- **Cobranças**: Emissão e pagamentos multimeios (PIX, Boleto, Cartão de Crédito).
- **Notificações**: Alertas em tempo real (ngx-sonner).

---

## 3. Estrutura de Testes

Os testes unitários utilizam padrões modernos com a suíte Vitest (diferente do back-end, que utiliza Jest). Para os componentes, adotamos a abordagem do **`@testing-library/angular`** (orientada ao comportamento do usuário), garantindo testes resilientes e sem boilerplate excessivo.

---

## 4. Variáveis de Ambiente

As configurações da aplicação devem ser salvas no arquivo `.env`. As chaves necessárias para este projeto são:

- `APP_NAME`: Identificador da aplicação (`ly-admin`).
- `EXTERNAL_PORT`: Porta externa para acesso à interface.
- `API_PORT`: Porta interna do serviço.
- `ENVIRONMENT`: Ambiente de execução (`development` ou `production`).
- `DOCKER_SUFFIX`: Sufixo para identificação dos contêineres Docker (`dev` ou `deploy`).

---

## 5. Execução Local

### Pré-requisitos
- Node.js 20+
- Backend (`ly-services`) rodando na porta correta.

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento local
npm run dev

# 3. Rodar suíte de testes unitários
npm test
```
