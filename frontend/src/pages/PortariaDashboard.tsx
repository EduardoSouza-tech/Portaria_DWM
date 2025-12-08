import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitasAPI } from '../api';
import './PortariaDashboard.css';
import '../theme.css';

export default function PortariaDashboard() {
  const navigate = useNavigate();
  const [visitantesDentro, setVisitantesDentro] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aplicar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'dark-purple';
    document.body.className = `theme-${savedTheme}`;
    
    loadVisitantesDentro();
    // Refresh every 10 seconds
    const interval = setInterval(loadVisitantesDentro, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadVisitantesDentro = async () => {
    try {
      const data = await visitasAPI.getDentro();
      setVisitantesDentro(data);
    } catch (error) {
      console.error('Erro ao carregar visitantes dentro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarSaida = async (visitaId: string) => {
    if (!confirm('Registrar saída deste visitante?')) return;
    
    try {
      await visitasAPI.registerSaida(visitaId);
      loadVisitantesDentro(); // Refresh
      alert('Saída registrada com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Erro ao registrar saída');
    }
  };

  return (
    <div className="portaria-container">
      <header className="portaria-header">
        <div className="header-left">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn-back"
            title="Voltar ao Dashboard"
          >
            ← Voltar
          </button>
          <h1>🎯 Painel da Portaria - Tempo Real</h1>
        </div>
        <div className="header-stats">
          <div className="stat-box">
            <span className="stat-label">Dentro Agora</span>
            <span className="stat-value">{visitantesDentro.length}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Status</span>
            <span className="stat-value status-online">Online</span>
          </div>
        </div>
      </header>

      <div className="portaria-content">
        <section className="section">
          <h2>🚪 Visitantes Dentro ({visitantesDentro.length})</h2>
          
          {loading ? (
            <p>Carregando...</p>
          ) : visitantesDentro.length === 0 ? (
            <div className="empty-state">
              <p>✅ Nenhum visitante no condomínio no momento</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Visitante</th>
                    <th>Unidade</th>
                    <th>Entrada</th>
                    <th>Tempo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visitantesDentro.map((visita) => (
                    <tr key={visita.id}>
                      <td>{visita.visitante_id}</td>
                      <td>{visita.unidade_id}</td>
                      <td>{new Date(visita.data_entrada).toLocaleTimeString('pt-BR')}</td>
                      <td>
                        {Math.floor(
                          (Date.now() - new Date(visita.data_entrada).getTime()) / 60000
                        )} min
                      </td>
                      <td>
                        <button
                          onClick={() => handleRegistrarSaida(visita.id)}
                          className="btn-danger-small"
                        >
                          Registrar Saída
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="quick-actions-portaria">
          <h3>⚡ Ações Rápidas</h3>
          <div className="actions-row">
            <button 
              className="action-btn-portaria btn-primary"
              onClick={() => navigate('/visitantes')}
              title="Ir para página de visitantes para registrar novo visitante"
            >
              ➕ Registrar Visitante
            </button>
            <button 
              className="action-btn-portaria btn-success"
              onClick={() => navigate('/visitantes')}
              title="Ir para visitantes para capturar foto"
            >
              📷 Capturar Foto
            </button>
            <button 
              className="action-btn-portaria btn-warning"
              onClick={() => navigate('/correspondencias')}
              title="Ir para página de correspondências"
            >
              📦 Nova Correspondência
            </button>
            <button 
              className="action-btn-portaria btn-info"
              onClick={() => navigate('/visitas')}
              title="Ir para página de visitas para registrar entrada de veículo"
            >
              🚗 Entrada Veículo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
