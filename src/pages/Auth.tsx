import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Terminal, Mail, Lock, User, ArrowRight, Github } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro na autenticação neural.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha no login social.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background relative mesh-gradient">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-violet/10 blur-[120px] rounded-full animate-mesh pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/5 blur-[120px] rounded-full animate-mesh pointer-events-none delay-1000" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 bg-accent-violet rounded-xl flex items-center justify-center shadow-lg shadow-accent-violet/20 group-hover:scale-110 transition-transform">
              <Terminal size={28} className="text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase italic group-hover:tracking-normal transition-all text-text-primary">AETHEM</span>
          </Link>
          <h2 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">
            {isLogin ? 'Injeção de Credenciais' : 'Protocolo de Cadastro'}
          </h2>
          <p className="text-text-secondary mt-3 font-medium">
            {isLogin ? 'Acesse o terminal operacional.' : 'Inicie sua jornada na engenharia de elite.'}
          </p>
        </div>

        {/* Card de Autenticação */}
        <div className="bg-surface/30 border border-white/5 p-10 rounded-[40px] shadow-2xl glass-dark">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">Assinatura de Operador</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-violet transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Nome do Operador"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-text-primary focus:border-accent-violet/50 outline-none transition-all placeholder:text-text-muted/40 font-medium"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">E-mail de Acesso</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-violet transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="id@aethem.tech"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-text-primary focus:border-accent-violet/50 outline-none transition-all placeholder:text-text-muted/40 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">Chave de Segurança</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-violet transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-text-primary focus:border-accent-violet/50 outline-none transition-all placeholder:text-text-muted/40 font-medium"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-accent-violet hover:bg-accent-hover disabled:bg-accent-violet/50 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] mt-4 shadow-xl shadow-accent-violet/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Ativar Kernel' : 'Validar Protocolo'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-10 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative px-6 bg-surface/30 backdrop-blur-md text-[10px] text-text-muted uppercase font-black tracking-widest">Single Sign-On</span>
          </div>

          <button 
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-black/40 border border-white/10 hover:bg-white/5 text-text-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" referrerPolicy="no-referrer" /> Google Operator ID
          </button>
        </div>

        <p className="text-center mt-10 text-text-secondary text-sm font-medium text-text-primary">
          {isLogin ? 'Novo na Deep Network?' : 'Protocolo já existente?'}
          <button 
            type="button"
            disabled={loading}
            onClick={() => setIsLogin(!isLogin)}
            className="ml-3 text-accent-cyan font-black uppercase text-xs tracking-widest hover:text-accent-violet transition-colors"
          >
            {isLogin ? 'Registrar IDs' : 'Iniciar Sessão'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
