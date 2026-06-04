import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientsService } from '../services/clients';
import { servicesService } from '../services/services';
import { invoicesService } from '../services/invoices';
import { Client, Service } from '../types';

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ serviceId: string; quantity: number }[]>([]);
  const [notes, setNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await clientsService.findAll(search, 1, 100);
      setClients(response.data.data);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.response?.data?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await servicesService.findAll();
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === clients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(clients.map((c) => c.id));
    }
  };

  const handleGenerateInvoices = async () => {
    if (selectedIds.length === 0 || selectedServices.length === 0) return;

    setGenerating(true);
    try {
      await invoicesService.generate({
        clientIds: selectedIds,
        items: selectedServices,
        notes,
      });
      setShowModal(false);
      setSelectedIds([]);
      setSelectedServices([]);
      setNotes('');
      fetchClients();
    } catch (error) {
      console.error('Error generating invoices:', error);
    } finally {
      setGenerating(false);
    }
  };

  const openModal = () => {
    fetchServices();
    setShowModal(true);
  };

  const addService = () => {
    setSelectedServices([...selectedServices, { serviceId: services[0]?.id || '', quantity: 1 }]);
  };

  const updateService = (index: number, field: string, value: string | number) => {
    const updated = [...selectedServices];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedServices(updated);
  };

  const removeService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Clientes</h2>
        <Link
          to="/clients/new"
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center text-sm"
        >
          + Nuevo Cliente
        </Link>
      </div>

      <div className="w-full">
        <input
          type="text"
          placeholder="Buscar por nombre o CIF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
          <button onClick={fetchClients} className="ml-4 underline font-medium">Reintentar</button>
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-sm text-blue-800">{selectedIds.length} cliente(s) seleccionado(s)</span>
          <button
            onClick={openModal}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Generar Factura
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs sm:text-sm text-gray-500">
                <th className="px-3 sm:px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    checked={selectedIds.length === clients.length && clients.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-3 sm:px-4 py-3 font-medium">Nombre</th>
                <th className="px-3 sm:px-4 py-3 font-medium hidden sm:table-cell">CIF</th>
                <th className="px-3 sm:px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="px-3 sm:px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
                </tr>
              ) : clients.length === 0 && !error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay clientes</td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded"
                        checked={selectedIds.includes(client.id)}
                        onChange={() => toggleSelect(client.id)}
                      />
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-800">{client.name}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{client.cif}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{client.email || '-'}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <Link
                        to={`/clients/${client.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Generar Factura</h3>
            <p className="text-sm text-gray-600 mb-4">
              Seleccionados: {selectedIds.length} cliente(s)
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Servicios:</span>
                <button onClick={addService} className="text-blue-600 text-sm font-medium">+ Agregar</button>
              </div>
              {selectedServices.map((s, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={s.serviceId}
                    onChange={(e) => updateService(idx, 'serviceId', e.target.value)}
                    className="flex-1 border rounded px-2 py-1.5 text-sm"
                  >
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.name} - €{svc.price}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={s.quantity}
                    onChange={(e) => updateService(idx, 'quantity', parseInt(e.target.value))}
                    className="w-16 border rounded px-2 py-1.5 text-sm"
                  />
                  <button onClick={() => removeService(idx)} className="text-red-600 font-bold">✕</button>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Observaciones</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateInvoices}
                disabled={generating || selectedServices.length === 0}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {generating ? 'Generando...' : 'Generar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}