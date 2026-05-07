-- ============================================================
-- Criação da tabela de vagas para o sistema de reserva
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS vagas (
  id       INTEGER PRIMARY KEY,
  reservada BOOLEAN  NOT NULL DEFAULT FALSE,
  nome     TEXT,
  placa    TEXT,
  codigo   TEXT,
  usada    BOOLEAN  NOT NULL DEFAULT FALSE,
  reservado_em TIMESTAMPTZ,
  pagamento_status TEXT CHECK (pagamento_status IN ('pendente', 'pago', 'cancelado')),
  mp_preference_id TEXT,
  mp_payment_id TEXT
);

-- Para projetos existentes, adiciona as colunas novas sem apagar dados.
ALTER TABLE vagas
  ADD COLUMN IF NOT EXISTS reservado_em TIMESTAMPTZ;

ALTER TABLE vagas
  ADD COLUMN IF NOT EXISTS pagamento_status TEXT
  CHECK (pagamento_status IN ('pendente', 'pago', 'cancelado'));

ALTER TABLE vagas
  ADD COLUMN IF NOT EXISTS mp_preference_id TEXT;

ALTER TABLE vagas
  ADD COLUMN IF NOT EXISTS mp_payment_id TEXT;

-- 2. Popular com 200 vagas (IDs 1 a 200)
INSERT INTO vagas (id, reservada, nome, placa, codigo, usada)
SELECT
  generate_series(1, 200) AS id,
  FALSE,
  NULL,
  NULL,
  NULL,
  FALSE
ON CONFLICT (id) DO NOTHING;

-- 3. Habilitar Row Level Security (RLS) — recomendado
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;

-- 4. Policy: leitura pública (qualquer um pode ver as vagas)
DROP POLICY IF EXISTS "vagas_select_public" ON vagas;

CREATE POLICY "vagas_select_public"
  ON vagas FOR SELECT
  USING (TRUE);

-- 5. Policy: atualização pública (necessário para reservar e checkin)
-- Atenção: em produção considere restringir com chave de serviço no backend
DROP POLICY IF EXISTS "vagas_update_public" ON vagas;

CREATE POLICY "vagas_update_public"
  ON vagas FOR UPDATE
  USING (TRUE)
  WITH CHECK (TRUE);

-- Opcional: liberar reservas pendentes antigas/manual durante testes.
-- UPDATE vagas
-- SET reservada = FALSE,
--     nome = NULL,
--     placa = NULL,
--     codigo = NULL,
--     usada = FALSE,
--     reservado_em = NULL,
--     pagamento_status = NULL,
--     mp_preference_id = NULL,
--     mp_payment_id = NULL
-- WHERE reservada = TRUE
--   AND usada = FALSE
--   AND (pagamento_status = 'pendente' OR pagamento_status IS NULL);

-- ============================================================
-- Verificação (opcional): ver as 10 primeiras vagas
-- SELECT * FROM vagas ORDER BY id LIMIT 10;
-- ============================================================
