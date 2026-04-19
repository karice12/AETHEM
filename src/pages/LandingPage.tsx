import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Zap, Shield, ChevronRight, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const LandingPage = () => {
  return (
    <div className="flex flex-col w-full relative mesh-gradient min-h-screen">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-violet/10 blur-[120px] rounded-full animate-mesh pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/5 blur-[120px] rounded-full animate-mesh pointer-events-none delay-1000" />

      {/* Navbar Minimalista */}
      <nav className="flex items-center justify-between px-6 py-6 md:px-12 border-b border-white/5 glass sticky top-0 z-50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 bg-accent-violet rounded-xl flex items-center justify-center shadow-lg shadow-accent-violet/20">
            <Terminal size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase italic text-text-primary">AETHEM</span>
        </motion.div>
        
        <div className="hidden md:flex gap-10 text-sm font-medium">
          <NavLink href="#features">Tecnologia</NavLink>
          <NavLink href="#pricing">Preços</NavLink>
          <NavLink href="#">Documentação</NavLink>
        </div>

        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            to="/auth" 
            className="px-6 py-2.5 bg-accent-violet hover:bg-accent-hover text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-accent-violet/20"
          >
            Acessar Terminal
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/20 text-accent-violet text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <Cpu size={12} /> Neural Core v3.5 Online
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1] md:leading-[1] text-text-primary"
            >
              A palavra final em <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet via-accent-cyan to-accent-violet animate-glow">cada comando.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-text-secondary mb-10 max-w-lg leading-relaxed"
            >
              A AETHEM é a estação de trabalho definitiva para engenheiros de prompt de elite. 
              Transforme abstrações e conceitos brutos em comandos de alta performance.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                to="/auth" 
                className="px-8 py-4 bg-accent-violet hover:bg-accent-hover text-white rounded-xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-accent-violet/30 transition-all hover:-translate-y-1"
              >
                Ativar Terminal <ArrowRight size={18} />
              </Link>
              <button className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black text-[12px] uppercase tracking-widest transition-all">
                Explorar Engine
              </button>
            </motion.div>

            {/* Trusted By */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t border-white/5"
            >
              <p className="text-[9px] uppercase font-black tracking-[0.3em] text-text-muted mb-5">Operado por Engenheiros na</p>
              <div className="flex flex-wrap gap-8 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all items-center">
                <span className="font-bold text-lg tracking-tighter">OpenAI</span>
                <span className="font-bold text-lg tracking-tighter">Anthropic</span>
                <span className="font-bold text-lg tracking-tighter">DeepMind</span>
                <span className="font-bold text-lg tracking-tighter">Mistral</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Demo Component */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-4 bg-accent-violet/20 blur-[60px] rounded-full animate-mesh" />
            <div className="relative bg-surface p-2 rounded-3xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden glass">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                </div>
                <div className="text-[10px] font-mono text-text-muted ml-4 uppercase tracking-widest">AETHEM_FORGE_V3.5</div>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="h-1 w-12 bg-accent-cyan/40 rounded-full" />
                  <div className="h-24 w-full bg-black/40 rounded-xl border border-white/5 p-4">
                    <div className="h-2 w-3/4 bg-white/10 rounded-full mb-2" />
                    <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 flex-1 bg-white/5 rounded-lg border border-white/10" />
                  <div className="h-8 flex-1 bg-white/5 rounded-lg border border-white/10" />
                </div>
                <div className="h-12 bg-accent-violet/20 border border-accent-violet/30 rounded-xl flex items-center justify-center">
                  <span className="text-[10px] font-black tracking-widest text-accent-violet uppercase">Processando...</span>
                </div>
              </div>
            </div>
            
            {/* Floating Accents */}
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-12 -right-8 glass p-4 rounded-2xl border border-accent-cyan/30 shadow-2xl"
            >
              <Cpu size={24} className="text-accent-cyan" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-8 -left-8 glass p-4 rounded-2xl border border-accent-violet/30 shadow-2xl"
            >
              <Zap size={24} className="text-accent-violet" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-white/5 glass">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="text-accent-cyan" size={24} />}
              title="Latência Baixa"
              desc="Infraestrutura global otimizada para tempo de resposta sub-milissegundo em modelos LLM."
            />
            <FeatureCard 
              icon={<Shield className="text-accent-violet" size={24} />}
              title="Segurança Industrial"
              desc="Seus prompts são cifrados via AES-256 e nunca utilizados para treinamento sem seu consentimento."
            />
            <FeatureCard 
              icon={<Terminal className="text-white" size={24} />}
              title="Sintaxe Avançada"
              desc="Compilador nativo que adapta cada comando para o 'dialecto' específico de cada LLM."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-violet/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black tracking-tight text-text-primary mb-4"
          >
            Acesso ao <span className="text-accent-cyan">Neural Core</span>
          </motion.h2>
          <p className="text-text-secondary text-sm md:text-base font-medium">Escolha sua licença de operação e comece a forjar comandos de elite.</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pb-12">
          {/* Plano Mensal */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 glass hover:border-white/10 transition-all flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xl font-black text-text-primary mb-1">Operador Mensal</h3>
              <p className="text-text-muted text-[9px] font-black tracking-[0.3em] uppercase mb-6">Ciclo de faturamento padrão</p>
              
              <div className="text-4xl font-black text-text-primary mb-6 tracking-tighter">
                R$ 49,90<span className="text-sm font-medium text-text-muted ml-2">/mês</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Acesso total à Forja Neural" />
                <PricingFeature text="Histórico de 50 comandos/mês" />
                <PricingFeature text="Integração com GPT-4o e Claude" />
              </ul>
            </div>
            
            <Link 
              to="/auth" 
              className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black text-[11px] uppercase tracking-widest text-center transition-all"
            >
              Ativar Licença
            </Link>
          </motion.div>

          {/* Plano Anual */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-[32px] bg-accent-violet/5 border-2 border-accent-violet/40 glass-dark relative flex flex-col justify-between shadow-xl shadow-accent-violet/10 group overflow-hidden"
          >
            <div className="absolute top-5 right-5 px-3 py-1 bg-accent-violet text-[9px] font-black uppercase tracking-widest rounded-full text-white animate-glow">
              Recomendado
            </div>
            
            <div>
              <h3 className="text-xl font-black text-text-primary mb-1">Comandante Anual</h3>
              <p className="text-accent-cyan text-[9px] font-black tracking-[0.3em] uppercase mb-6 italic">Economia de 65% detectada</p>
              
              <div className="text-4xl font-black text-text-primary mb-6 tracking-tighter">
                R$ 199,90<span className="text-sm font-medium text-text-muted ml-2">/ano</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Tudo do plano mensal" />
                <PricingFeature text="Histórico ilimitado e persistente" />
                <PricingFeature text="Acesso ao Kernel Experimental" />
              </ul>
            </div>

            <Link 
              to="/auth" 
              className="w-full py-4 bg-accent-violet hover:bg-accent-hover text-white rounded-xl font-black text-[11px] uppercase tracking-widest text-center shadow-lg shadow-accent-violet/20 transition-all group-hover:scale-[1.01]"
            >
              Garantir Acesso de Elite
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 glass text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
           <div className="w-8 h-8 bg-black/40 border border-white/10 rounded-lg flex items-center justify-center">
              <Terminal size={14} className="text-accent-violet" />
           </div>
           <span className="font-black italic text-lg tracking-tighter uppercase">AETHEM</span>
        </div>
        <p className="text-text-muted text-xs font-bold tracking-widest uppercase mb-4">© 2024 Silicon Deep Logic Systems. All Rights Reserved.</p>
        <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-text-muted">
           <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
           <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
           <a href="#" className="hover:text-text-primary transition-colors">Kernel_V3_Logs</a>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} className="text-text-secondary hover:text-text-primary transition-all text-sm font-semibold relative group">
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-violet transition-all group-hover:w-full" />
  </a>
);

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5 glass hover:border-white/10 transition-all flex flex-col items-start gap-6"
  >
    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl font-black tracking-tight text-text-primary">{title}</h3>
      <p className="text-text-secondary leading-relaxed text-sm">{desc}</p>
    </div>
  </motion.div>
);

const PricingFeature = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3 text-text-secondary text-sm">
    <CheckCircle2 size={16} className="text-accent-cyan flex-shrink-0" />
    <span>{text}</span>
  </li>
);

export default LandingPage;
