import React, { useEffect, useState } from 'react';
import { configService } from '../services/config';
import { Company } from '../types';

export function SettingsPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [sequence, setSequence] = useState<{ nextNumber: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [companyForm, setCompanyForm] = useState({
    name: '',
    cif: '',
    email: '',
    address: '',
    phone: '',
    paymentMethod: '',
  });

  const [sequenceForm, setSequenceForm] = useState({ lastNumber: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyData, sequenceData] = await Promise.all([
          configService.getCompany(),
          configService.getSequence(),
        ]);
        setCompany(companyData.data);
        setSequence(sequenceData.data);
        setCompanyForm({
          name: companyData.data.name,
          cif: companyData.data.cif,
          email: companyData.data.email,
          address: companyData.data.address || '',
          phone: companyData.data.phone || '',
          paymentMethod: companyData.data.paymentMethod,
        });
        setSequenceForm({ lastNumber: String(sequenceData.data.nextNumber - 1) });
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await configService.updateCompany(companyForm);
      setMessage('Datos de empresa guardados');
    } catch (error) {
      setMessage('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await configService.updateSequence(parseInt(sequenceForm.lastNumber));
      const newSequence = await configService.getSequence();
      setSequence(newSequence.data);
      setMessage('Secuencia actualizada');
    } catch (error) {
      setMessage('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Configuración</h2>
      
      {message && (
        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Datos de la Empresa</h3>
          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CIF</label>
                <input
                  type="text"
                  value={companyForm.cif}
                  onChange={(e) => setCompanyForm({ ...companyForm, cif: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
              <input
                type="text"
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Forma de pago</label>
                <input
                  type="text"
                  value={companyForm.paymentMethod}
                  onChange={(e) => setCompanyForm({ ...companyForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Empresa'}
            </button>
          </form>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Secuencia de Facturas</h3>
          <p className="text-sm text-gray-500 mb-4">
            Número siguiente: <span className="font-bold text-blue-600">{sequence?.nextNumber}</span>
          </p>
          <form onSubmit={handleSaveSequence} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Número inicial de secuencia</label>
              <input
                type="number"
                value={sequenceForm.lastNumber}
                onChange={(e) => setSequenceForm({ lastNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                El próximo número será lastNumber + 1
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Actualizar Secuencia'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}