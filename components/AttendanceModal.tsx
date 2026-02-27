import React, { useState, useEffect } from 'react';
import { PayasoEvent, AttendanceRecord } from '../types';
import { X, UserCheck, Check, XCircle, Search } from 'lucide-react';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';

interface AttendanceModalProps {
    event: PayasoEvent;
    useSupabase: boolean;
    onClose: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ event, useSupabase, onClose }) => {
    const [attendees, setAttendees] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const service = useSupabase ? SupabaseService : MockService;

    useEffect(() => {
        loadAttendees();
    }, [event.id]);

    const loadAttendees = async () => {
        try {
            const data = await service.getEventAttendees(event.id);
            setAttendees(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMark = async (userId: string, status: 'attended' | 'absent') => {
        // Optimistic UI update
        setAttendees(prev => prev.map(a => 
            a.userId === userId ? { ...a, status } : a
        ));
        
        try {
            await service.markAttendance(event.id, userId, status);
        } catch (error) {
            alert("Error guardando asistencia");
            loadAttendees(); // Revert on error
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="bg-clown-blue p-4 flex justify-between items-center text-white">
                    <div className="flex items-center space-x-2">
                        <UserCheck size={20} />
                        <div>
                            <h2 className="font-bold">Control de Asistencia</h2>
                            <p className="text-xs opacity-90">{event.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar voluntario..." 
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-clown-blue"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Cargando lista...</div>
                    ) : attendees.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No hay voluntarios inscritos aún.</div>
                    ) : (
                        attendees.map(attendee => (
                            <div key={attendee.userId} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <img src={attendee.userPhoto} alt="" className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">{attendee.userFullName}</p>
                                        <p className="text-xs text-gray-500">{attendee.userRole}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => handleMark(attendee.userId, 'absent')}
                                        className={`p-2 rounded-full transition-colors ${
                                            attendee.status === 'absent' 
                                            ? 'bg-red-100 text-red-600' 
                                            : 'text-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        <XCircle size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleMark(attendee.userId, 'attended')}
                                        className={`p-2 rounded-full transition-colors ${
                                            attendee.status === 'attended' 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'text-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        <Check size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                    <p className="text-xs text-gray-500">
                        {attendees.filter(a => a.status === 'attended').length} Presentes / {attendees.length} Inscritos
                    </p>
                </div>
            </div>
        </div>
    );
};