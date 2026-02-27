
import React, { useState, useRef } from 'react';
import { UserRole } from '../types';
import { X, Save, UserPlus, Mail, Lock, User as UserIcon, Phone, FileText, UploadCloud } from 'lucide-react';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';

interface AddUserModalProps {
    useSupabase: boolean;
    onClose: () => void;
    onUserAdded: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ useSupabase, onClose, onUserAdded }) => {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        cedula: '',
        phone: '',
        role: UserRole.RECRUIT,
        artisticName: '',
        photoUrl: '' // Added for upload support
    });
    
    const fileRef = useRef<HTMLInputElement>(null);

    const service = useSupabase ? SupabaseService : MockService;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // @ts-ignore - adminCreateUser exists in both services now
            await service.adminCreateUser(formData);
            
            if (useSupabase) {
                alert('✅ Usuario creado exitosamente. Ya puede iniciar sesión.');
            } else {
                alert('✅ Usuario creado en MODO DEMO. Aparecerá en la lista pero desaparecerá al recargar la página.');
            }
            
            onUserAdded();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert('Error: ' + (error.message || 'No se pudo crear el usuario.'));
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
            const url = await SupabaseService.uploadImage(file, 'profiles');
            setFormData(prev => ({ ...prev, photoUrl: url }));
        } catch (error: any) {
            alert("Error subiendo imagen: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-gray-900 p-4 flex justify-between items-center text-white rounded-t-2xl">
                    <div className="flex items-center space-x-2">
                        <UserPlus size={20} className="text-clown-yellow" />
                        <h2 className="font-bold">Nuevo Voluntario</h2>
                    </div>
                    <button onClick={onClose} className="hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Basic Info */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nombre Completo</label>
                        <div className="relative">
                            <UserIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                                required
                                type="text" 
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                                className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm"
                                placeholder="Ej: María Rodríguez"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cédula</label>
                            <div className="relative">
                                <FileText size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input 
                                    required
                                    type="text" 
                                    value={formData.cedula}
                                    onChange={e => setFormData({...formData, cedula: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm"
                                    placeholder="0-0000-0000"
                                />
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Teléfono</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input 
                                    required
                                    type="text" 
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm"
                                    placeholder="8888-8888"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Photo Upload (Simple version for Add) */}
                    <div>
                         <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Foto Inicial (Opcional)</label>
                         <div className="flex items-center space-x-2">
                             <input 
                                type="text" 
                                value={formData.photoUrl}
                                readOnly
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-500"
                                placeholder="Sube una foto..."
                             />
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
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2.5 rounded-lg transition-colors border border-gray-200"
                            >
                                <UploadCloud size={16} />
                            </button>
                         </div>
                         {uploading && <p className="text-xs text-clown-blue mt-1 animate-pulse">Subiendo...</p>}
                    </div>

                    {/* Role Selection */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Rol Asignado</label>
                        <select 
                            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                        >
                            <option value={UserRole.RECRUIT}>Recluta</option>
                            <option value={UserRole.DR_PAYASO}>Dr. Payaso</option>
                            <option value={UserRole.PHOTOGRAPHER}>Fotógrafo</option>
                            <option value={UserRole.VOLUNTEER}>Otro Voluntario</option>
                            <option value={UserRole.ADMIN}>Administrador</option>
                        </select>

                        {/* Extra field for Dr. Payaso */}
                        {formData.role === UserRole.DR_PAYASO && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-xs font-semibold text-clown-red uppercase mb-1">Nombre Artístico</label>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.artisticName}
                                    onChange={e => setFormData({...formData, artisticName: e.target.value})}
                                    className="w-full bg-white border border-red-200 rounded-lg p-2.5 text-sm focus:ring-clown-red"
                                    placeholder="Ej: Dr. Sonrisas"
                                />
                            </div>
                        )}
                    </div>

                    {/* Login Credentials */}
                    <div className="pt-2 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Credenciales de Acceso</h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input 
                                        required
                                        type="email" 
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm"
                                        placeholder="usuario@ejemplo.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contraseña Temporal</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-white border border-gray-200 rounded-lg pl-9 p-2.5 text-sm font-mono"
                                        placeholder="Min. 6 caracteres"
                                        minLength={6}
                                    />
                                </div>
                                <p className="text-[10px] text-orange-500 mt-1">Comparte esta contraseña con el usuario.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || uploading}
                            className="px-4 py-2 text-sm font-bold text-white bg-clown-blue hover:bg-blue-600 rounded-lg flex items-center shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Creando...' : 'Crear Cuenta'}
                            <UserPlus size={16} className="ml-2" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
