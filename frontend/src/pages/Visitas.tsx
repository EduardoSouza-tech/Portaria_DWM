import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { visitasAPI, visitantesAPI, moradoresAPI } from '../api';
import '../pages/Moradores.css';
import '../theme.css';
import '../global-select.css';

export default function Visitas() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState<any>(null);
  const [formData, setFormData] = useState({
    visitante_id: '',
    unidade_id: '',
    motivo: '',
    validade_horas: 24
  });

  // Aplicar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark-purple';
    document.body.className = `theme-${savedTheme}`;
  }, []);

  // Carregar dados necessários
  const { data: visitas, isLoading } = useQuery({
    queryKey: ['visitas'],
    queryFn: () => visitasAPI.list(),
  });

  const { data: visitantes } = useQuery({
    queryKey: ['visitantes-select'],
    queryFn: visitantesAPI.list,
  });

  const { data: moradores } = useQuery({
    queryKey: ['moradores-select'],
    queryFn: moradoresAPI.list,
  });

  const createMutation = useMutation({
    mutationFn: visitasAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] });
      setShowModal(false);
      // Abrir QR Code automaticamente
      handleShowQRCode(data.id);
      alert('✅ Visita pré-cadastrada! QR Code gerado com sucesso!');
    },
    onError: (error: any) => {
      alert(`❌ Erro: ${error.response?.data?.detail || 'Erro ao criar visita'}`);
    }
  });

  const saidaMutation = useMutation({
    mutationFn: visitasAPI.registerSaida,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas'] });
      alert('✅ Saída registrada com sucesso!');
    },
    onError: (error: any) => {
      alert(`❌ Erro: ${error.response?.data?.detail || 'Erro ao registrar saída'}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visitante_id || !formData.unidade_id) {
      alert('Selecione visitante e unidade');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleShowQRCode = async (visitaId: string) => {
    try {
      const qrData = await visitasAPI.getQRCode(visitaId);
      setQRCodeData(qrData);
      setShowQRCode(true);
    } catch (error) {
      alert('❌ Erro ao gerar QR Code');
    }
  };

  const handleRegistrarSaida = (visitaId: string) => {
    if (confirm('Confirma o registro de saída deste visitante?')) {
      saidaMutation.mutate(visitaId);
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      'pendente': { text: '⏳ Pendente', class: 'inactive' },
      'autorizada': { text: '✅ Autorizada', class: 'active' },
      'dentro': { text: '🚪 Dentro', class: 'active' },
      'finalizada': { text: '✔️ Finalizada', class: 'inactive' },
      'negada': { text: '❌ Negada', class: 'inactive' },
      'cancelada': { text: '🚫 Cancelada', class: 'inactive' }
    };
    const badge = badges[status] || { text: status, class: '' };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ⬅️ Voltar
          </button>
          <h1>🎫 Visitas e QR Codes</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          🎫 Gerar QR Code
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="content-card">
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">Total de Visitas</span>
              <span className="stat-value">{visitas?.length || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Dentro Agora</span>
              <span className="stat-value" style={{ color: '#2ecc71' }}>
                {visitas?.filter((v: any) => v.status === 'dentro').length || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Autorizadas</span>
              <span className="stat-value" style={{ color: '#3498db' }}>
                {visitas?.filter((v: any) => v.status === 'autorizada').length || 0}
              </span>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Visitante</th>
                  <th>Unidade</th>
                  <th>Status</th>
                  <th>Data Entrada</th>
                  <th>Data Saída</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {visitas?.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      Nenhuma visita registrada
                    </td>
                  </tr>
                ) : (
                  visitas?.map((visita: any) => (
                    <tr key={visita.id}>
                      <td>{visita.visitante_id}</td>
                      <td>{visita.unidade_id}</td>
                      <td>{getStatusBadge(visita.status)}</td>
                      <td>{formatDateTime(visita.data_entrada)}</td>
                      <td>{formatDateTime(visita.data_saida)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {visita.qr_code && (
                            <button
                              onClick={() => handleShowQRCode(visita.id)}
                              className="btn-primary"
                              style={{ padding: '6px 12px', fontSize: '14px' }}
                            >
                              📱 QR Code
                            </button>
                          )}
                          {visita.status === 'dentro' && (
                            <button
                              onClick={() => handleRegistrarSaida(visita.id)}
                              className="btn-danger-small"
                            >
                              🚪 Saída
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Criação de Visita */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>🎫 Gerar QR Code para Visita</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '30px' }}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Visitante *</label>
                  <select
                    value={formData.visitante_id}
                    onChange={(e) => setFormData({...formData, visitante_id: e.target.value})}
                    required
                  >
                    <option value="">Selecione o visitante</option>
                    {visitantes?.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.nome_completo} - {v.numero_documento}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Unidade de Destino *</label>
                  <select
                    value={formData.unidade_id}
                    onChange={(e) => setFormData({...formData, unidade_id: e.target.value})}
                    required
                  >
                    <option value="">Selecione a unidade</option>
                    {moradores?.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        Morador: {m.nome_completo}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: '#888', marginTop: '5px' }}>Selecione pelo morador (unidade será vinculada)</small>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Motivo da Visita</label>
                  <input
                    type="text"
                    value={formData.motivo}
                    onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                    placeholder="Ex: Visita social, entrega, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Validade do QR Code (horas)</label>
                  <input
                    type="number"
                    value={formData.validade_horas}
                    onChange={(e) => setFormData({...formData, validade_horas: Number(e.target.value)})}
                    min="1"
                    max="168"
                  />
                  <small style={{ color: '#888', marginTop: '5px' }}>Máximo: 168 horas (7 dias)</small>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '20px 30px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Gerando...' : '🎫 Gerar QR Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal do QR Code */}
      {showQRCode && qrCodeData && (
        <div className="modal-overlay" onClick={() => setShowQRCode(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'center' }}>
            <div className="modal-header">
              <h2>📱 QR Code da Visita</h2>
              <button onClick={() => setShowQRCode(false)} className="btn-close">✕</button>
            </div>
            
            <div style={{ padding: '30px' }}>
              <img src={qrCodeData.qr_code_image} alt="QR Code" style={{ maxWidth: '100%', height: 'auto' }} />
              
              <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'left' }}>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#000' }}>
                  <strong>✅ Válido até:</strong> {new Date(qrCodeData.valido_ate).toLocaleString('pt-BR')}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#333' }}>
                  <strong>🔒 Segurança:</strong> QR Code com assinatura digital SHA-256
                </p>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setShowQRCode(false)} className="btn-primary">
                  ✅ Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
