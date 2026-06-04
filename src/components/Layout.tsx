import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm lg:pl-64">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 lg:pl-6">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
              Sistema de Facturación
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="text-xs sm:text-sm text-gray-600 truncate max-w-[150px] sm:max-w-none">
                {user?.email}
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs w-fit">
                {user?.role}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 w-full sm:w-auto"
              >
                Cerrar
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8 lg:pl-6 flex-1">
          <div className="max-w-full lg:max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}