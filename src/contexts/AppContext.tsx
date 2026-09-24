import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Project } from '../api/types';
import { api } from '../api/client';
import type { Page } from '../components/Layout';

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  projects: Project[];
  currentPage: Page;
  language: 'ru' | 'uz' | 'en';
  isLoading: boolean;
  loadError: string | null;
  setCurrentPage: (page: Page) => void;
  setLanguage: (lang: 'ru' | 'uz' | 'en') => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [language, setLanguage] = useState<'ru' | 'uz' | 'en'>('ru');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Автоматическая загрузка данных при старте
    const initApp = async () => {
      setIsLoading(true);
      try {
        // Загружаем данные пользователя
        const userData = await api.user.get();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Загружаем проекты для выбора при создании ВМ
        try {
          const projectsData = await api.projects.list();
          setProjects(projectsData);
        } catch (err) {
          console.warn('Failed to load projects:', err);
          setProjects([]);
        }
        setLoadError(null);
      } catch (err) {
        console.error('Failed to initialize app, using demo mode:', err);
        // Если API недоступен (CORS в preview), показываем демо
        setUser({
          id: 1,
          email: 'demo@uzcloud.uz',
          first_name: 'Demo',
          last_name: 'User',
        });
        setIsAuthenticated(true);
        setProjects([{ id: 1, name: 'Default', slug: 'default', is_default: true }]);
        setLoadError('DEMO_MODE');
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setProjects([]);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        projects,
        currentPage,
        language,
        isLoading,
        loadError,
        setCurrentPage,
        setLanguage,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
