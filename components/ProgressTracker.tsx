
import React, { useState } from 'react';
import { User, UserRole, UserStats } from '../types';
import { Trophy, Clock, Heart, Award, Star, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';

interface ProgressTrackerProps {
    user: User;
    stats: UserStats;
    useSupabase: boolean;
    onGraduationRequested: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ user, stats, useSupabase, onGraduationRequested }) => {
    const { config } = useTheme();
    const [requesting, setRequesting] = useState(false);

    // Configurable thresholds (Could come from DB later)
    const REQUIRED_HOURS = 20;
    const REQUIRED_VISITS = 5;

    const hoursPct = Math.min((stats.trainingHours / REQUIRED_HOURS) * 100, 100);
    const visitsPct = Math.min((stats.visitsCount / REQUIRED_VISITS) * 100, 100);
    
    const isReadyToGraduate = hoursPct >= 100 && visitsPct >= 100;

    const handleRequest = async () => {
        if(!confirm("¿Estás listo para enviar tu solicitud a la Junta Directiva?")) return;
        setRequesting(true);
        try {
            const service = useSupabase ? SupabaseService : MockService;
            // @ts-ignore
            await service.requestGraduation(user.id);
            onGraduationRequested();
            alert("¡Solicitud enviada! 🥳");
        } catch (e) {
            alert("Error enviando solicitud");
        } finally {
            setRequesting(false);
        }
    };

    if (user.role !== UserRole.RECRUIT) {
        // Simple "Impact Tracker" for non-recruits
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-3 opacity-10">
                     <Award size={80} className="text-clown-yellow" />
                 </div>
                 <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                    <Star size={20} className="text-clown-yellow mr-2 fill-current" />
                    Mi Impacto Total
                 </h3>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Horas Donadas</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.trainingHours}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Corazones Tocados</p>
                        <p className="text-3xl font-bold text-gray-800">{stats.visitsCount * 15} <span className="text-xs font-normal text-gray-400">(aprox)</span></p>
                    </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-xl text-gray-800 font-display">Mi Camino a la Nariz Roja 🔴</h3>
                    <p className="text-sm text-gray-500">Completa los requisitos para graduarte como Dr. Payaso.</p>
                </div>
                <div className="p-3 bg-red-50 rounded-full text-clown-red">
                    <Trophy size={24} />
                </div>
            </div>

            <div className="space-y-6">
                {/* Training Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-700 flex items-center">
                            <Clock size={16} className="mr-2 text-blue-500" />
                            Horas de Entrenamiento
                        </span>
                        <span className="font-bold text-gray-900">{stats.trainingHours} / {REQUIRED_HOURS} h</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${hoursPct}%` }}
                        >
                            {hoursPct >= 100 && (
                                <div className="absolute -right-2 -top-1 bg-white rounded-full p-0.5 shadow">
                                    <CheckCircle size={16} className="text-blue-500 fill-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Visits Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-700 flex items-center">
                            <Heart size={16} className="mr-2 text-clown-red" />
                            Visitas Hospitalarias
                        </span>
                        <span className="font-bold text-gray-900">{stats.visitsCount} / {REQUIRED_VISITS}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                            className="bg-clown-red h-3 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${visitsPct}%` }}
                        >
                             {visitsPct >= 100 && (
                                <div className="absolute -right-2 -top-1 bg-white rounded-full p-0.5 shadow">
                                    <CheckCircle size={16} className="text-clown-red fill-white" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Graduation Action */}
                <div className="pt-4 border-t border-gray-100 text-center">
                    {stats.graduationRequested ? (
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl border border-yellow-200 text-sm font-semibold flex items-center justify-center">
                            <Clock size={18} className="mr-2" />
                            Tu solicitud está siendo revisada por la Junta.
                        </div>
                    ) : isReadyToGraduate ? (
                        <div className="animate-in zoom-in duration-500">
                             <p className="text-sm text-green-600 font-bold mb-3">¡Felicidades! Has cumplido todos los requisitos. 🎉</p>
                             <button 
                                onClick={handleRequest}
                                disabled={requesting}
                                className="w-full bg-gradient-to-r from-clown-red to-orange-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                             >
                                {requesting ? 'Enviando...' : '🎓 Solicitar Graduación'}
                             </button>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">
                            Sigue asistiendo para desbloquear tu graduación. ¡Tú puedes!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
