import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Project } from '../api/types';
import { api } from '../api/client';

type Page = 'dashboard' | 'vms' | 'billing';

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  projects: Project[];
  currentPage: Page;
  language: 'ru' | 'uz' | 'en';
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

  useEffect(() => {
    // Автоматическая загрузка данных при старте
    const initApp = async () => {
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
      } catch (err) {
        console.error('Failed to initialize app:', err);
        // Если API недоступен, показываем экран ошибки
        setIsAuthenticated(false);
        setUser(null);
        setProjects([]);
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
