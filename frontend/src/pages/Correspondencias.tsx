import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import './Moradores.css';
import '../theme.css';
import '../global-select.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface Correspondencia {
  id: string;
  unidade_id: string;
  destinatario: string;
  tipo: string;
  remetente?: string;
  descricao?: string;
  codigo_rastreio?: string;
  recebido_por: string;
  data_recebimento: string;
  status: string;
  entregue_para?: string;
  data_entrega?: string;
  entregue_por?: string;
  observacoes?: string;
}

const correspondenciasAPI = {
  list: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status_filter', status);
    const response = await fetch(`${API_BASE_URL}/correspondencias?${params}`);
    if (!response.ok) throw new Error('Erro ao buscar correspondências');
    return response.json();
  },
  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/correspondencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao registrar correspondência');
    return response.json();
  },
  entregar: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/correspondencias/${id}/entregar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao registrar entrega');
    return response.json();
  },
};

export default function Correspondencias() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showEntregaModal, setShowEntregaModal] = useState(false);
  const [selectedCorrespondencia, setSelectedCorrespondencia] = useState<Correspondencia | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState('');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState({
    unidade_id: '',
    destinatario: '',
    tipo: 'envelope',
    remetente: '',
    descricao: '',
    codigo_rastreio: '',
    recebido_por: '',
    observacoes: '',
  });

  const [entregaData, setEntregaData] = useState({
    entregue_para: '',
    entregue_por: '',
    observacoes: '',
  });

  // Aplicar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark-purple';
    document.body.className = `theme-${savedTheme}`;
  }, []);

  const { data: correspondencias = [] } = useQuery({
    queryKey: ['correspondencias', statusFilter],
    queryFn: () => correspondenciasAPI.list(statusFilter),
  });

  const { data: moradores = [] } = useQuery({
    queryKey: ['moradores-correspondencias'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/moradores`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: correspondenciasAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondencias'] });
      setShowModal(false);
      resetForm();
    },
  });

  const entregarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => correspondenciasAPI.entregar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondencias'] });
      setShowEntregaModal(false);
      setSelectedCorrespondencia(null);
      resetEntregaForm();
    },
  });

  const resetForm = () => {
    setFormData({
      unidade_id: '',
      destinatario: '',
      tipo: 'envelope',
      remetente: '',
      descricao: '',
      codigo_rastreio: '',
      recebido_por: '',
      observacoes: '',
    });
  };

  const resetEntregaForm = () => {
    setEntregaData({
      entregue_para: '',
      entregue_por: '',
      observacoes: '',
    });
    setSignature('');
    clearCanvas();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEntrega = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCorrespondencia) return;

    entregarMutation.mutate({
      id: selectedCorrespondencia.id,
      data: {
        ...entregaData,
        assinatura_base64: signature,
      },
    });
  };

  const handleOpenEntrega = (corresp: Correspondencia) => {
    setSelectedCorrespondencia(corresp);
    setShowEntregaModal(true);
  };

  // Canvas signature functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; class: string }> = {
      aguardando_retirada: { text: '⏳ Aguardando', class: 'status-pendente' },
      entregue: { text: '✅ Entregue', class: 'status-autorizada' },
      devolvida: { text: '↩️ Devolvida', class: 'status-negada' },
      nao_retirada: { text: '❌ Não Retirada', class: 'status-cancelada' },
    };
    return badges[status] || { text: status, class: '' };
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      carta: '✉️',
      envelope: '📧',
      caixa_pequena: '📦',
      caixa_media: '📦',
      caixa_grande: '📦',
      sedex: '🚚',
      telegrama: '📄',
      notificacao: '📋',
    };
    return icons[tipo] || '📬';
  };

  return (
    <div className="page-container">
      <button onClick={() => navigate('/dashboard')} className="btn-back">
        ⬅️ Voltar
      </button>

      <div className="content-card">
        <div className="page-header">
          <div>
            <h1>📬 Correspondências</h1>
            <p>Gerenciamento de encomendas e correspondências</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            ➕ Registrar Recebimento
          </button>
        </div>

        <div className="filters" style={{ marginBottom: '20px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">🔍 Todos os status</option>
            <option value="aguardando_retirada">⏳ Aguardando Retirada</option>
            <option value="entregue">✅ Entregue</option>
            <option value="devolvida">↩️ Devolvida</option>
            <option value="nao_retirada">❌ Não Retirada</option>
          </select>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Destinatário</th>
                <th>Remetente</th>
                <th>Recebido em</th>
                <th>Status</th>
                <th>Entregue para</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {correspondencias.map((corresp: Correspondencia) => {
                const statusBadge = getStatusBadge(corresp.status);
                return (
                  <tr key={corresp.id}>
                    <td>
                      {getTipoIcon(corresp.tipo)} {corresp.tipo.replace('_', ' ')}
                    </td>
                    <td>
                      <strong>{corresp.destinatario}</strong>
                    </td>
                    <td>{corresp.remetente || '-'}</td>
                    <td>{new Date(corresp.data_recebimento).toLocaleString('pt-BR')}</td>
                    <td>
                      <span className={`status-badge ${statusBadge.class}`}>{statusBadge.text}</span>
                    </td>
                    <td>{corresp.entregue_para || '-'}</td>
                    <td>
                      {corresp.status === 'aguardando_retirada' && (
                        <button
                          onClick={() => handleOpenEntrega(corresp)}
                          className="btn-success"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          📝 Registrar Entrega
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Correspondência */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📬 Registrar Correspondência Recebida</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label>🏠 Morador / Unidade *</label>
                  <select
                    value={formData.unidade_id}
                    onChange={(e) => {
                      const morador = moradores.find((m: any) => m.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        unidade_id: e.target.value,
                        destinatario: morador?.nome_completo || ''
                      });
                    }}
                    required
                  >
                    <option value="">Selecione o morador</option>
                    {moradores.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.nome_completo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>👤 Destinatário *</label>
                  <input
                    type="text"
                    value={formData.destinatario}
                    onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>📦 Tipo *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                  >
                    <option value="carta">✉️ Carta</option>
                    <option value="envelope">📧 Envelope</option>
                    <option value="caixa_pequena">📦 Caixa Pequena</option>
                    <option value="caixa_media">📦 Caixa Média</option>
                    <option value="caixa_grande">📦 Caixa Grande</option>
                    <option value="sedex">🚚 Sedex</option>
                    <option value="telegrama">📄 Telegrama</option>
                    <option value="notificacao">📋 Notificação</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>📤 Remetente</label>
                  <input
                    type="text"
                    value={formData.remetente}
                    onChange={(e) => setFormData({ ...formData, remetente: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>📝 Descrição</label>
                  <input
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>🔢 Código de Rastreio</label>
                  <input
                    type="text"
                    value={formData.codigo_rastreio}
                    onChange={(e) => setFormData({ ...formData, codigo_rastreio: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>👮 Recebido por (Porteiro) *</label>
                <input
                  type="text"
                  value={formData.recebido_por}
                  onChange={(e) => setFormData({ ...formData, recebido_por: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>💬 Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  ✅ Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Entrega */}
      {showEntregaModal && selectedCorrespondencia && (
        <div className="modal-overlay" onClick={() => setShowEntregaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>📝 Registrar Entrega</h2>
              <button onClick={() => setShowEntregaModal(false)} className="btn-close">
                ✕
              </button>
            </div>

            <form onSubmit={handleEntrega} className="form">
              <div className="form-group">
                <label>📦 Correspondência</label>
                <input type="text" value={selectedCorrespondencia.destinatario} disabled />
              </div>

              <div className="form-group">
                <label>👤 Entregue para (Nome de quem recebeu) *</label>
                <input
                  type="text"
                  value={entregaData.entregue_para}
                  onChange={(e) => setEntregaData({ ...entregaData, entregue_para: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>👮 Entregue por (Porteiro) *</label>
                <input
                  type="text"
                  value={entregaData.entregue_por}
                  onChange={(e) => setEntregaData({ ...entregaData, entregue_por: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>✍️ Assinatura Digital</label>
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    cursor: 'crosshair',
                    backgroundColor: 'white',
                  }}
                />
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="btn-secondary"
                  style={{ marginTop: '10px', fontSize: '12px' }}
                >
                  🗑️ Limpar Assinatura
                </button>
              </div>

              <div className="form-group">
                <label>💬 Observações</label>
                <textarea
                  value={entregaData.observacoes}
                  onChange={(e) => setEntregaData({ ...entregaData, observacoes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEntregaModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-success">
                  ✅ Confirmar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
