import React, { useEffect, useState } from 'react';
import { communitiesService } from '../services/communities';
import { clientsService } from '../services/clients';
import { Community, Client } from '../types';
import { useAuth } from '../context/AuthContext';

export function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [form, setForm] = useState({ name: '', address: '', clientId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterClientId, setFilterClientId] = useState<string>('');

  const fetchCommunities = async () => {
    try {
      const response = await communitiesService.getAll(filterClientId || undefined);
      setCommunities(response);
    } catch (error) {
      console.error('Error fetching communities:', error);
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
    fetchCommunities();
  }, [filterClientId]);

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await communitiesService.update(editingId, { name: form.name, address: form.address });
      } else {
        await communitiesService.create(form);
      }
      setShowModal(false);
      setForm({ name: '', address: '', clientId: '' });
      setEditingId(null);
      fetchCommunities();
    } catch (error) {
      console.error('Error saving community:', error);
    }
  };

  const openEdit = (community: Community) => {
    setEditingId(community.id);
    setForm({ name: community.name, address: community.address, clientId: community.clientId });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ name: '', address: '', clientId: clients[0]?.id || '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta comunidad?')) return;
    try {
      await communitiesService.delete(id);
      fetchCommunities();
    } catch (error) {
      console.error('Error deleting community:', error);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || clientId;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Comunidades</h2>
        {isAdmin && (
          <button
            onClick={openNew}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + Nueva Comunidad
          </button>
        )}
      </div>

      <div className="w-full sm:w-64">
        <select
          value={filterClientId}
          onChange={(e) => setFilterClientId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Todas las comunidades</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.cif})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs sm:text-sm text-gray-500">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Dirección</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Cliente</th>
                {isAdmin && <th className="px-4 py-3 font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
                </tr>
              ) : communities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No hay comunidades</td>
                </tr>
              ) : (
                communities.map((community) => (
                  <tr key={community.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{community.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{community.address}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                      {getClientName(community.clientId)}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(community)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(community.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {editingId ? 'Editar Comunidad' : 'Nueva Comunidad'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.cif})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}