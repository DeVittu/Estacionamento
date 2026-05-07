# 🅿️ Reserva de Vagas — Sistema de Estacionamento para Eventos

Sistema web completo para reserva de vagas de estacionamento, desenvolvido com **Next.js 14 (App Router)** e **Supabase**.

---

## 🚀 Como rodar o projeto

### 1. Pré-requisitos

- Node.js 18+ instalado
- Conta gratuita no [Supabase](https://supabase.com)
- Conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)

---

### 2. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **SQL Editor** e execute o conteúdo do arquivo `supabase_migration.sql`
   - Isso cria a tabela `vagas` e insere 200 vagas automaticamente
3. Vá em **Project Settings → API** e copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 3. Configurar variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local

# Edite com suas credenciais do Supabase
nano .env.local
```

Conteúdo do `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxxxxxxxxxxxxxxx...
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxx...
NEXT_PUBLIC_MP_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxx...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MP_RESERVA_VALOR=20
RESERVA_EXPIRA_MINUTOS=15
CHECKIN_PASSWORD=senha-forte-do-checkin
CHECKIN_SESSION_SECRET=segredo-longo-aleatorio
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL=https://www.google.com/maps/embed?pb=...
```

`MP_ACCESS_TOKEN`, `CHECKIN_PASSWORD` e `CHECKIN_SESSION_SECRET` ficam somente no servidor. Use credenciais de teste primeiro; em produção, troque pelas credenciais reais no painel do Mercado Pago.

---

### 4. Instalar dependências e rodar

```bash
npm install
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx          # Layout raiz
│   ├── globals.css         # Estilos globais
│   ├── page.tsx            # Página inicial (reserva automática)
│   ├── checkin/
│   │   └── page.tsx        # Painel de check-in (admin)
│   ├── pagamento/
│   │   ├── sucesso/page.tsx
│   │   ├── falha/page.tsx
│   │   └── pendente/page.tsx
│   └── api/
│       ├── reservar/
│       │   └── route.ts    # POST /api/reservar
│       └── checkin/
│           └── route.ts    # POST /api/checkin
├── components/
│   ├── ModalReserva.tsx    # Modal do formulário de reserva
│   ├── ConfirmacaoReserva.tsx  # Tela de confirmação com código
│   └── StatsBar.tsx        # Barra de estatísticas
└── lib/
    ├── supabase.ts         # Cliente do Supabase
    ├── vagas.ts            # Funções de acesso ao banco
    ├── mercadopago.ts      # Criação de preferência de pagamento
    └── utils.ts            # Tipos e gerador de código
```

---

## 🌐 Rotas da aplicação

| Rota        | Descrição                                |
|-------------|------------------------------------------|
| `/`         | Reserva automática de uma vaga disponível |
| `/checkin`  | Painel admin protegido por senha         |
| `/pagamento/sucesso` | Retorno de pagamento aprovado |
| `/pagamento/falha` | Retorno de pagamento recusado/cancelado |
| `/pagamento/pendente` | Retorno de pagamento pendente |
| `POST /api/reservar` | API de reserva e criação do checkout |
| `POST /api/checkin`  | API de confirmação de entrada  |

---

## 🎯 Funcionalidades

- Reserva automática de uma vaga disponível
- Formulário de reserva com nome e placa
- Checkout Pro do Mercado Pago com Pix e cartão
- Liberação automática de reservas pendentes expiradas
- **Código único de 6 caracteres** gerado automaticamente
- Proteção contra conflito de reserva simultânea
- **Página de check-in** com busca por código
- Proteção por senha no painel de check-in
- Confirmação de entrada (marca `usada = true`)
- Atualização automática a cada 30 segundos
- Barra de estatísticas em tempo real

---

## ☁️ Deploy na Vercel

```bash
# Instalar CLI da Vercel
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente na Vercel:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# MP_ACCESS_TOKEN
# NEXT_PUBLIC_MP_PUBLIC_KEY
# NEXT_PUBLIC_SITE_URL
# MP_RESERVA_VALOR
# RESERVA_EXPIRA_MINUTOS
# CHECKIN_PASSWORD
# CHECKIN_SESSION_SECRET
# NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL
```

Ou via interface web: [vercel.com](https://vercel.com) → Import Project → adicione as variáveis de ambiente no painel.

---

## 💳 Mercado Pago

O checkout usa o SDK oficial `mercadopago`.

Fluxo atual:
1. Usuário informa nome e placa.
2. O sistema atribui uma vaga disponível e marca como `pendente`.
3. A API cria uma preferência no Mercado Pago.
4. O usuário é redirecionado para pagar.
5. Após aprovação, volta para `/pagamento/sucesso`, a reserva vira `pago` e o código é exibido.

Reservas pendentes expiram automaticamente depois de `RESERVA_EXPIRA_MINUTOS` minutos. O padrão é 15 minutos.

O valor da reserva é definido por `MP_RESERVA_VALOR`, em reais. Exemplo: `20` para R$ 20,00.

O Pix aparece no Checkout Pro quando a conta Mercado Pago tem uma chave Pix cadastrada. Por padrão, o Checkout Pro oferece todos os meios disponíveis na conta, incluindo Pix, cartão e saldo Mercado Pago.

Para um projeto que já existe no Supabase, execute novamente `supabase_migration.sql` no SQL Editor para adicionar as colunas de pagamento/expiração. Durante testes, o arquivo também tem um `UPDATE` opcional comentado para liberar reservas antigas que ficaram presas.

---

## 🗄️ Schema do banco

```sql
CREATE TABLE vagas (
  id        INTEGER PRIMARY KEY,  -- número da vaga (1-200)
  reservada BOOLEAN DEFAULT FALSE, -- true = reservada
  nome      TEXT,                  -- nome do responsável
  placa     TEXT,                  -- placa do veículo
  codigo    TEXT,                  -- código único 6 chars
  usada     BOOLEAN DEFAULT FALSE, -- true = já fez check-in
  reservado_em TIMESTAMPTZ,        -- data da reserva pendente
  pagamento_status TEXT,           -- pendente / pago / cancelado
  mp_preference_id TEXT            -- preferência criada no Mercado Pago
);
```
