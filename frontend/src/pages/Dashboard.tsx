import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import './Dashboard.css';
import '../theme.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark-purple');
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    type: getScreenType(window.innerWidth)
  });

  // Função para determinar o tipo de tela
  function getScreenType(width: number): string {
    if (width < 480) return 'mobile-small';
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'laptop';
    return 'desktop';
  }

  // Detectar mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      const newType = getScreenType(newWidth);
      
      setScreenSize({
        width: newWidth,
        height: newHeight,
        type: newType
      });

      // Log para debug (opcional)
      console.log(`📱 Tela detectada: ${newType} (${newWidth}x${newHeight}px)`);
    };

    // Adicionar listener
    window.addEventListener('resize', handleResize);
    
    // Log inicial
    console.log(`📱 Tela inicial: ${screenSize.type} (${screenSize.width}x${screenSize.height}px)`);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Buscar dados reais
  const { data: moradores = [] } = useQuery({
    queryKey: ['moradores'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/moradores');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: visitantes = [] } = useQuery({
    queryKey: ['visitantes'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/visitantes');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: visitas = [] } = useQuery({
    queryKey: ['visitas'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/visitas');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const { data: correspondencias = [] } = useQuery({
    queryKey: ['correspondencias'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/api/v1/correspondencias');
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Calcular estatísticas
  const visitantesHoje = visitantes.filter((v: any) => {
    try {
      if (!v.created_at) return false;
      const hoje = new Date().toISOString().split('T')[0];
      const dataVisitante = new Date(v.created_at).toISOString().split('T')[0];
      return dataVisitante === hoje;
    } catch {
      return false;
    }
  }).length;

  const visitasDentro = visitas.filter((v: any) => v.status === 'DENTRO').length;
  
  const correspondenciasAguardando = correspondencias.filter((c: any) => 
    c.status === 'aguardando_retirada'
  ).length;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = `theme-${newTheme}`;
  };

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>🏢 Portaria Inteligente</h1>
        </div>
        <div className="navbar-menu">
          <Link to="/portaria">Painel Portaria</Link>
          <Link to="/moradores">Moradores</Link>
          <Link to="/visitantes">Visitantes</Link>
          <Link to="/visitas">Visitas</Link>
          <Link to="/correspondencias">Correspondências</Link>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header-section">
          <h2>📊 Dashboard Principal</h2>
          
          {/* Indicador de tamanho de tela */}
          <div className="screen-info" style={{
            fontSize: 'clamp(11px, 1.5vw, 13px)',
            color: 'var(--text-secondary)',
            padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>
              {screenSize.type === 'mobile-small' && '📱'}
              {screenSize.type === 'mobile' && '📱'}
              {screenSize.type === 'tablet' && '📱'}
              {screenSize.type === 'laptop' && '💻'}
              {screenSize.type === 'desktop' && '🖥️'}
            </span>
            <span>
              {screenSize.type === 'mobile-small' && 'Mobile Pequeno'}
              {screenSize.type === 'mobile' && 'Mobile'}
              {screenSize.type === 'tablet' && 'Tablet'}
              {screenSize.type === 'laptop' && 'Laptop'}
              {screenSize.type === 'desktop' && 'Desktop'}
            </span>
            <span style={{ opacity: 0.7 }}>
              ({screenSize.width}×{screenSize.height})
            </span>
          </div>

          <div className="theme-selector">
            <label htmlFor="theme-select">🎨 Tema:</label>
            <select 
              id="theme-select"
              value={theme} 
              onChange={(e) => handleThemeChange(e.target.value)}
              className="theme-select"
            >
              <option value="dark-purple">🌙 Escuro Roxo</option>
              <option value="dark-blue">🌊 Escuro Azul</option>
              <option value="dark-green">🌲 Escuro Verde</option>
              <option value="dark-orange">🔥 Escuro Laranja</option>
              <option value="cyberpunk">⚡ Cyberpunk</option>
              <option value="ocean">🌊 Oceano</option>
              <option value="sunset">🌅 Por do Sol</option>
              <option value="forest">🌳 Floresta</option>
            </select>
          </div>
        </div>
        
        <div className="cards-grid">
          <div className="card card-blue">
            <h3>👥 Moradores</h3>
            <p className="card-number">{moradores.length}</p>
            <Link to="/moradores" className="card-link">Ver todos →</Link>
          </div>

          <div className="card card-green">
            <h3>👤 Visitantes Hoje</h3>
            <p className="card-number">{visitantesHoje}</p>
            <Link to="/visitantes" className="card-link">Ver todos →</Link>
          </div>

          <div className="card card-orange">
            <h3>🚪 Dentro Agora</h3>
            <p className="card-number">{visitasDentro}</p>
            <Link to="/visitas" className="card-link">Ver visitas →</Link>
          </div>

          <div className="card card-purple">
            <h3>📦 Correspondências</h3>
            <p className="card-number">{correspondenciasAguardando}</p>
            <Link to="/correspondencias" className="card-link">Ver todas →</Link>
          </div>
        </div>

        <div className="quick-actions">
          <h3>⚡ Ações Rápidas</h3>
          <div className="actions-grid">
            <Link to="/portaria" className="action-btn action-primary">
              🎯 Painel da Portaria
            </Link>
            <Link to="/visitantes?action=new" className="action-btn action-success">
              ➕ Novo Visitante
            </Link>
            <Link to="/visitas?action=new" className="action-btn action-info">
              🎫 Gerar QR Code
            </Link>
            <Link to="/moradores?action=new" className="action-btn action-warning">
              👤 Novo Morador
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
