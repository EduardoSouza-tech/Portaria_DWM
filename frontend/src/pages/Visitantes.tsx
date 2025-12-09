import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { visitantesAPI } from '../api';
import '../pages/Moradores.css';
import '../theme.css';
import '../global-select.css';

export default function Visitantes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [searchDoc, setSearchDoc] = useState('');
  const [dataFiltro, setDataFiltro] = useState(() => {
    // Data atual no formato YYYY-MM-DD (horário local)
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  });
  const [formData, setFormData] = useState({
    nome_completo: '',
    tipo_documento: 'CPF',
    numero_documento: '',
    telefone: '',
    data_visita: ''
  });

  // Aplicar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark-purple';
    document.body.className = `theme-${savedTheme}`;
  }, []);

  const { data: visitantes, isLoading } = useQuery({
    queryKey: ['visitantes'],
    queryFn: visitantesAPI.list,
  });

  // Query para visitantes programados por data
  const { data: visitantesProgramados, isLoading: isLoadingProgramacao } = useQuery({
    queryKey: ['visitantes-programacao', dataFiltro],
    queryFn: () => visitantesAPI.listByDate(dataFiltro),
  });

  const createMutation = useMutation({
    mutationFn: visitantesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitantes'] });
      setShowModal(false);
      resetForm();
      alert('✅ Visitante cadastrado com sucesso!');
    },
    onError: (error: any) => {
      alert(`❌ Erro: ${error.response?.data?.detail || 'Erro ao cadastrar'}`);
    }
  });

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      tipo_documento: 'CPF',
      numero_documento: '',
      telefone: '',
      data_visita: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepara dados para envio
    const dataToSend = {
      ...formData,
      // Converte datetime-local para ISO 8601 se a data foi informada
      data_visita: formData.data_visita ? new Date(formData.data_visita).toISOString() : null
    };
    
    createMutation.mutate(dataToSend);
  };

  const handleSearch = async () => {
    if (!searchDoc.trim()) {
      alert('Digite um documento para buscar');
      return;
    }
    try {
      const visitante = await visitantesAPI.getByDocumento(searchDoc);
      alert(`✅ Encontrado: ${visitante.nome_completo}\nDocumento: ${visitante.numero_documento}\nTotal de visitas: ${visitante.total_visitas}`);
    } catch (error: any) {
      alert('❌ Visitante não encontrado');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ⬅️ Voltar
          </button>
          <h1>👤 Visitantes</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          ➕ Cadastro Rápido
        </button>
      </div>

      {/* Busca Rápida e Filtro de Data */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Busca por Documento */}
        <div className="content-card">
          <h3 style={{ marginBottom: '15px' }}>🔍 Busca por Documento</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Digite CPF, RG, CNH..."
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="btn-primary">
              🔍 Buscar
            </button>
          </div>
        </div>

        {/* Filtro por Data */}
        <div className="content-card">
          <h3 style={{ marginBottom: '15px' }}>📅 Programação por Data</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <button 
              onClick={() => {
                const hoje = new Date();
                const ano = hoje.getFullYear();
                const mes = String(hoje.getMonth() + 1).padStart(2, '0');
                const dia = String(hoje.getDate()).padStart(2, '0');
                setDataFiltro(`${ano}-${mes}-${dia}`);
              }} 
              className="btn-secondary"
            >
              📆 Hoje
            </button>
          </div>
        </div>
      </div>

      {/* Programação de Visitantes por Data */}
      <div className="content-card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>
          📋 Visitantes Programados para {new Date(dataFiltro + 'T00:00:00').toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
        
        {isLoadingProgramacao ? (
          <div className="loading">Carregando programação...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Nome</th>
                  <th>Documento</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {!visitantesProgramados || visitantesProgramados.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                      📭 Nenhum visitante programado para esta data
                    </td>
                  </tr>
                ) : (
                  visitantesProgramados.map((v: any) => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        {new Date(v.data_prevista).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td>{v.nome_completo}</td>
                      <td>{v.numero_documento}</td>
                      <td>{v.telefone || '-'}</td>
                      <td>
                        <span className={`status-badge ${
                          v.status_visita === 'autorizada' ? 'active' :
                          v.status_visita === 'pendente' ? '' :
                          v.status_visita === 'finalizada' ? 'active' :
                          'inactive'
                        }`}>
                          {v.status_visita === 'autorizada' ? '✅ Autorizada' :
                           v.status_visita === 'pendente' ? '⏳ Pendente' :
                           v.status_visita === 'finalizada' ? '✅ Finalizada' :
                           v.status_visita === 'cancelada' ? '❌ Cancelada' :
                           v.status_visita}
                        </span>
                      </td>
                      <td>{v.motivo || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Todos os Visitantes Cadastrados */}
      {isLoading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="content-card">
          <h3 style={{ marginBottom: '15px' }}>👥 Todos os Visitantes Cadastrados</h3>
          
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">Total de Visitantes</span>
              <span className="stat-value">{visitantes?.length || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Bloqueados</span>
              <span className="stat-value" style={{ color: '#e74c3c' }}>
                {visitantes?.filter((v: any) => v.is_blacklisted).length || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Programados Hoje</span>
              <span className="stat-value" style={{ color: '#3498db' }}>
                {visitantesProgramados?.length || 0}
              </span>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo Doc.</th>
                  <th>Documento</th>
                  <th>Telefone</th>
                  <th>Total Visitas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visitantes?.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      Nenhum visitante cadastrado
                    </td>
                  </tr>
                ) : (
                  visitantes?.map((visitante: any) => (
                    <tr key={visitante.id}>
                      <td>{visitante.nome_completo}</td>
                      <td>{visitante.tipo_documento}</td>
                      <td>{visitante.numero_documento}</td>
                      <td>{visitante.telefone || '-'}</td>
                      <td>{visitante.total_visitas}</td>
                      <td>
                        <span className={`status-badge ${visitante.is_blacklisted ? 'inactive' : 'active'}`}>
                          {visitante.is_blacklisted ? '🚫 Bloqueado' : '✅ Liberado'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Cadastro Rápido */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>⚡ Cadastro Rápido de Visitante</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ padding: '30px' }}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                    required
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Tipo Doc. *</label>
                    <select
                      value={formData.tipo_documento}
                      onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
                      required
                    >
                      <option value="CPF">CPF</option>
                      <option value="RG">RG</option>
                      <option value="CNH">CNH</option>
                      <option value="PASSAPORTE">Passaporte</option>
                      <option value="RNE">RNE</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Número do Documento *</label>
                    <input
                      type="text"
                      value={formData.numero_documento}
                      onChange={(e) => setFormData({...formData, numero_documento: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="form-group">
                  <label>📅 Data da Visita (opcional)</label>
                  <input
                    type="datetime-local"
                    value={formData.data_visita}
                    onChange={(e) => setFormData({...formData, data_visita: e.target.value})}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Se informado, será criada uma visita programada automaticamente
                  </small>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '20px 30px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Salvando...' : '⚡ Cadastrar Rápido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
