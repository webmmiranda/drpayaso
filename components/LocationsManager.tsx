
import React, { useState, useEffect } from 'react';
import { PayasoLocation } from '../types';
import { MapPin, Plus, Power, PowerOff, Save, X, Navigation, Edit2 } from 'lucide-react';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';

interface LocationsManagerProps {
    useSupabase: boolean;
}

export const LocationsManager: React.FC<LocationsManagerProps> = ({ useSupabase }) => {
    const [locations, setLocations] = useState<PayasoLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        type: 'hospital' as PayasoLocation['type']
    });

    const service = useSupabase ? SupabaseService : MockService;

    useEffect(() => {
        loadLocations();
    }, [useSupabase]);

    const loadLocations = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const data = await service.getLocations(true); // true = include inactive
            setLocations(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ name: '', address: '', type: 'hospital' });
        setShowModal(true);
    };

    const handleOpenEdit = (loc: PayasoLocation) => {
        setEditingId(loc.id);
        setFormData({ name: loc.name, address: loc.address || '', type: loc.type });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                // @ts-ignore
                await service.updateLocation(editingId, {
                    name: formData.name,
                    type: formData.type,
                    address: formData.address
                });
            } else {
                // @ts-ignore
                await service.createLocation(formData.name, formData.type, formData.address);
            }
            setShowModal(false);
            loadLocations();
        } catch (error) {
            alert('Error guardando lugar');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        if(!confirm(`¿${currentStatus ? 'Desactivar' : 'Activar'} este lugar?`)) return;
        
        try {
            // @ts-ignore
            await service.toggleLocationStatus(id, !currentStatus);
            loadLocations();
        } catch (error) {
            alert('Error actualizando estado');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center space-x-2">
                     <h3 className="font-semibold text-gray-700 font-display">Gestión de Centros y Hospitales</h3>
                     <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-mono">{locations.length}</span>
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center text-sm font-bold shadow-sm"
                >
                    <Plus size={16} className="mr-1" /> Nuevo Lugar
                </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
                {locations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">No hay lugares registrados.</div>
                ) : (
                    locations.map(loc => (
                        <div key={loc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                                <div className={`p-3 rounded-xl ${loc.active ? 'bg-blue-50 text-clown-blue' : 'bg-gray-100 text-gray-400'}`}>
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className={`font-bold text-lg ${loc.active ? 'text-gray-800' : 'text-gray-400'}`}>{loc.name}</h4>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold mr-2 tracking-wider ${
                                            loc.type === 'hospital' ? 'bg-red-100 text-red-700' : 
                                            loc.type === 'albergue' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                                        }`}>
                                            {loc.type}
                                        </span>
                                        <span className="truncate max-w-xs">{loc.address}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 pl-14 sm:pl-0">
                                <button 
                                    onClick={() => handleOpenEdit(loc)}
                                    className="p-2 text-gray-400 hover:text-clown-blue hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => toggleStatus(loc.id, loc.active)}
                                    className={`p-2 rounded-lg transition-colors ${loc.active ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                    title={loc.active ? "Desactivar" : "Activar"}
                                >
                                    {loc.active ? <PowerOff size={18} /> : <Power size={18} />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95">
                        <div className="bg-gray-900 p-4 flex justify-between items-center text-white rounded-t-2xl">
                            <div className="flex items-center space-x-2">
                                <MapPin size={20} className="text-clown-yellow" />
                                <h2 className="font-bold">{editingId ? 'Editar Lugar' : 'Agregar Nuevo Lugar'}</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nombre del Lugar</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-clown-blue focus:outline-none"
                                    placeholder="Ej: Hospital San Juan de Dios"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipo de Lugar</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm appearance-none"
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value as any})}
                                    >
                                        <option value="hospital">Hospital</option>
                                        <option value="albergue">Albergue</option>
                                        <option value="escuela">Escuela</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Categoriza el lugar para reportes estadísticos.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Dirección / Ubicación</label>
                                <div className="relative">
                                    <Navigation size={16} className="absolute left-3 top-3 text-gray-400" />
                                    <textarea 
                                        rows={2}
                                        className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm resize-none"
                                        placeholder="Provincia, Cantón, Señas..."
                                        value={formData.address}
                                        onChange={e => setFormData({...formData, address: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-3 text-sm font-bold text-white bg-clown-blue hover:bg-blue-600 rounded-lg flex items-center justify-center shadow-lg"
                            >
                                {loading ? 'Guardando...' : editingId ? 'Actualizar Lugar' : 'Guardar Lugar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
