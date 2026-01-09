import React, { ReactNode } from 'react';
import { Wallet } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 opacity-90"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-500 mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-pink-500 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-lg shadow-xl border border-white/10">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
            Gerencie suas finanças com <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-pink-200">Inteligência</span>
          </h1>
          <p className="text-lg text-indigo-100 max-w-md leading-relaxed">
            Tenha controle total sobre suas receitas e despesas. Gráficos detalhados, relatórios inteligentes e muito mais em um só lugar.
          </p>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-10 w-10 rounded-full border-2 border-indigo-500 bg-slate-200 bg-[url('https://i.pravatar.cc/100?img=${i+10}')] bg-cover`}></div>
              ))}
            </div>
            <p className="text-sm font-medium text-indigo-100">Junte-se a +10.000 usuários</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                <Wallet size={24} />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          </div>

          {children}

          <div className="mt-8 text-center text-xs text-slate-400">
            &copy; 2025 Dualite Finance. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </div>
  );
};
