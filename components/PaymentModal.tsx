
import React, { useState, useEffect, useRef } from 'react';
import { CreatePaymentData, User, UserRole } from '../types';
import { X, DollarSign, User as UserIcon, Calendar, FileText, UploadCloud, CheckCircle } from 'lucide-react';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';

interface PaymentModalProps {
    useSupabase: boolean;
    onClose: () => void;
    onPaymentSuccess: () => void;
    initialUserId?: string;
    currentUser: User; // Need to know WHO is opening the modal
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ useSupabase, onClose, onPaymentSuccess, initialUserId, currentUser }) => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    
    const isAdmin = currentUser.isSuperAdmin || currentUser.role === UserRole.TREASURER || currentUser.role === UserRole.ADMIN;
    const fileRef = useRef<HTMLInputElement>(null);
    
    // Auto-calculate current capitalized month string
    const date = new Date();
    const monthName = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const [formData, setFormData] = useState<CreatePaymentData>({
        userId: isAdmin ? (initialUserId || '') : currentUser.id,
        amount: 5000,
        month: capitalizedMonth,
        notes: '',
        status: isAdmin ? 'paid' : 'pending_approval',
        referenceId: '',
        receiptUrl: ''
    });

    const service = useSupabase ? SupabaseService : MockService;

    useEffect(() => {
        if (isAdmin) {
            service.getAllUsers().then(data => {
                setUsers(data);
                if (initialUserId) {
                    setFormData(prev => ({ ...prev, userId: initialUserId }));
                }
            });
        }
    }, [initialUserId, isAdmin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.userId) return alert("Error: Usuario no definido");
        
        setLoading(true);
        try {
            await service.createPayment(formData);
            if (isAdmin) {
                alert("Pago registrado exitosamente ✅");
            } else {
                alert("Reporte de pago enviado 📨. El tesorero lo validará pronto.");
            }
            onPaymentSuccess();
            onClose();
        } catch (error) {
            alert('Error registrando pago');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        if (!useSupabase) {
            alert("La carga de imágenes requiere Supabase conectado.");
            return;
        }

        setUploading(true);
        try {
            // @ts-ignore
            const url = await SupabaseService.uploadImage(file, 'receipts');
            setFormData(prev => ({ ...prev, receiptUrl: url }));
        } catch (error: any) {
            alert("Error subiendo imagen: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className={`p-4 flex justify-between items-center text-white rounded-t-2xl ${isAdmin ? 'bg-gray-900' : 'bg-clown-blue'}`}>
                    <div className="flex items-center space-x-2">
                        <DollarSign size={20} className="text-white" />
                        <h2 className="font-bold">{isAdmin ? 'Registrar Pago (Admin)' : 'Reportar Mi Pago'}</h2>
                    </div>
                    <button onClick={onClose} className="hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* User Selection (Only for Admin) */}
                    {isAdmin && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Voluntario</label>
                            <div className="relative">
                                <UserIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <select 
                                    required
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm"
                                    value={formData.userId}
                                    onChange={e => setFormData({...formData, userId: e.target.value})}
                                    disabled={!!initialUserId}
                                >
                                    <option value="">Seleccionar...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mes</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm"
                                    placeholder="Ej: Enero 2024"
                                    value={formData.month}
                                    onChange={e => setFormData({...formData, month: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Monto (CRC)</label>
                             <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input 
                                    required
                                    type="number" 
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm"
                                    value={formData.amount}
                                    onChange={e => setFormData({...formData, amount: parseInt(e.target.value)})}
                                />
                             </div>
                        </div>
                    </div>

                    {/* Reference ID (Critical for Reporting) */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            {isAdmin ? 'Referencia (Opcional)' : 'Número de Comprobante / SINPE'}
                        </label>
                        <div className="relative">
                            <FileText size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                required={!isAdmin} // Mandatory for users reporting
                                type="text" 
                                className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm font-mono"
                                placeholder="Ej: 123456"
                                value={formData.referenceId}
                                onChange={e => setFormData({...formData, referenceId: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* RECEIPT UPLOAD - NEW! */}
                    {!isAdmin && (
                        <div className={`p-3 rounded-lg border flex items-center space-x-2 transition-colors ${formData.receiptUrl ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-100'}`}>
                             {formData.receiptUrl ? (
                                <CheckCircle size={20} className="text-green-600 shrink-0" />
                             ) : (
                                <UploadCloud size={20} className="text-clown-blue shrink-0" />
                             )}
                             
                             <div className="flex-1">
                                 {formData.receiptUrl ? (
                                     <div className="flex justify-between items-center">
                                         <p className="text-xs text-green-800 font-bold">Comprobante Adjuntado</p>
                                         <a href={formData.receiptUrl} target="_blank" rel="noreferrer" className="text-[10px] underline text-green-600">Ver</a>
                                     </div>
                                 ) : (
                                     <div>
                                         <p className="text-xs text-blue-800 font-semibold">Adjuntar Comprobante (Imagen)</p>
                                         <p className="text-[10px] text-blue-600">Sube captura del SINPE o Transferencia.</p>
                                     </div>
                                 )}
                             </div>

                             <input 
                                type="file" 
                                ref={fileRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload} 
                             />
                             <button 
                                type="button"
                                disabled={uploading}
                                onClick={() => fileRef.current?.click()}
                                className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded hover:bg-gray-50"
                            >
                                {uploading ? '...' : formData.receiptUrl ? 'Cambiar' : 'Subir'}
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notas Adicionales</label>
                        <textarea 
                            rows={2}
                            className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm resize-none"
                            placeholder="Comentarios extras..."
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || uploading}
                        className={`w-full py-3 text-sm font-bold text-white rounded-lg flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 ${isAdmin ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-clown-blue hover:bg-blue-600 shadow-blue-200'}`}
                    >
                        {loading ? 'Procesando...' : isAdmin ? 'Confirmar Pago' : 'Enviar Reporte'}
                    </button>
                </form>
            </div>
        </div>
    );
};
