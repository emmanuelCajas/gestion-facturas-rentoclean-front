import React, { useEffect, useState } from 'react';
import { invoicesService } from '../services/invoices';
import { clientsService } from '../services/clients';
import { Invoice, Client } from '../types';
import api from '../services/api';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    clientId: '',
    page: 1,
    limit: 10,
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoicesService.findAll(filters);
      setInvoices(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientsService.findAll('', 1, 100);
      setClients(response.data.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchInvoices();
  }, [filters]);

  const handleDownload = async (id: string, number: string) => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Facturas</h2>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
            <select
              value={filters.clientId}
              onChange={(e) => setFilters({ ...filters, clientId: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ ...filters, dateFrom: '', dateTo: '', clientId: '', page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs sm:text-sm text-gray-500">
                <th className="px-3 sm:px-4 py-3 font-medium">Número</th>
                <th className="px-3 sm:px-4 py-3 font-medium hidden sm:table-cell">Cliente</th>
                <th className="px-3 sm:px-4 py-3 font-medium">Total</th>
                <th className="px-3 sm:px-4 py-3 font-medium hidden md:table-cell">Fecha</th>
                <th className="px-3 sm:px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay facturas</td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-blue-600">{invoice.number}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-700 hidden sm:table-cell">{invoice.client?.name || 'N/A'}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-gray-800">€{Number(invoice.total).toFixed(2)}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <button
                        onClick={() => handleDownload(invoice.id, invoice.number)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 w-full sm:w-auto"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {filters.page} de {totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page >= totalPages}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 w-full sm:w-auto"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}