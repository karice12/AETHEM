import React, { useState, useEffect } from 'react';
import { 
  Terminal, LayoutDashboard, Library, Settings, LogOut, 
  Menu, X, Sparkles, Copy, Check, Cpu, Zap, RefreshCw, ArrowRight,
  Lock, ShieldCheck, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getDiscoveryQuestions, forgeElitePrompt } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { 
  auth, subscribeToPrompts, saveForgeResult, PromptEntry,
  simulateSubscriptionUpgrade, acceptTerms
} from '../lib/firebase';
import { signOut } from 'firebase/auth';

const Dashboard = () => {
  const { user, profile, isSubscribed, needsTermsAcceptance } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'library' | 'settings'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<PromptEntry[]>([]);
  
  // States do Fluxo
  const [step, setStep] = useState<'setup' | 'discovery' | 'generating' | 'result'>('setup');
  
  // States do Construtor
  const [idea, setIdea] = useState('');
  const [category, setCategory] = useState('Marketing');
  const [destination, setDestination] = useState('Social Media');
  
  // States de Descoberta
  const [discoveryQuestions, setDiscoveryQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [output, setOutput] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failure' | 'pending' | null>(null);

  // Verificar status de pagamento na URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment') as any;
    if (status) {
      setPaymentStatus(status);
      window.history.replaceState({}, '', window.location.pathname); // Limpa a URL
      setTimeout(() => setPaymentStatus(null), 5000); // Remove o aviso após 5s
    }
  }, []);

  // Sincronizar estado de carregamento do aceite
  useEffect(() => {
    if (!needsTermsAcceptance && isAccepting) {
      const timer = setTimeout(() => setIsAccepting(false), 500);
      return () => clearTimeout(timer);
    }
  }, [needsTermsAcceptance, isAccepting]);

  // Sincronizar Histórico com Firestore
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToPrompts(user.uid, (prompts) => {
        setHistory(prompts);
      });
      return unsubscribe;
    }
  }, [user]);

  const startDiscovery = async () => {
    if (!idea || !user) return;
    setStep('generating');
    try {
      const idToken = await user.getIdToken();
      const questions = await getDiscoveryQuestions(idea, category, idToken);
      setDiscoveryQuestions(questions);
      setStep('discovery');
    } catch (err: any) {
      console.error("Discovery error:", err);
      resetForge();
      // Error handling UI could be added here
    }
  };

  const finalizeForge = async () => {
    if (!user) return;
    setStep('generating');
    try {
      const idToken = await user.getIdToken();
      const elitePrompt = await forgeElitePrompt(idea, category, destination, answers, idToken);
      setOutput(elitePrompt);
      
      // Salvar no Firestore
      await saveForgeResult(user.uid, {
        idea,
        category,
        destination,
        answers,
        result: elitePrompt
      });
      
      setStep('result');
    } catch (err: any) {
      console.error("Erro na forja industrial:", err);
      // Se for erro de assinatura, o backend já bloqueou e a UI mostrará o bloqueio
      setStep('setup');
    }
  };

  const resetForge = () => {
    setStep('setup');
    setDiscoveryQuestions([]);
    setAnswers({});
    setOutput('');
  };

  const handlePayment = async (plan: 'monthly' | 'yearly') => {
    if (!user) return;
    setIsPaying(true);
    try {
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          userId: user.uid,
          email: user.email
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || "Erro desconhecido no servidor.");
      }

      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err: any) {
      console.error("Payment Error:", err);
      alert(`Erro: ${err.message}\n\nFavor verificar as configurações de pagamento.`);
    } finally {
      setIsPaying(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(false); // Reset para forçar animação
    setTimeout(() => setCopied(true), 0);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  const handleAcceptTerms = async () => {
    if (!user) return;
    setIsAccepting(true);
    try {
      await acceptTerms(user.uid);
      // O profile sync irá cuidar do resto, mas manteremos o loading por um momento para garantir
    } catch (err) {
      console.error("Erro ao aceitar termos:", err);
      setIsAccepting(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative mesh-gradient">
      {/* Payment Feedback Toast */}
      <AnimatePresence>
        {paymentStatus === 'success' && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-accent-cyan/20 border border-accent-cyan/30 backdrop-blur-md rounded-full flex items-center gap-3 shadow-lg shadow-accent-cyan/10"
          >
            <div className="w-6 h-6 rounded-full bg-accent-cyan flex items-center justify-center">
              <Check size={14} className="text-black" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Sincronização Completa: Licença Ativada</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LGPD Modal Overlay */}
      <AnimatePresence>
        {(needsTermsAcceptance || isAccepting) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl w-full bg-surface border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-white/5 bg-accent-violet/5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-violet/20 flex items-center justify-center">
                  <ShieldCheck className="text-accent-violet" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Protocolo de Privacidade Kernell</h2>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Conformidade LGPD v2.1 - AETHEM System</p>
                </div>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-accent-cyan">
                    <FileText size={14} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Termos de Uso de Rede</h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed font-mono">
                    Ao operar no sistema AETHEM, você concorda que o processamento neural é realizado via Kernel de IA. Seus dados são utilizados exclusivamente para aprimorar sua experiência de forja. Você retém a propriedade intelectual de todos os prompts fabricados em nossos servidores.
                  </p>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-accent-cyan">
                    <ShieldCheck size={14} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Privacidade & Dados (LGPD)</h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed font-mono">
                    Coletamos dados técnicos mínimos (email, nome e histórico de forjas) para manutenção da sua licença. Seus dados são criptografados e não são compartilhados com entidades externas de dados. Você tem o direito de exportar ou deletar seus logs a qualquer momento via terminal de suporte.
                  </p>
                </section>

                <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                  <p className="text-[9px] text-text-muted uppercase leading-relaxed font-bold text-center">
                    Ao clicar no botão abaixo, você confirma que leu e concorda com o processamento de seus dados neurais conforme as diretrizes da Lei Geral de Proteção de Dados.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-black/20 border-t border-white/5 flex gap-4">
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-white/5 transition-all outline-none"
                >
                  Recusar Terminal
                </button>
                <button 
                  onClick={handleAcceptTerms}
                  disabled={isAccepting}
                  className="flex-[2] py-4 bg-accent-violet hover:bg-accent-hover text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-accent-violet/20 outline-none disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAccepting ? (
                    <><RefreshCw size={14} className="animate-spin" /> Processando...</>
                  ) : (
                    'Aceitar Protocolos & Iniciar'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-violet/5 blur-[120px] rounded-full animate-mesh pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-cyan/5 blur-[120px] rounded-full animate-mesh pointer-events-none delay-700" />
      
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Mobile Toggle */}
      <button 
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-accent-violet rounded-full shadow-2xl text-white active:scale-95 transition-transform"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-24 translate-x-0' : 'w-20 lg:translate-x-0 -translate-x-full'} 
        fixed lg:relative z-40 h-full flex flex-col border-r border-white/5 bg-surface/40 backdrop-blur-xl py-8 items-center gap-10 shrink-0 transition-all duration-300 ease-in-out
      `}>
        <div className="w-12 h-12 bg-accent-violet rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-accent-violet/20">
          <Terminal size={24} className="text-white" />
        </div>

        <nav className="flex-1 w-full px-4 space-y-6 flex flex-col items-center">
          <SidebarItem 
            icon={<LayoutDashboard size={22} />} 
            active={activeTab === 'overview'} 
            onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
          />
          <SidebarItem 
            icon={<Library size={22} />} 
            active={activeTab === 'library'} 
            onClick={() => { setActiveTab('library'); setSidebarOpen(false); }}
          />
          <SidebarItem 
            icon={<Settings size={22} />} 
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
          />
        </nav>

        <div className="px-4 pb-4">
          <button 
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center rounded-2xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all group"
            title="Desconectar"
          >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 relative z-10 custom-scrollbar">
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-1">
               <Sparkles className="text-accent-cyan" size={24} />
               <h1 className="text-3xl font-black tracking-tighter text-text-primary uppercase italic">Forge Station</h1>
            </div>
            <p className="text-text-secondary text-sm font-medium">Arquitetura de prompts via Kernel Neural AETHEM v3.5</p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="glass px-4 py-2 rounded-2xl flex items-center gap-4">
               <div className="flex flex-col items-end">
                  <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">Sincronia</span>
                  <span className="text-xs font-bold text-emerald-500">99.9%</span>
               </div>
               <div className="w-[1px] h-8 bg-white/5" />
               <div className="flex flex-col items-end">
                  <span className="text-[10px] text-text-muted uppercase font-black tracking-widest">Nível</span>
                  <span className="text-xs font-bold text-accent-cyan uppercase tracking-widest">{profile?.plan || '...'}</span>
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-10"
              >
                {/* Workstation (Form) */}
                <section className="lg:col-span-7 flex flex-col gap-8 relative">
                  {!isSubscribed && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md rounded-3xl border border-accent-violet/30 overflow-hidden">
                       <div className="text-center max-w-sm">
                          <div className="w-16 h-16 bg-accent-violet/20 border border-accent-violet/40 rounded-full flex items-center justify-center mx-auto mb-6">
                             <Lock size={32} className="text-accent-violet" />
                          </div>
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Acesso Restrito</h3>
                          <p className="text-text-muted text-xs mb-8 leading-relaxed">Operação bloqueada. O Kernel Neural exige uma licença ativa de Comandante para processar transmissões de elite.</p>
                          <button 
                            onClick={() => setActiveTab('settings')}
                            className="px-8 py-3 bg-accent-violet hover:bg-accent-hover text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-accent-violet/20"
                          >
                             Ativar Licença Operational
                          </button>
                       </div>
                    </div>
                  )}
                  <motion.div 
                    className="bg-surface/30 border border-white/5 rounded-3xl flex flex-col overflow-hidden glass shadow-2xl"
                  >
                    <div className="px-8 py-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
                        <Cpu size={14} className="text-accent-violet" /> 
                        {step === 'setup' ? 'Sintaxe Operacional' : step === 'discovery' ? 'Injeção de Contexto' : 'Transmissão Próton'}
                      </span>
                      {step !== 'setup' && step !== 'generating' && (
                        <button onClick={resetForge} className="text-[10px] text-accent-violet hover:text-accent-hover flex items-center gap-1.5 transition-colors font-black uppercase tracking-widest outline-none">
                          <RefreshCw size={12} /> Reiniciar Kernel
                        </button>
                      )}
                    </div>

                    <div className="p-8 flex-1">
                      <AnimatePresence mode="wait">
                        {step === 'setup' && (
                          <motion.div 
                            key="setup"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                          >
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-2 px-1">
                                Input do Operador
                              </label>
                              <textarea 
                                value={idea}
                                onChange={(e) => setIdea(e.target.value)}
                                className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 text-text-primary focus:border-accent-violet/50 outline-none transition-all resize-none placeholder:text-text-muted/40 font-mono text-sm leading-relaxed"
                                placeholder="Digite aqui sua ideia base para o prompt..."
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Ambiente</label>
                                <select 
                                  value={category}
                                  onChange={(e) => setCategory(e.target.value)}
                                  className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-text-primary focus:border-accent-violet/50 outline-none text-xs font-bold uppercase tracking-widest appearance-none block"
                                >
                                  <option>Marketing</option>
                                  <option>Engenharia de Software</option>
                                  <option>Pesquisa e IA</option>
                                  <option>Copywriting</option>
                                </select>
                              </div>
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Canais de Saída</label>
                                <select 
                                  value={destination}
                                  onChange={(e) => setDestination(e.target.value)}
                                  className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-text-primary focus:border-accent-violet/50 outline-none text-xs font-bold uppercase tracking-widest appearance-none block"
                                >
                                  <option>Redes Sociais</option>
                                  <option>Codebase / Git</option>
                                  <option>API / Integration</option>
                                  <option>Relatórios</option>
                                </select>
                              </div>
                            </div>

                            <button 
                              onClick={startDiscovery}
                              disabled={!idea}
                              className="w-full py-5 bg-accent-violet group disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-hover text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-accent-violet/20 flex items-center justify-center gap-3 active:scale-[0.98] outline-none"
                            >
                              Iniciar Análise Neural <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </motion.div>
                        )}

                        {step === 'discovery' && (
                          <motion.div 
                            key="discovery"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                          >
                            <div className="p-5 bg-accent-violet/5 border border-accent-violet/10 rounded-2xl">
                              <p className="text-[10px] text-accent-cyan font-black uppercase tracking-widest flex items-center gap-3">
                                <Sparkles size={16} /> Kernel Ativo: Refinando Parâmetros
                              </p>
                            </div>

                            <div className="space-y-6">
                              {discoveryQuestions.map((q, idx) => (
                                <div key={idx} className="space-y-3">
                                  <label className="text-[11px] font-bold text-text-secondary px-1">{q}</label>
                                  <input 
                                    type="text"
                                    value={answers[q] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-text-primary focus:border-accent-violet/50 outline-none text-sm transition-all"
                                    placeholder="Especifique detalhadamente..."
                                  />
                                </div>
                              ))}
                            </div>

                            <button 
                              onClick={finalizeForge}
                              disabled={Object.keys(answers).length < discoveryQuestions.length}
                              className="w-full py-5 bg-accent-violet hover:bg-accent-hover text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-accent-violet/20 flex items-center justify-center gap-3 active:scale-[0.98] outline-none"
                            >
                              Executar Forja Crítica <Sparkles size={18} />
                            </button>
                          </motion.div>
                        )}

                        {step === 'generating' && (
                          <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-[6px] border-white/5 rounded-full" />
                                <div className="absolute inset-0 border-[6px] border-accent-violet rounded-full border-t-transparent animate-spin" />
                                <Zap size={32} className="absolute inset-0 m-auto text-accent-violet animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 text-text-primary tracking-tight">Compilando Neurônios</h3>
                            <p className="text-text-muted text-sm font-medium">Estruturando lógica de prompt em alta fidelidade.</p>
                          </div>
                        )}

                        {step === 'result' && (
                          <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <Check size={40} className="text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black mb-3 text-text-primary tracking-tight text-white uppercase italic">Ciclagem Concluída</h3>
                            <p className="text-text-muted text-sm font-medium mb-8">O comando de elite foi sincronizado com o terminal de saída.</p>
                            <button 
                              onClick={() => setStep('setup')}
                              className="px-10 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all outline-none"
                            >
                              Nova Forja
                            </button>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </section>

                {/* Output (Col Span 5) */}
                <section className="lg:col-span-5 flex flex-col gap-8 h-full">
                  <motion.div 
                    className="bg-black/60 border border-white/5 rounded-3xl flex flex-col flex-1 min-h-[500px] overflow-hidden glass shadow-2xl relative group"
                  >
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                          <Terminal size={14} className="text-accent-cyan" /> Terminal de Saída
                        </span>
                        {output && (
                          <div className="flex gap-2">
                            <button 
                              onClick={copyToClipboard}
                              className="flex items-center gap-2 px-3 py-1.5 bg-accent-violet/10 border border-accent-violet/20 hover:bg-accent-violet/20 rounded-full text-[10px] font-black text-accent-violet transition-all uppercase tracking-widest outline-none"
                            >
                              {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                            </button>
                          </div>
                        )}
                    </div>

                    <div className="flex-1 p-8 font-mono text-sm group-hover:bg-white/[0.01] transition-all overflow-y-auto custom-scrollbar relative">
                        <AnimatePresence mode="wait">
                          {output ? (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="whitespace-pre-wrap text-text-secondary leading-relaxed"
                            >
                              <div className="text-text-muted text-[10px] mb-6 flex flex-col gap-1 border-l-2 border-accent-violet/30 pl-4 py-1">
                                  <div>TIMESTAMP: {new Date().toLocaleTimeString()}</div>
                                  <div>ENCRYPTION: AES-256-GCM</div>
                                  <div>KERN_VERSION: 3.5.2-RELEASE</div>
                              </div>
                              {output}
                              <span className="inline-block w-2 h-4 bg-accent-cyan align-middle ml-1 animate-pulse" />
                            </motion.div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-40 text-center select-none py-20">
                              <Terminal size={64} className="mb-6 opacity-20" />
                              <p className="text-xs font-black uppercase tracking-[0.4em]">Standby</p>
                              <p className="text-[10px] mt-2 italic font-mono uppercase tracking-widest">Aguardando injeção de dados via Kernel</p>
                            </div>
                          )}
                        </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Micro History Mobile/Desktop */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 glass lg:hidden xl:block">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-6 flex items-center justify-between px-1">
                        Recent Memory {history.length > 0 && <span className="text-accent-cyan">{history.length}/5</span>}
                    </h3>
                    <div className="space-y-3">
                      {history.slice(0, 3).map((item, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setOutput(item.result)}
                          className="w-full text-left p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all outline-none"
                        >
                          <div className="flex justify-between items-start mb-1 gap-4">
                              <span className="text-xs font-bold text-white truncate">{item.idea}</span>
                              <span className="text-[9px] text-text-muted font-mono shrink-0">
                                {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString() : '...'}
                              </span>
                          </div>
                        </button>
                      ))}
                      {history.length === 0 && (
                        <p className="text-[11px] text-text-muted italic text-center py-2">Sem registros.</p>
                      )}
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div 
                key="library"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="pb-10"
              >
                <div className="bg-surface/30 border border-white/5 rounded-3xl glass p-8 shadow-2xl">
                  <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-1">Arquivo Central</h2>
                      <p className="text-text-muted text-sm font-medium">Histórico completo de transmissões e códigos neurais.</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 w-full md:w-64">
                       <Terminal size={14} className="text-text-muted" />
                       <input 
                        type="text" 
                        placeholder="Buscar por ideia..." 
                        className="bg-transparent border-none outline-none text-xs text-text-primary w-full"
                       />
                    </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {history.map((item, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -4 }}
                        className="bg-black/40 border border-white/5 p-6 rounded-2xl hover:border-accent-violet/30 transition-all group relative"
                      >
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-lg bg-accent-violet/10 flex items-center justify-center">
                                  <Zap size={14} className="text-accent-violet" />
                               </div>
                               <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.category}</span>
                            </div>
                            <span className="text-[9px] text-text-muted font-mono">{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : ''}</span>
                         </div>
                         <h4 className="text-sm font-bold text-white mb-3 line-clamp-1">{item.idea}</h4>
                         <p className="text-xs text-text-muted line-clamp-3 mb-6 font-mono leading-relaxed">{item.result}</p>
                         <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] text-accent-cyan uppercase font-black tracking-widest">{item.destination}</span>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => { setOutput(item.result); setActiveTab('overview'); }}
                                 className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted transition-colors outline-none"
                               >
                                  <ArrowRight size={14} />
                               </button>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                    {history.length === 0 && (
                      <div className="col-span-full py-20 text-center flex flex-col items-center">
                         <Library size={48} className="text-text-muted mb-4 opacity-20" />
                         <p className="text-text-muted uppercase font-black tracking-widest text-xs">Arquivo Vazio</p>
                         <p className="text-text-muted text-[10px] mt-2">Nenhuma forja foi realizada por este operador.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto pb-10"
              >
                <div className="bg-surface/30 border border-white/5 rounded-3xl glass p-10 shadow-2xl">
                   <div className="flex flex-col items-center text-center mb-10">
                      <div className="w-24 h-24 rounded-full bg-accent-violet/20 border-2 border-accent-violet/30 p-1 mb-6">
                        {profile?.photoURL ? (
                          <img src={profile.photoURL} className="w-full h-full rounded-full object-cover" alt="Profile" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-accent-violet flex items-center justify-center text-3xl font-black text-white">
                             {profile?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">{profile?.displayName || 'Operador Anônimo'}</h2>
                      <p className="text-accent-cyan font-black uppercase text-xs tracking-[0.3em]">{profile?.plan || 'Standard'} ACCESS</p>
                   </div>

                   <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="p-5 bg-black/40 border border-white/5 rounded-2xl">
                            <span className="text-[10px] text-text-muted uppercase font-black tracking-widest block mb-2">Email Operacional</span>
                            <span className="text-sm font-bold text-text-primary px-1">{profile?.email || user?.email}</span>
                         </div>
                         <div className="p-5 bg-black/40 border border-white/5 rounded-2xl">
                            <span className="text-[10px] text-text-muted uppercase font-black tracking-widest block mb-2">Protocolo de Registro</span>
                            <span className="text-sm font-bold text-text-primary px-1">
                              {profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 'N/A'}
                            </span>
                         </div>
                         {profile?.subscriptionStatus === 'active' && (
                           <div className="p-5 bg-accent-violet/10 border border-accent-violet/20 rounded-2xl md:col-span-2">
                              <span className="text-[10px] text-accent-violet uppercase font-black tracking-widest block mb-2">Expiração da Licença</span>
                              <span className="text-sm font-bold text-white px-1">
                                {profile?.expiresAt?.toDate ? profile.expiresAt.toDate().toLocaleDateString() : 
                                 profile?.expiresAt ? new Date(profile.expiresAt).toLocaleDateString() : 'N/A'}
                              </span>
                           </div>
                         )}
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <span className="text-[10px] text-text-muted uppercase font-black tracking-widest block mb-6">Licença Neural - Ciclo de Vida</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                           <button 
                             onClick={() => handlePayment('monthly')}
                             disabled={isPaying}
                             className={`p-6 rounded-2xl border transition-all text-left group ${profile?.plan === 'monthly' ? 'bg-accent-violet/10 border-accent-violet' : 'bg-black/40 border-white/5 hover:border-white/10'} ${isPaying ? 'opacity-50' : ''}`}
                           >
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-2 bg-white/5 rounded-lg group-hover:bg-accent-violet/20 transition-colors">
                                    <Zap size={18} className={profile?.plan === 'monthly' ? 'text-accent-violet' : 'text-text-muted'} />
                                 </div>
                                 <span className="text-[10px] font-black text-text-primary px-2 py-1 bg-white/5 rounded-full uppercase">Monthly</span>
                              </div>
                              <h4 className="text-sm font-bold text-white mb-1">Elite Monthly</h4>
                              <p className="text-[10px] text-text-muted">R$ 49,90 / 30 dias operacionais.</p>
                           </button>

                           <button 
                             onClick={() => handlePayment('yearly')}
                             disabled={isPaying}
                             className={`p-6 rounded-2xl border transition-all text-left group ${profile?.plan === 'yearly' ? 'bg-accent-cyan/10 border-accent-cyan' : 'bg-black/40 border-white/5 hover:border-white/10'} ${isPaying ? 'opacity-50' : ''}`}
                           >
                              <div className="flex justify-between items-start mb-4">
                                 <div className="p-2 bg-white/5 rounded-lg group-hover:bg-accent-cyan/20 transition-colors">
                                    <Sparkles size={18} className={profile?.plan === 'yearly' ? 'text-accent-cyan' : 'text-text-muted'} />
                                 </div>
                                 <span className="text-[10px] font-black text-text-primary px-2 py-1 bg-accent-cyan/20 rounded-full uppercase">Yearly</span>
                              </div>
                              <h4 className="text-sm font-bold text-white mb-1">Overlord Yearly</h4>
                              <p className="text-[10px] text-text-muted">R$ 299,90 / 12 meses de forja.</p>
                           </button>
                        </div>

                        <button 
                          onClick={handleLogout}
                          className="w-full py-4 border border-dashed border-red-500/30 hover:bg-red-500/5 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all outline-none"
                        >
                           Encerrar Sessão Neural
                        </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 10px;
        }
        main:hover .custom-scrollbar::-webkit-scrollbar-thumb,
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
};

// Subcomponente SidebarItem
const SidebarItem = ({ icon, active = false, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`
      w-12 h-12 flex items-center justify-center rounded-2xl transition-all border outline-none
      ${active 
        ? 'bg-accent-violet/10 text-accent-violet border-accent-violet/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
        : 'text-text-muted border-transparent hover:bg-white/5 hover:text-text-primary'}
    `}
  >
    {icon}
  </button>
);

export default Dashboard;
