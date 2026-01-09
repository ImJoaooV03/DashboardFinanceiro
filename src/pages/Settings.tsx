import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Plus, Trash2, Tag, ArrowUpCircle, ArrowDownCircle, X, Check, 
  User, Shield, Bell, Moon, Sun, Monitor, Camera, Save, Loader2, Lock, Upload
} from 'lucide-react';
import { clsx } from 'clsx';
import { TransactionType } from '../types';
import { ICON_MAP, IconRenderer } from '../utils/icons';

// Predefined colors for categories
const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', 
  '#f43f5e', '#64748b'
];

interface CategoryFormData {
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

interface ProfileFormData {
  full_name: string;
  bio: string;
  website: string;
}

export const SettingsPage: React.FC = () => {
  const { categories, currentProfile, addCategory, deleteCategory } = useFinance();
  const { user, profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'categories' | 'profile' | 'preferences'>('categories');
  
  // States for Categories
  const [isAdding, setIsAdding] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  
  // State for Profile
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form for Categories
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CategoryFormData>({
    defaultValues: {
      type: 'expense',
      color: COLORS[0],
      icon: 'tag'
    }
  });

  // Form for Profile
  const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile } = useForm<ProfileFormData>();

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      resetProfile({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || ''
      });
    }
  }, [profile, resetProfile]);

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  const onSubmitCategory = async (data: CategoryFormData) => {
    setIsSavingCategory(true);
    try {
      await addCategory({
        ...data,
        profile: currentProfile as any
      });
      reset({ type: 'expense', color: COLORS[0], icon: 'tag' });
      setIsAdding(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar categoria');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsSavingProfile(true);
    try {
      await updateProfile(data);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao atualizar perfil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploadingAvatar(true);

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile
      await updateProfile({ avatar_url: publicUrl });
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao fazer upload da imagem. Verifique se você criou o bucket "avatars" como público no Supabase.');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const tabs = [
    { id: 'categories', label: 'Categorias', icon: Tag },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'preferences', label: 'Preferências', icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
        <p className="text-slate-500">Gerencie suas preferências e dados do sistema.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Navegação */}
        <nav className="lg:w-64 flex-shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500/10"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Área de Conteúdo */}
        <div className="flex-1">
          
          {/* --- TAB: CATEGORIAS --- */}
          {activeTab === 'categories' && (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-800">Gerenciar Categorias</h3>
                  <p className="text-xs text-slate-500">Perfil: {currentProfile === 'personal' ? 'Pessoal' : 'Empresarial'}</p>
                </div>
                {!isAdding && (
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition-all"
                  >
                    <Plus size={16} />
                    Nova Categoria
                  </button>
                )}
              </div>

              {/* Formulário de Adicionar Categoria */}
              <div className={clsx(
                "overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/30",
                isAdding ? "max-h-[800px] opacity-100 border-b border-slate-100" : "max-h-0 opacity-0"
              )}>
                <div className="p-6">
                  <form onSubmit={handleSubmit(onSubmitCategory)} className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-700">Criar Nova Categoria</h4>
                      <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                      </button>
                    </div>

                    {/* Prévia do Cartão */}
                    <div className="flex items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all duration-300"
                          style={{ backgroundColor: selectedColor }}
                        >
                          <IconRenderer iconName={selectedIcon} className="text-white" size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{watch('name') || 'Nome da Categoria'}</p>
                          <span className="text-xs text-slate-500 capitalize">
                            {watch('type') === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">Nome</label>
                        <input
                          {...register('name', { required: 'Nome é obrigatório' })}
                          type="text"
                          placeholder="Ex: Assinaturas"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                        {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                      </div>
                      
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">Tipo</label>
                        <div className="flex gap-2">
                          <label className={clsx(
                            "flex-1 cursor-pointer rounded-lg border px-2 py-2 text-center text-xs font-medium transition-colors hover:bg-white",
                            watch('type') === 'income' 
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          )}>
                            <input type="radio" {...register('type')} value="income" className="hidden" />
                            Receita
                          </label>
                          <label className={clsx(
                            "flex-1 cursor-pointer rounded-lg border px-2 py-2 text-center text-xs font-medium transition-colors hover:bg-white",
                            watch('type') === 'expense' 
                              ? "border-red-500 bg-red-50 text-red-700" 
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          )}>
                            <input type="radio" {...register('type')} value="expense" className="hidden" />
                            Despesa
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Seletor de Ícones */}
                    <div>
                      <label className="mb-2 block text-xs font-medium text-slate-500">Ícone</label>
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200 scrollbar-thin scrollbar-thumb-slate-200">
                        {Object.keys(ICON_MAP).map((iconKey) => (
                          <button
                            key={iconKey}
                            type="button"
                            onClick={() => setValue('icon', iconKey)}
                            className={clsx(
                              "flex items-center justify-center p-2 rounded-lg transition-all hover:bg-slate-50",
                              selectedIcon === iconKey 
                                ? "bg-indigo-50 ring-2 ring-indigo-500 text-indigo-600" 
                                : "text-slate-400"
                            )}
                            title={iconKey}
                          >
                            <IconRenderer iconName={iconKey} size={20} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Seletor de Cores */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">Cor da Etiqueta</label>
                      <div className="flex flex-wrap gap-2">
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setValue('color', color)}
                            className={clsx(
                              "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center",
                              selectedColor === color ? "border-slate-600 scale-110" : "border-transparent"
                            )}
                            style={{ backgroundColor: color }}
                          >
                            {selectedColor === color && <Check size={14} className="text-white drop-shadow-md" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingCategory}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-70 transition-colors"
                      >
                        {isSavingCategory ? 'Salvando...' : 'Salvar Categoria'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Lista de Categorias */}
              <div className="divide-y divide-slate-100">
                {categories.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Tag size={24} />
                    </div>
                    <p className="text-slate-500">Nenhuma categoria encontrada.</p>
                    <p className="text-xs text-slate-400 mt-1">Clique em "Nova Categoria" para começar.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {/* Coluna Receitas */}
                    <div className="p-4 space-y-1">
                      <h4 className="text-xs font-bold uppercase text-emerald-600 mb-4 flex items-center gap-2 px-2">
                        <ArrowUpCircle size={14} /> Receitas
                      </h4>
                      {categories.filter(c => c.type === 'income').map(category => (
                        <div key={category.id} className="group flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div 
                              className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm text-white" 
                              style={{ backgroundColor: category.color }} 
                            >
                              <IconRenderer iconName={category.icon} size={14} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{category.name}</span>
                            {/* Indicador de Categoria do Sistema */}
                            {!category.user_id && (
                              <span className="ml-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200" title="Categoria Padrão do Sistema">
                                Padrão
                              </span>
                            )}
                          </div>
                          
                          {/* Botão de Excluir (Apenas para categorias do usuário) */}
                          {category.user_id === user?.id ? (
                            <button 
                              onClick={() => deleteCategory(category.id)}
                              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-md"
                              title="Excluir categoria"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <div className="text-slate-200 opacity-0 group-hover:opacity-100 transition-all p-1.5" title="Categorias do sistema não podem ser excluídas">
                              <Lock size={14} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Coluna Despesas */}
                    <div className="p-4 space-y-1">
                      <h4 className="text-xs font-bold uppercase text-red-600 mb-4 flex items-center gap-2 px-2">
                        <ArrowDownCircle size={14} /> Despesas
                      </h4>
                      {categories.filter(c => c.type === 'expense').map(category => (
                        <div key={category.id} className="group flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div 
                              className="flex h-8 w-8 items-center justify-center rounded-full shadow-sm text-white" 
                              style={{ backgroundColor: category.color }} 
                            >
                              <IconRenderer iconName={category.icon} size={14} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{category.name}</span>
                            {/* Indicador de Categoria do Sistema */}
                            {!category.user_id && (
                              <span className="ml-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200" title="Categoria Padrão do Sistema">
                                Padrão
                              </span>
                            )}
                          </div>
                          
                          {/* Botão de Excluir (Apenas para categorias do usuário) */}
                          {category.user_id === user?.id ? (
                            <button 
                              onClick={() => deleteCategory(category.id)}
                              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-md"
                              title="Excluir categoria"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <div className="text-slate-200 opacity-0 group-hover:opacity-100 transition-all p-1.5" title="Categorias do sistema não podem ser excluídas">
                              <Lock size={14} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB: PERFIL --- */}
          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div 
                  className="relative group cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                  
                  {isUploadingAvatar ? (
                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-white shadow-md">
                      <Loader2 size={24} className="animate-spin text-indigo-600" />
                    </div>
                  ) : profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || 'Avatar'} 
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-md"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-4 ring-white shadow-md flex items-center justify-center text-white text-2xl font-bold">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                  
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 text-indigo-600">
                    <Upload size={12} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{profile?.full_name || 'Usuário'}</h3>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                  <p className="text-xs text-indigo-600 mt-1 font-medium cursor-pointer hover:underline" onClick={handleAvatarClick}>
                    Alterar foto
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="grid gap-6 md:grid-cols-2 pt-4 border-t border-slate-100">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome Completo</label>
                  <input 
                    {...registerProfile('full_name')}
                    type="text" 
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                  <textarea 
                    {...registerProfile('bio')}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none" 
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                  <input 
                    {...registerProfile('website')}
                    type="url" 
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                    placeholder="https://seu-site.com"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70"
                  >
                    {isSavingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* --- TAB: PREFERÊNCIAS --- */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Aparência</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button className="flex flex-col items-center gap-3 rounded-xl border-2 border-indigo-600 bg-indigo-50/50 p-4 text-indigo-700">
                    <div className="rounded-lg bg-white p-2 shadow-sm"><Sun size={24} /></div>
                    <span className="text-sm font-medium">Claro</span>
                  </button>
                  <button className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 p-4 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all">
                    <div className="rounded-lg bg-slate-100 p-2"><Moon size={24} /></div>
                    <span className="text-sm font-medium">Escuro</span>
                  </button>
                  <button className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 p-4 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all">
                    <div className="rounded-lg bg-slate-100 p-2"><Monitor size={24} /></div>
                    <span className="text-sm font-medium">Sistema</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Notificações</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-indigo-50 p-2 text-indigo-600"><Bell size={18} /></div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Alertas de Pagamento</p>
                        <p className="text-xs text-slate-500">Receber avisos sobre contas a vencer.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" defaultChecked />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/20"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
