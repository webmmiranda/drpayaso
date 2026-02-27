
import React, { useState, useEffect } from 'react';
import { EventType, CreateEventData, PayasoLocation } from '../types';
import { X, CalendarPlus, MapPin, AlignLeft, Users } from 'lucide-react';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';

interface CreateEventModalProps {
    useSupabase: boolean;
    onClose: () => void;
    onEventCreated: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ useSupabase, onClose, onEventCreated }) => {
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<PayasoLocation[]>([]);
    const [isCustomLocation, setIsCustomLocation] = useState(false);
    
    const [formData, setFormData] = useState<CreateEventData>({
        title: '',
        type: EventType.VISIT,
        date: '',
        time: '',
        location: '',
        description: '',
        capacity: {
            recruit: 0,
            dr_payaso: 2,
            photographer: 1,
            volunteer: 0
        }
    });

    const service = useSupabase ? SupabaseService : MockService;

    useEffect(() => {
        // Load locations on mount
        const fetchLocations = async () => {
             try {
                 // @ts-ignore
                 const locs = await service.getLocations();
                 setLocations(locs);
             } catch (e) {
                 console.error("Error fetching locations", e);
             }
        };
        fetchLocations();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await service.createEvent(formData);
            onEventCreated();
            onClose();
        } catch (error) {
            alert('Error creando evento');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'custom') {
            setIsCustomLocation(true);
            setFormData({ ...formData, location: '', locationId: undefined });
        } else {
            setIsCustomLocation(false);
            const selectedLoc = locations.find(l => l.id === val);
            if (selectedLoc) {
                setFormData({ ...formData, location: selectedLoc.name, locationId: selectedLoc.id });
            } else {
                setFormData({ ...formData, location: '', locationId: undefined });
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-gray-900 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center space-x-2">
                        <CalendarPlus size={20} className="text-clown-yellow" />
                        <h2 className="font-bold">Nueva Actividad</h2>
                    </div>
                    <button onClick={onClose} className="hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Título</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                            placeholder="Ej: Visita Hospital de Niños"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipo</label>
                        <select 
                            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value as EventType})}
                        >
                            <option value={EventType.VISIT}>Visita Hospitalaria</option>
                            <option value={EventType.TRAINING}>Entrenamiento</option>
                        </select>
                    </div>

                    {/* Granular Capacity Inputs */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center mb-2 text-gray-700">
                            <Users size={14} className="mr-2" />
                            <span className="text-xs font-bold uppercase">Cupos por Rol</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Dr. Payaso</label>
                                <input 
                                    type="number" min="0"
                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm"
                                    value={formData.capacity.dr_payaso}
                                    onChange={e => setFormData({...formData, capacity: {...formData.capacity, dr_payaso: parseInt(e.target.value)}})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Reclutas</label>
                                <input 
                                    type="number" min="0"
                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm"
                                    value={formData.capacity.recruit}
                                    onChange={e => setFormData({...formData, capacity: {...formData.capacity, recruit: parseInt(e.target.value)}})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Fotógrafos</label>
                                <input 
                                    type="number" min="0"
                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm"
                                    value={formData.capacity.photographer}
                                    onChange={e => setFormData({...formData, capacity: {...formData.capacity, photographer: parseInt(e.target.value)}})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Otros</label>
                                <input 
                                    type="number" min="0"
                                    className="w-full bg-white border border-gray-200 rounded p-2 text-sm"
                                    value={formData.capacity.volunteer}
                                    onChange={e => setFormData({...formData, capacity: {...formData.capacity, volunteer: parseInt(e.target.value)}})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fecha</label>
                            <input 
                                required
                                type="date" 
                                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Hora</label>
                            <input 
                                required
                                type="time" 
                                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm"
                                value={formData.time}
                                onChange={e => setFormData({...formData, time: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ubicación</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                            
                            {!isCustomLocation ? (
                                <select 
                                    className="w-full border border-gray-200 rounded-lg pl-9 p-2.5 text-sm bg-white appearance-none"
                                    onChange={handleLocationChange}
                                    defaultValue=""
                                    required={!isCustomLocation}
                                >
                                    <option value="" disabled>Seleccione un lugar...</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.name} ({loc.type})
                                        </option>
                                    ))}
                                    <option value="custom" className="font-bold text-clown-blue">+ Otra Ubicación Manual</option>
                                </select>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm focus:ring-2 focus:ring-clown-blue"
                                        placeholder="Ej: Ala Norte, Piso 3"
                                        value={formData.location}
                                        onChange={e => setFormData({...formData, location: e.target.value})}
                                        autoFocus
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setIsCustomLocation(false)}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                        title="Volver a lista"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Descripción</label>
                        <div className="relative">
                            <AlignLeft size={16} className="absolute left-3 top-3 text-gray-400" />
                            <textarea 
                                required
                                rows={3}
                                className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm resize-none"
                                placeholder="Detalles importantes para los voluntarios..."
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center"
                        >
                            {loading ? 'Creando...' : 'Publicar Actividad'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
