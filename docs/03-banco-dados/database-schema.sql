-- =====================================================
-- SISTEMA DE PORTARIA INTELIGENTE - DATABASE SCHEMA
-- PostgreSQL 15+
-- Versão: 1.0.0
-- Data: Dezembro 2025
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca textual

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE tipo_usuario AS ENUM ('super_admin', 'admin_condominio', 'sindico', 'porteiro', 'morador', 'visitante');
CREATE TYPE status_geral AS ENUM ('ativo', 'inativo', 'bloqueado', 'suspenso');
CREATE TYPE tipo_vinculo AS ENUM ('proprietario', 'inquilino', 'familiar', 'comodato');
CREATE TYPE tipo_visitante AS ENUM ('comum', 'recorrente', 'prestador', 'entregador');
CREATE TYPE tipo_correspondencia AS ENUM ('encomenda', 'carta', 'documento', 'revista', 'cartao', 'presente', 'perecivel');
CREATE TYPE tipo_veiculo AS ENUM ('carro', 'moto', 'bicicleta', 'van', 'caminhonete', 'outro');
CREATE TYPE tipo_evento AS ENUM ('ocorrencia', 'incidente', 'manutencao', 'emergencia', 'outro');

-- =====================================================
-- TABELA: condominios
-- =====================================================

CREATE TABLE condominios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    endereco TEXT NOT NULL,
    cidade VARCHAR(100),
    estado CHAR(2),
    cep VARCHAR(9),
    telefone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    total_unidades INTEGER DEFAULT 0,
    total_vagas INTEGER DEFAULT 0,
    configuracoes JSONB DEFAULT '{}', -- Configurações personalizadas
    status status_geral DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_condominios_cnpj ON condominios(cnpj);
CREATE INDEX idx_condominios_status ON condominios(status);

-- =====================================================
-- TABELA: unidades
-- =====================================================

CREATE TABLE unidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    numero VARCHAR(20) NOT NULL, -- Ex: 302, 101-A
    bloco VARCHAR(10),
    andar INTEGER,
    tipo VARCHAR(50), -- Apartamento, Casa, Sala Comercial
    area_m2 DECIMAL(10,2),
    quartos INTEGER,
    vagas_garagem INTEGER DEFAULT 0,
    status status_geral DEFAULT 'ativo',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(condominio_id, numero, bloco)
);

CREATE INDEX idx_unidades_condominio ON unidades(condominio_id);
CREATE INDEX idx_unidades_numero ON unidades(numero);

-- =====================================================
-- TABELA: usuarios (sistema)
-- =====================================================

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominio_id UUID REFERENCES condominios(id) ON DELETE SET NULL,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    foto_url TEXT,
    tipo tipo_usuario NOT NULL,
    mfa_habilitado BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    ultimo_login TIMESTAMP,
    status status_geral DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_condominio ON usuarios(condominio_id);

-- =====================================================
-- TABELA: moradores
-- =====================================================

CREATE TABLE moradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    orgao_emissor VARCHAR(10),
    data_nascimento DATE,
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    foto_url TEXT,
    foto_facial_1_url TEXT,
    foto_facial_2_url TEXT,
    vetor_facial JSONB, -- Dados biométricos
    pin_acesso VARCHAR(6), -- PIN numérico
    qr_code_hash VARCHAR(255) UNIQUE,
    rfid_code VARCHAR(100) UNIQUE,
    status status_geral DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_moradores_cpf ON moradores(cpf);
CREATE INDEX idx_moradores_condominio ON moradores(condominio_id);
CREATE INDEX idx_moradores_qr_code ON moradores(qr_code_hash);
CREATE INDEX idx_moradores_nome ON moradores USING gin(nome_completo gin_trgm_ops);

-- =====================================================
-- TABELA: morador_unidade (relacionamento N:N)
-- =====================================================

CREATE TABLE morador_unidade (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    morador_id UUID NOT NULL REFERENCES moradores(id) ON DELETE CASCADE,
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    tipo_vinculo tipo_vinculo DEFAULT 'proprietario',
    data_inicio DATE NOT NULL,
    data_termino DATE,
    pode_autorizar_visitantes BOOLEAN DEFAULT TRUE,
    pode_receber_correspondencias BOOLEAN DEFAULT TRUE,
    pode_cadastrar_veiculos BOOLEAN DEFAULT TRUE,
    status status_geral DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(morador_id, unidade_id)
);

CREATE INDEX idx_morador_unidade_morador ON morador_unidade(morador_id);
CREATE INDEX idx_morador_unidade_unidade ON morador_unidade(unidade_id);

-- =====================================================
-- TABELA: dependentes
-- =====================================================

CREATE TABLE dependentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    morador_responsavel_id UUID NOT NULL REFERENCES moradores(id) ON DELETE CASCADE,
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    parentesco VARCHAR(50),
    data_nascimento DATE,
    cpf VARCHAR(14) UNIQUE,
    foto_url TEXT,
    restringe_saida_sem_autorizacao BOOLEAN DEFAULT FALSE,
    horario_inicio_permitido TIME,
    horario_fim_permitido TIME,
    status status_geral DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dependentes_morador ON dependentes(morador_responsavel_id);
CREATE INDEX idx_dependentes_unidade ON dependentes(unidade_id);

-- =====================================================
-- TABELA: visitantes
-- =====================================================

CREATE TABLE visitantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    foto_url TEXT,
    vetor_facial JSONB,
    placa_veiculo VARCHAR(10),
    tipo_visitante tipo_visitante DEFAULT 'comum',
    status status_geral DEFAULT 'ativo',
    motivo_bloqueio TEXT,
    total_visitas INTEGER DEFAULT 0,
    data_primeira_visita TIMESTAMP,
    data_ultima_visita TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visitantes_condominio ON visitantes(condominio_id);
CREATE INDEX idx_visitantes_cpf ON visitantes(cpf);
CREATE INDEX idx_visitantes_nome ON visitantes USING gin(nome_completo gin_trgm_ops);

-- =====================================================
-- TABELA: visitas (registros de acesso)
-- =====================================================

CREATE TABLE visitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitante_id UUID NOT NULL REFERENCES visitantes(id) ON DELETE CASCADE,
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    morador_autorizador_id UUID REFERENCES moradores(id),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    qr_code_hash VARCHAR(255),
    pre_cadastrado BOOLEAN DEFAULT FALSE,
    data_hora_entrada TIMESTAMP NOT NULL DEFAULT NOW(),
    data_hora_saida TIMESTAMP,
    tempo_permanencia INTERVAL,
    foto_entrada_url TEXT,
    foto_saida_url TEXT,
    metodo_identificacao VARCHAR(50), -- qr_code, documento, facial, manual
    porteiro_entrada_id UUID REFERENCES usuarios(id),
    porteiro_saida_id UUID REFERENCES usuarios(id),
    veiculo_placa VARCHAR(10),
    veiculo_modelo VARCHAR(100),
    veiculo_cor VARCHAR(50),
    observacoes_entrada TEXT,
    observacoes_saida TEXT,
    status VARCHAR(30) DEFAULT 'aguardando', -- aguardando, dentro, saiu, negado
    data_autorizacao TIMESTAMP,
    canal_autorizacao VARCHAR(30), -- app, whatsapp, sms, telefone
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visitas_visitante ON visitas(visitante_id);
CREATE INDEX idx_visitas_unidade ON visitas(unidade_id);
CREATE INDEX idx_visitas_entrada ON visitas(data_hora_entrada);
CREATE INDEX idx_visitas_status ON visitas(status);
CREATE INDEX idx_visitas_condominio ON visitas(condominio_id);

-- =====================================================
-- TABELA: visitantes_recorrentes
-- =====================================================

CREATE TABLE visitantes_recorrentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitante_id UUID NOT NULL REFERENCES visitantes(id) ON DELETE CASCADE,
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    morador_id UUID NOT NULL REFERENCES moradores(id) ON DELETE CASCADE,
    tipo_servico VARCHAR(100), -- diarista, personal, professor, cuidador
    dias_semana INTEGER[], -- 0=Domingo, 1=Segunda, ..., 6=Sábado
    horario_inicio TIME,
    horario_fim TIME,
    data_inicio_validade DATE NOT NULL,
    data_fim_validade DATE,
    requer_autorizacao_sempre BOOLEAN DEFAULT FALSE,
    status status_geral DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visitantes_recorrentes_visitante ON visitantes_recorrentes(visitante_id);
CREATE INDEX idx_visitantes_recorrentes_unidade ON visitantes_recorrentes(unidade_id);

-- =====================================================
-- TABELA: correspondencias
-- =====================================================

CREATE TABLE correspondencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    tipo tipo_correspondencia DEFAULT 'encomenda',
    tamanho CHAR(2) CHECK (tamanho IN ('P', 'M', 'G', 'GG')),
    peso_estimado DECIMAL(10,2), -- em kg
    remetente VARCHAR(255),
    codigo_rastreio VARCHAR(100),
    transportadora VARCHAR(100),
    foto_frontal_url TEXT NOT NULL,
    foto_lateral_url TEXT,
    foto_rastreio_url TEXT,
    foto_protocolo_url TEXT,
    data_hora_recebimento TIMESTAMP NOT NULL DEFAULT NOW(),
    porteiro_recebimento_id UUID REFERENCES usuarios(id),
    data_hora_retirada TIMESTAMP,
    retirado_por_nome VARCHAR(255),
    retirado_por_cpf VARCHAR(14),
    retirado_por_relacao VARCHAR(50), -- morador, conjuge, filho, autorizado
    assinatura_digital_url TEXT,
    porteiro_entrega_id UUID REFERENCES usuarios(id),
    status VARCHAR(30) DEFAULT 'pendente', -- pendente, retirado, devolvido, abandonado
    prateleira_localizacao VARCHAR(50),
    observacoes TEXT,
    valor_declarado DECIMAL(10,2),
    urgente BOOLEAN DEFAULT FALSE,
    notificacao_enviada BOOLEAN DEFAULT FALSE,
    data_notificacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_correspondencias_unidade ON correspondencias(unidade_id);
CREATE INDEX idx_correspondencias_status ON correspondencias(status);
CREATE INDEX idx_correspondencias_recebimento ON correspondencias(data_hora_recebimento);
CREATE INDEX idx_correspondencias_codigo ON correspondencias(codigo_rastreio);

-- =====================================================
-- TABELA: veiculos
-- =====================================================

CREATE TABLE veiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    placa VARCHAR(10) UNIQUE NOT NULL,
    placa_normalizada VARCHAR(10), -- Sem hífen/espaços
    tipo tipo_veiculo DEFAULT 'carro',
    marca VARCHAR(100),
    modelo VARCHAR(100),
    cor VARCHAR(50),
    ano INTEGER,
    foto_frontal_url TEXT,
    foto_lateral_url TEXT,
    foto_placa_url TEXT,
    renavam VARCHAR(20),
    chassi VARCHAR(20),
    status status_geral DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_veiculos_placa ON veiculos(placa_normalizada);
CREATE INDEX idx_veiculos_condominio ON veiculos(condominio_id);

-- =====================================================
-- TABELA: veiculo_unidade
-- =====================================================

CREATE TABLE veiculo_unidade (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    veiculo_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    tipo_vinculo VARCHAR(50) DEFAULT 'proprietario',
    data_inicio DATE NOT NULL,
    data_termino DATE,
    vaga_fixa_numero VARCHAR(20),
    vaga_fixa_andar INTEGER,
    status status_geral DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_veiculo_unidade_veiculo ON veiculo_unidade(veiculo_id);
CREATE INDEX idx_veiculo_unidade_unidade ON veiculo_unidade(unidade_id);

-- =====================================================
-- TABELA: acessos_veiculares
-- =====================================================

CREATE TABLE acessos_veiculares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    veiculo_id UUID REFERENCES veiculos(id) ON DELETE SET NULL,
    unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    placa_detectada VARCHAR(10) NOT NULL,
    tipo_acesso VARCHAR(10) CHECK (tipo_acesso IN ('entrada', 'saida')),
    data_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    metodo VARCHAR(30), -- ocr, manual, qr_code
    porteiro_id UUID REFERENCES usuarios(id),
    portao_cancela VARCHAR(100),
    foto_veiculo_url TEXT,
    placa_detectada_ocr VARCHAR(10),
    confianca_ocr INTEGER, -- 0-100
    corrigido_manualmente BOOLEAN DEFAULT FALSE,
    ocupantes_quantidade INTEGER,
    observacoes TEXT,
    tempo_permanencia INTERVAL, -- Calculado na saída
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_acessos_veiculares_veiculo ON acessos_veiculares(veiculo_id);
CREATE INDEX idx_acessos_veiculares_data ON acessos_veiculares(data_hora);
CREATE INDEX idx_acessos_veiculares_placa ON acessos_veiculares(placa_detectada);

-- =====================================================
-- TABELA: porteiros
-- =====================================================

CREATE TABLE porteiros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    foto_url TEXT,
    pin_acesso VARCHAR(6),
    data_admissao DATE,
    status status_geral DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_porteiros_usuario ON porteiros(usuario_id);
CREATE INDEX idx_porteiros_condominio ON porteiros(condominio_id);

-- =====================================================
-- TABELA: turnos
-- =====================================================

CREATE TABLE turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    porteiro_id UUID NOT NULL REFERENCES porteiros(id) ON DELETE CASCADE,
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    data_fim DATE,
    hora_fim TIME,
    total_horas INTERVAL,
    observacoes TEXT,
    status VARCHAR(30) DEFAULT 'em_andamento', -- em_andamento, finalizado
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_turnos_porteiro ON turnos(porteiro_id);
CREATE INDEX idx_turnos_data ON turnos(data_inicio);

-- =====================================================
-- TABELA: eventos_portaria
-- =====================================================

CREATE TABLE eventos_portaria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominio_id UUID NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    porteiro_id UUID REFERENCES porteiros(id),
    turno_id UUID REFERENCES turnos(id),
    tipo tipo_evento DEFAULT 'ocorrencia',
    descricao TEXT NOT NULL,
    unidade_id UUID REFERENCES unidades(id),
    gravidade VARCHAR(20) CHECK (gravidade IN ('baixa', 'media', 'alta', 'critica')),
    foto_url TEXT,
    video_url TEXT,
    notificados UUID[], -- Array de user_ids notificados
    data_hora_evento TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_eventos_portaria_condominio ON eventos_portaria(condominio_id);
CREATE INDEX idx_eventos_portaria_data ON eventos_portaria(data_hora_evento);
CREATE INDEX idx_eventos_portaria_tipo ON eventos_portaria(tipo);

-- =====================================================
-- TABELA: logs_auditoria (imutável)
-- =====================================================

CREATE TABLE logs_auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id),
    condominio_id UUID REFERENCES condominios(id),
    acao VARCHAR(255) NOT NULL,
    recurso VARCHAR(100) NOT NULL, -- moradores, visitantes, veiculos, etc.
    recurso_id UUID,
    detalhes JSONB,
    ip_address INET,
    user_agent TEXT,
    hash_anterior VARCHAR(64), -- Hash do log anterior (blockchain-like)
    hash_atual VARCHAR(64) NOT NULL, -- SHA-256 do próprio registro
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_recurso ON logs_auditoria(recurso, recurso_id);
CREATE INDEX idx_logs_timestamp ON logs_auditoria(timestamp);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas relevantes
CREATE TRIGGER trigger_moradores_updated_at BEFORE UPDATE ON moradores
FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_usuarios_updated_at BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_veiculos_updated_at BEFORE UPDATE ON veiculos
FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- Função para calcular tempo de permanência
CREATE OR REPLACE FUNCTION calcular_permanencia()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.data_hora_saida IS NOT NULL AND OLD.data_hora_saida IS NULL THEN
        NEW.tempo_permanencia = NEW.data_hora_saida - NEW.data_hora_entrada;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_visitas_permanencia BEFORE UPDATE ON visitas
FOR EACH ROW EXECUTE FUNCTION calcular_permanencia();

CREATE TRIGGER trigger_acessos_permanencia BEFORE UPDATE ON acessos_veiculares
FOR EACH ROW EXECUTE FUNCTION calcular_permanencia();

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Moradores com suas unidades
CREATE VIEW vw_moradores_unidades AS
SELECT 
    m.id AS morador_id,
    m.nome_completo,
    m.cpf,
    m.telefone,
    m.status AS morador_status,
    u.id AS unidade_id,
    u.numero AS unidade_numero,
    u.bloco,
    mu.tipo_vinculo,
    mu.data_inicio,
    mu.data_termino,
    c.nome AS condominio_nome
FROM moradores m
JOIN morador_unidade mu ON m.id = mu.morador_id
JOIN unidades u ON mu.unidade_id = u.id
JOIN condominios c ON u.condominio_id = c.id
WHERE m.status = 'ativo' AND mu.status = 'ativo';

-- View: Visitantes dentro do condomínio agora
CREATE VIEW vw_visitantes_dentro AS
SELECT 
    vis.id AS visita_id,
    v.nome_completo AS visitante_nome,
    u.numero AS unidade,
    vis.data_hora_entrada,
    NOW() - vis.data_hora_entrada AS tempo_dentro,
    m.nome_completo AS autorizador,
    vis.veiculo_placa
FROM visitas vis
JOIN visitantes v ON vis.visitante_id = v.id
JOIN unidades u ON vis.unidade_id = u.id
LEFT JOIN moradores m ON vis.morador_autorizador_id = m.id
WHERE vis.status = 'dentro' AND vis.data_hora_saida IS NULL;

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir Super Admin
INSERT INTO usuarios (nome_completo, email, senha_hash, tipo, status)
VALUES ('Super Admin', 'admin@portaria.com', '$2b$12$LQ...', 'super_admin', 'ativo');

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
