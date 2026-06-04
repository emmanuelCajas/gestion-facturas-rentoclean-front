import React, { useEffect, useState } from 'react';
import { clientsService } from '../services/clients';
import { invoicesService } from '../services/invoices';

interface Stats {
  totalClients: number;
  totalInvoices: number;
  monthlyInvoices: number;
  monthlyTotal: number;
}

interface RecentInvoice {
  id: string;
  number: string;
  client: { name: string };
  total: number;
  createdAt: string;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalInvoices: 0,
    monthlyInvoices: 0,
    monthlyTotal: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, invoicesData] = await Promise.all([
          clientsService.findAll('', 1, 1),
          invoicesService.findAll({ limit: 100 }),
        ]);

        const invoices = invoicesData.data.data;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthlyInvoices = invoices.filter(
          (i) => new Date(i.createdAt) >= monthStart
        );

        setStats({
          totalClients: clientsData.data.total,
          totalInvoices: invoicesData.data.total,
          monthlyInvoices: monthlyInvoices.length,
          monthlyTotal: monthlyInvoices.reduce((sum, i) => sum + Number(i.total), 0),
        });

        setRecentInvoices(
          invoices
            .slice(0, 5)
            .map((i) => ({ ...i, client: { name: i.client?.name || 'N/A' } }))
        );
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Total Clientes</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalClients}</div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Total Facturas</div>
          <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.totalInvoices}</div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Facturas del Mes</div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.monthlyInvoices}</div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Total del Mes</div>
          <div className="text-2xl sm:text-3xl font-bold text-orange-600">€{stats.monthlyTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Últimas Facturas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs sm:text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{invoice.number}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{invoice.client.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">€{Number(invoice.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}