# Sistema PDV & Dashboard Gerencial (MVP)

Um sistema de Ponto de Venda (Frente de Caixa) completo desenvolvido para operações de fast-food (Hamburgueria), construído com arquitetura separada entre Frontend (React) e Backend (Node.js), conectado a um banco de dados relacional em nuvem.

O objetivo principal deste projeto é demonstrar a construção de um fluxo completo e seguro de transações comerciais, com foco em **Integridade de Dados** e **Qualidade de Software**.

## Tecnologias Utilizadas
- **Frontend:** React (Vite), JavaScript, CSS Flexbox
- **Backend:** Node.js, Express, CORS
- **Banco de Dados:** PostgreSQL hospedado na nuvem via [Neon.tech](https://neon.tech)

---

## Destaques Técnicos

### Engenharia de Dados & Relatórios
Para transformar dados brutos em inteligência de negócio, o sistema conta com um Painel de Métricas (Dashboard) em tempo real:
- **Processamento no Banco:** Utilização de funções nativas de agregação do SQL (`SUM`, `COUNT`, `AVG`) para delegar o esforço computacional ao servidor de banco de dados.
- **Tratamento de Nulos:** Aplicação da função `COALESCE` para garantir estabilidade do Dashboard e evitar retornos nulos quando não há vendas no dia.
- **Conexão em Nuvem:** Gerenciamento eficiente de pools de conexão com o PostgreSQL, aproveitando o recurso *Scale-to-Zero* da plataforma Neon.

### Qualidade de Software (QA) & Prevenção de Falhas
O desenvolvimento priorizou a segurança e a blindagem contra erros operacionais:
- **Validação de Preços no Backend (Zero-Trust Frontend):** O sistema não confia nos valores totais calculados pela interface. O Node.js intercepta o pacote de dados e recalcula o carrinho realizando uma query de validação de preços na tabela de produtos, evitando fraudes ou injeções via navegador.
- **Transações SQL (ACID):** O fluxo de salvamento do pedido utiliza os comandos `BEGIN`, `COMMIT` e `ROLLBACK`. Isso garante que o cabeçalho do pedido e os itens do carrinho sejam salvos em uma única transação atômica. Em caso de falha de conexão, a transação é desfeita, impedindo a geração de dados "órfãos" ou corrompidos.
- **Bloqueio de Estado Visual:** Implementação de travas de cliques no React (botão desabilitado durante o tráfego de rede) com feedback visual, prevenindo envio de requisições duplicadas por operadores sob conexão lenta.

---

##  Como Rodar Localmente

Para rodar o projeto em sua máquina local, você precisará configurar as variáveis de ambiente e rodar os dois servidores.

**1. Backend:**
Na pasta raiz do projeto, crie um arquivo `.env` contendo a sua string de conexão:
`DATABASE_URL=postgresql://usuario:senha@seu-host.neon.tech/neondb`