import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { moradoresAPI } from '../api';
import './Moradores.css';
import '../theme.css';
import '../global-select.css';

export default function Moradores() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    rg: '',
    telefone: '',
    email: '',
    data_nascimento: ''
  });

  // Aplicar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark-purple';
    document.body.className = `theme-${savedTheme}`;
  }, []);

  const { data: moradores, isLoading } = useQuery({
    queryKey: ['moradores'],
    queryFn: moradoresAPI.list,
  });

  const createMutation = useMutation({
    mutationFn: moradoresAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moradores'] });
      setShowModal(false);
      resetForm();
      alert('✅ Morador cadastrado com sucesso!');
    },
    onError: (error: any) => {
      alert(`❌ Erro: ${error.response?.data?.detail || 'Erro ao cadastrar'}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => moradoresAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moradores'] });
      setShowModal(false);
      resetForm();
      alert('✅ Morador atualizado com sucesso!');
    },
    onError: (error: any) => {
      alert(`❌ Erro: ${error.response?.data?.detail || 'Erro ao atualizar'}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: moradoresAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moradores'] });
      alert('✅ Morador desativado com sucesso!');
    }
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nome_completo: '',
      cpf: '',
      rg: '',
      telefone: '',
      email: '',
      data_nascimento: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpar dados vazios antes de enviar
    const dataToSend = {
      ...formData,
      data_nascimento: formData.data_nascimento || null,
      rg: formData.rg || null,
      telefone: formData.telefone || null,
      email: formData.email || null,
    };
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: dataToSend });
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const handleEdit = (morador: any) => {
    setEditingId(morador.id);
    setFormData({
      nome_completo: morador.nome_completo,
      cpf: morador.cpf,
      rg: morador.rg || '',
      telefone: morador.telefone || '',
      email: morador.email || '',
      data_nascimento: morador.data_nascimento || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string, nome: string) => {
    if (confirm(`Deseja realmente desativar o morador ${nome}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleGenerateTestData = async () => {
    if (!confirm('⚠️ Isso irá gerar 200 moradores, 300 visitantes, 700 correspondências e 100 visitas.\n\nDeseja continuar?')) {
      return;
    }

    console.log('🎲 Iniciando geração de dados de teste...');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutos

      const response = await fetch('http://localhost:8000/generate-test-data', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Dados gerados com sucesso!\n\nAtualizando lista...');
        queryClient.invalidateQueries({ queryKey: ['moradores'] });
        window.location.reload(); // Recarrega página para garantir atualização
      } else {
        alert('❌ Erro ao gerar dados:\n' + (data.message || 'Erro desconhecido'));
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        alert('⏱️ Tempo esgotado. Tente novamente.');
      } else {
        console.error('Erro ao gerar dados:', error);
        alert('❌ Erro ao comunicar com servidor.\n\nVerifique se o backend está rodando e tente novamente.');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ⬅️ Voltar
          </button>
          <h1>👥 Moradores</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleGenerateTestData} 
            className="btn-secondary"
            style={{ background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)' }}
          >
            🎲 Gerar Dados de Teste
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            ➕ Novo Morador
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="content-card">
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">Total de Moradores</span>
              <span className="stat-value">{moradores?.length || 0}</span>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>E-mail</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {moradores?.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      Nenhum morador cadastrado
                    </td>
                  </tr>
                ) : (
                  moradores?.map((morador: any) => (
                    <tr key={morador.id}>
                      <td>{morador.nome_completo}</td>
                      <td>{morador.cpf}</td>
                      <td>{morador.telefone || '-'}</td>
                      <td>{morador.email || '-'}</td>
                      <td>
                        <span className={`status-badge ${morador.is_active ? 'active' : 'inactive'}`}>
                          {morador.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(morador)}
                            className="btn-edit-small"
                            disabled={!morador.is_active}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(morador.id, morador.nome_completo)}
                            className="btn-danger-small"
                            disabled={!morador.is_active}
                          >
                            🗑️ Desativar
                          </button>
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

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? '✏️ Editar Morador' : '➕ Novo Morador'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-close">✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>NOME COMPLETO *</label>
                  <input
                    type="text"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                    placeholder="Nome completo do morador"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CPF *</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value.replace(/\D/g, '')})}
                    maxLength={11}
                    placeholder="12345678901"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>RG</label>
                  <input
                    type="text"
                    value={formData.rg}
                    onChange={(e) => setFormData({...formData, rg: e.target.value})}
                    placeholder="RG-123456789"
                  />
                </div>

                <div className="form-group">
                  <label>Data de Nascimento</label>
                  <input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                  />
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
                  <label>E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Salvando...' : '💾 Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
