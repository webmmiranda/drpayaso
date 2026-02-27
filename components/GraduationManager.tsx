
import React, { useState, useEffect } from 'react';
import { GraduationRequest } from '../types';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';
import { Trophy, Check, X, Clock, Heart, Award, ZoomIn } from 'lucide-react';

interface GraduationManagerProps {
    useSupabase: boolean;
}

export const GraduationManager: React.FC<GraduationManagerProps> = ({ useSupabase }) => {
    const [requests, setRequests] = useState<GraduationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const service = useSupabase ? SupabaseService : MockService;

    useEffect(() => {
        loadRequests();
    }, [useSupabase]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            // @ts-ignore
            const data = await service.getGraduationRequests();
            setRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (req: GraduationRequest) => {
        if(!confirm(`¿Estás seguro de graduar a ${req.userFullName}? Esto cambiará su rol a Dr. Payaso.`)) return;
        
        try {
            // @ts-ignore
            await service.approveGraduation(req.id);
            alert("¡Graduación Exitosa! 🎓");
            loadRequests();
        } catch (error) {
            alert("Error aprobando graduación");
        }
    };

    const handleReject = async (req: GraduationRequest) => {
        if(!confirm("¿Rechazar esta solicitud?")) return;
        
        try {
            // @ts-ignore
            await service.rejectGraduation(req.id);
            loadRequests();
        } catch (error) {
            alert("Error rechazando solicitud");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando solicitudes...</div>;

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-clown-yellow/10 rounded-full text-clown-yellow">
                    <Trophy size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 font-display">Solicitudes de Graduación</h2>
                    <p className="text-sm text-gray-500">Reclutas listos para recibir su nariz roja.</p>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
                    <Award size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700">No hay solicitudes pendientes</h3>
                    <p className="text-gray-500">¡Motiva a los reclutas a completar sus horas!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-6 flex items-start space-x-4">
                                <div 
                                    className="relative group cursor-pointer"
                                    onClick={() => setPreviewImage(req.userPhoto)}
                                    title="Click para ampliar"
                                >
                                    <img src={req.userPhoto} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-clown-yellow/30" />
                                    <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <ZoomIn size={20} className="text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-800">{req.userFullName}</h3>
                                    <p className="text-xs text-gray-500 mb-4 flex items-center">
                                        <Clock size={12} className="mr-1" />
                                        Solicitado: {new Date(req.requestDate).toLocaleDateString()}
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Entrenamiento</p>
                                            <p className="font-bold text-gray-800">{req.stats.trainingHours} horas</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Visitas</p>
                                            <p className="font-bold text-gray-800">{req.stats.visitsCount} asistidas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 flex justify-end space-x-3 border-t border-gray-100">
                                <button 
                                    onClick={() => handleReject(req)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center"
                                >
                                    <X size={16} className="mr-2" /> Rechazar
                                </button>
                                <button 
                                    onClick={() => handleApprove(req)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center shadow-md shadow-green-200"
                                >
                                    <Check size={16} className="mr-2" /> Aprobar Graduación
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-lg w-full">
                        <button 
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X size={32} />
                        </button>
                        <img 
                            src={previewImage} 
                            alt="Candidato" 
                            className="w-full h-auto rounded-xl shadow-2xl border-4 border-white" 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
