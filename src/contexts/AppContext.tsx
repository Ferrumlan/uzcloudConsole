import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Project } from '../api/types';

type Page = 'dashboard' | 'vms' | 'networking' | 'storage' | 'snapshots' | 'billing' | 'kubernetes' | 'objectStorage' | 'settings';

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  projects: Project[];
  selectedProject: string;
  currentPage: Page;
  language: 'ru' | 'uz' | 'en';
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setSelectedProject: (slug: string) => void;
  setCurrentPage: (page: Page) => void;
  setLanguage: (lang: 'ru' | 'uz' | 'en') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState('production');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [language, setLanguage] = useState<'ru' | 'uz' | 'en'>('ru');

  const login = async (email: string, password: string) => {
    // Mock login
    const mockUser: User = {
      id: 1,
      email: email,
      first_name: 'Admin',
      last_name: 'User',
    };
    setUser(mockUser);
    setToken('mock-token-' + Date.now());
    setIsAuthenticated(true);
    
    // Mock projects
    setProjects([
      { id: 1, slug: 'production', name: 'Production', is_default: true },
      { id: 2, slug: 'staging', name: 'Staging', is_default: false },
      { id: 3, slug: 'development', name: 'Development', is_default: false },
    ]);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setProjects([]);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        projects,
        selectedProject,
        currentPage,
        language,
        login,
        logout,
        setSelectedProject,
        setCurrentPage,
        setLanguage,
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
