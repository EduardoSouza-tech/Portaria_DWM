import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 [LOGIN] Iniciando login...');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password ? '***' : 'vazia');
    
    setError('');
    setLoading(true);

    try {
      console.log('🔵 [LOGIN] Chamando API...');
      const data = await authAPI.login(email, password);
      console.log('✅ [LOGIN] Resposta da API:', data);
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      console.log('✅ [LOGIN] Tokens salvos, navegando para /');
      
      navigate('/');
    } catch (err: any) {
      console.error('❌ [LOGIN] Erro capturado:', err);
      console.error('❌ [LOGIN] Resposta:', err.response);
      console.error('❌ [LOGIN] Dados:', err.response?.data);
      
      const errorMsg = err.response?.data?.detail || 'Erro ao fazer login';
      console.error('❌ [LOGIN] Mensagem de erro:', errorMsg);
      setError(errorMsg);
    } finally {
      console.log('🔵 [LOGIN] Finalizando (loading = false)');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🏢 Portaria Inteligente</h1>
        <h2>Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="help-text">
          Para testes: admin@portaria.com / admin123
        </p>
      </div>
    </div>
  );
}
