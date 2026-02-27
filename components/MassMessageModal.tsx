import React, { useState } from 'react';
import { UserRole } from '../types';
import { X, Send, Megaphone, Check } from 'lucide-react';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';

interface MassMessageModalProps {
    useSupabase: boolean;
    onClose: () => void;
}

export const MassMessageModal: React.FC<MassMessageModalProps> = ({ useSupabase, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    // State for multiple role selection
    const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
    
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const service = useSupabase ? SupabaseService : MockService;

    const availableRoles = Object.values(UserRole);

    const toggleRole = (role: UserRole) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const toggleAll = () => {
        if (selectedRoles.length === availableRoles.length) {
            setSelectedRoles([]);
        } else {
            setSelectedRoles(availableRoles);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRoles.length === 0) {
            alert("Por favor selecciona al menos un grupo de destinatarios.");
            return;
        }

        setLoading(true);
        try {
            await service.sendMassMessage(selectedRoles, subject, body);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            alert('Error enviando mensaje');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl p-8 text-center shadow-2xl animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <Check size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">¡Mensaje Enviado!</h2>
                    <p className="text-gray-500 mt-2">Los voluntarios recibirán la notificación pronto.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-gray-900 p-4 flex justify-between items-center text-white rounded-t-2xl">
                    <div className="flex items-center space-x-2">
                        <Megaphone size={20} className="text-clown-yellow" />
                        <h2 className="font-bold">Mensajería Masiva</h2>
                    </div>
                    <button onClick={onClose} className="hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Destinatarios</label>
                            <button 
                                type="button" 
                                onClick={toggleAll}
                                className="text-xs text-clown-blue hover:underline font-medium"
                            >
                                {selectedRoles.length === availableRoles.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100 max-h-32 overflow-y-auto">
                            {availableRoles.map(role => (
                                <label key={role} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                    <input 
                                        type="checkbox"
                                        checked={selectedRoles.includes(role)}
                                        onChange={() => toggleRole(role)}
                                        className="rounded text-clown-blue focus:ring-clown-blue"
                                    />
                                    <span>{role}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {selectedRoles.length} grupos seleccionados
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Asunto</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm"
                            placeholder="Ej: Cambio de fecha entrenamiento"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mensaje</label>
                        <textarea 
                            required
                            rows={5}
                            className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm resize-none"
                            placeholder="Escribe tu comunicado aquí..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || selectedRoles.length === 0}
                        className="w-full py-3 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Enviar Comunicado'}
                        <Send size={16} className="ml-2" />
                    </button>
                </form>
            </div>
        </div>
    );
};