
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { X, Save, Shield, UserCog, AlignLeft, StickyNote, Mail, Phone, MapPin, Smile, User as UserIcon, Camera, Zap, DollarSign, Layers, UploadCloud, Lock, Unlock, FileText } from 'lucide-react';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';

interface UserProfileModalProps {
    user: User;
    mode: 'admin' | 'self'; 
    useSupabase: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, mode, useSupabase, onClose, onUpdate }) => {
    const isAdminMode = mode === 'admin';
    // State for locking/unlocking the form
    const [isEditing, setIsEditing] = useState(isAdminMode); // Admins start unlocked, users start locked

    const [formData, setFormData] = useState({
        // Admin Fields
        role: user.role, 
        availableRoles: user.availableRoles || [user.role], 
        isSuperAdmin: user.isSuperAdmin || false,
        adminNotes: user.adminNotes || '',
        status: user.status,
        exemptFromFees: user.exemptFromFees || false, 
        
        // Personal Fields (Now includes email/cedula)
        fullName: user.fullName,
        email: user.email, // Added
        cedula: user.cedula, // Added
        phone: user.phone,
        whatsapp: user.whatsapp,
        address: user.address || '',
        
        // Photos
        photoUrl: user.photoUrl,
        characterPhotoUrl: user.characterPhotoUrl || '',

        // Artistic Fields
        artisticName: user.artisticName || '',
        skills: user.skills || '',
    });

    // Password Change State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Toggle for header preview
    const [showCharacterPreview, setShowCharacterPreview] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Refs for file inputs
    const profilePicRef = useRef<HTMLInputElement>(null);
    const charPicRef = useRef<HTMLInputElement>(null);

    const service = useSupabase ? SupabaseService : MockService;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await service.updateUserProfile(user.id, formData);
            
            // Handle Password Change
            if (newPassword && useSupabase) {
                if (newPassword !== confirmPassword) {
                    alert("Las contraseñas no coinciden.");
                    setLoading(false);
                    return;
                }
                if (newPassword.length < 6) {
                    alert("La contraseña debe tener al menos 6 caracteres.");
                    setLoading(false);
                    return;
                }
                
                try {
                    // @ts-ignore
                    await SupabaseService.changePassword(newPassword);
                    alert("Contraseña actualizada exitosamente.");
                } catch (pwError: any) {
                    alert("Error cambiando contraseña: " + pwError.message);
                }
            }

            onUpdate();
            onClose();
        } catch (error) {
            alert('Error actualizando perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'character') => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        if (!useSupabase) {
            alert("La carga de imágenes requiere Supabase conectado.");
            return;
        }

        setUploading(true);
        try {
            // @ts-ignore - SupabaseService has uploadImage
            const url = await SupabaseService.uploadImage(file, type === 'profile' ? 'profiles' : 'characters');
            if (type === 'profile') {
                setFormData(prev => ({ ...prev, photoUrl: url }));
            } else {
                setFormData(prev => ({ ...prev, characterPhotoUrl: url }));
            }
        } catch (error: any) {
            alert("Error subiendo imagen: " + error.message);
        } finally {
            setUploading(false);
        }
    };
    
    const handleDevMakeAdmin = async () => {
        if (!confirm("⚠️ MODO DESARROLLADOR\n¿Estás seguro de asignarte el rol de SUPER ADMIN?\nEsto modificará la base de datos directamente.")) return;
        
        setLoading(true);
        try {
            if (useSupabase) {
                await SupabaseService.dev_makeAdmin(user.id);
                alert("✅ ¡Rol actualizado a ADMIN! Por favor, cierra sesión y vuelve a entrar o recarga la página para ver los cambios.");
                onUpdate();
                onClose();
            }
        } catch (e: any) {
            alert("Error: " + e.message + "\n\nSi esto falla por permisos, usa el SQL proporcionado.");
        } finally {
            setLoading(false);
        }
    };

    const toggleAvailableRole = (role: UserRole) => {
        const currentRoles = formData.availableRoles;
        let newRoles: UserRole[];
        
        if (currentRoles.includes(role)) {
            if (role === formData.role) {
                alert("No puedes eliminar el rol principal. Cambia el rol principal primero.");
                return;
            }
            newRoles = currentRoles.filter(r => r !== role);
        } else {
            newRoles = [...currentRoles, role];
        }
        setFormData({ ...formData, availableRoles: newRoles });
    };

    const isDrPayaso = formData.role === UserRole.DR_PAYASO;
    const currentPreviewUrl = (showCharacterPreview && formData.characterPhotoUrl) 
        ? formData.characterPhotoUrl 
        : formData.photoUrl;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="bg-gray-900 p-4 flex justify-between items-center text-white rounded-t-2xl shrink-0">
                    <div className="flex items-center space-x-2">
                        <UserCog size={20} className="text-clown-yellow" />
                        <h2 className="font-bold font-display">
                            {isAdminMode ? 'Gestionar Voluntario' : 'Mi Perfil'}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        {!isAdminMode && (
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                    isEditing ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                                title={isEditing ? "Bloquear Edición" : "Desbloquear para Editar"}
                            >
                                {isEditing ? <Unlock size={14} /> : <Lock size={14} />}
                                <span>{isEditing ? 'Desbloqueado' : 'Bloqueado'}</span>
                            </button>
                        )}
                        <button onClick={onClose} className="hover:text-gray-300">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Header Preview */}
                    <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100 relative">
                        <div className="relative group">
                            {currentPreviewUrl ? (
                                <img 
                                    src={currentPreviewUrl} 
                                    alt={user.fullName} 
                                    className="w-20 h-20 rounded-full border-4 border-gray-100 shadow-sm object-cover bg-gray-100" 
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full border-4 border-gray-100 shadow-sm bg-gray-100 flex items-center justify-center text-gray-400">
                                    <UserIcon size={32} />
                                </div>
                            )}
                            
                            {/* Toggle Button for Preview if Dr Payaso */}
                            {isDrPayaso && (
                                <button 
                                    type="button"
                                    onClick={() => setShowCharacterPreview(!showCharacterPreview)}
                                    className="absolute -bottom-2 -right-2 bg-gray-900 text-white p-1.5 rounded-full border-2 border-white shadow-md text-[10px] font-bold z-10 hover:bg-gray-700"
                                    title="Cambiar vista previa"
                                >
                                    {showCharacterPreview ? <UserIcon size={12}/> : <Smile size={12} />}
                                </button>
                            )}
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 font-display">
                                {formData.artisticName || formData.fullName}
                            </h3>
                            <p className="text-gray-500">{formData.cedula || 'Sin cédula'}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 font-mono`}>
                                    {formData.email}
                                </span>
                                {isAdminMode && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${formData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {formData.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Personal Information */}
                        <div className={`p-4 rounded-xl border transition-colors ${isEditing ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                             <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center font-display">
                                <AlignLeft size={16} className="mr-2" />
                                Información Personal
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nombre Completo</label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={formData.fullName}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                        className={`w-full rounded-lg p-2 text-sm border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-600 cursor-not-allowed'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center">
                                        <Mail size={12} className="mr-1"/> Correo Electrónico
                                    </label>
                                    <input 
                                        type="email" 
                                        disabled={!isEditing}
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className={`w-full rounded-lg p-2 text-sm font-mono border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-600 cursor-not-allowed'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center">
                                        <FileText size={12} className="mr-1"/> Cédula
                                    </label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={formData.cedula}
                                        onChange={e => setFormData({...formData, cedula: e.target.value})}
                                        className={`w-full rounded-lg p-2 text-sm font-mono border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-600 cursor-not-allowed'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center">
                                        <Phone size={12} className="mr-1"/> Teléfono
                                    </label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        className={`w-full rounded-lg p-2 text-sm font-mono border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-600 cursor-not-allowed'}`}
                                    />
                                </div>
                                <div>
                                     <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center">
                                        <MapPin size={12} className="mr-1"/> Dirección
                                    </label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={formData.address}
                                        onChange={e => setFormData({...formData, address: e.target.value})}
                                        placeholder="Provincia, Cantón, Distrito..."
                                        className={`w-full rounded-lg p-2 text-sm border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent text-gray-600 cursor-not-allowed'}`}
                                    />
                                </div>
                            </div>
                        </div>

                         {/* Photos Management */}
                         <div className={`p-4 rounded-xl border transition-colors ${isEditing ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-100 opacity-80'}`}>
                             <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center font-display">
                                <Camera size={16} className="mr-2" />
                                Fotos de Perfil {isEditing ? '' : '(Bloqueado)'}
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                {/* Profile Photo */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center">
                                        <UserIcon size={12} className="mr-1"/> Foto Civil
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="text" 
                                            disabled={!isEditing}
                                            value={formData.photoUrl}
                                            onChange={e => setFormData({...formData, photoUrl: e.target.value})}
                                            className={`flex-1 rounded-lg p-2 text-sm font-mono text-xs border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                            placeholder="https://..."
                                        />
                                        {isEditing && (
                                            <>
                                                <input 
                                                    type="file" 
                                                    ref={profilePicRef} 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, 'profile')} 
                                                />
                                                <button 
                                                    type="button"
                                                    disabled={uploading}
                                                    onClick={() => profilePicRef.current?.click()}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
                                                    title="Subir imagen"
                                                >
                                                    <UploadCloud size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Character Photo */}
                                {isDrPayaso && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center">
                                            <Smile size={12} className="mr-1 text-clown-red"/> Foto Personaje
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="text" 
                                                disabled={!isEditing}
                                                value={formData.characterPhotoUrl}
                                                onChange={e => setFormData({...formData, characterPhotoUrl: e.target.value})}
                                                className={`flex-1 rounded-lg p-2 text-sm font-mono text-xs border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                                placeholder="https://..."
                                            />
                                            {isEditing && (
                                                <>
                                                    <input 
                                                        type="file" 
                                                        ref={charPicRef} 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, 'character')} 
                                                    />
                                                    <button 
                                                        type="button"
                                                        disabled={uploading}
                                                        onClick={() => charPicRef.current?.click()}
                                                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
                                                        title="Subir imagen"
                                                    >
                                                        <UploadCloud size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {uploading && <p className="text-xs text-clown-blue animate-pulse">Subiendo imagen...</p>}
                            </div>
                        </div>

                        {/* Artistic Profile */}
                        <div className={`p-4 rounded-xl border transition-colors ${isEditing ? 'bg-clown-yellow/10 border-clown-yellow/30' : 'bg-gray-50 border-gray-100'}`}>
                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center font-display">
                                <Smile size={16} className="mr-2 text-clown-yellow" />
                                Perfil Artístico
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                                {isDrPayaso && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nombre Artístico</label>
                                        <input 
                                            type="text" 
                                            disabled={!isEditing}
                                            value={formData.artisticName}
                                            onChange={e => setFormData({...formData, artisticName: e.target.value})}
                                            className={`w-full rounded-lg p-2 text-sm border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                            placeholder="Ej: Dr. Risas"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Habilidades / Talentos</label>
                                    <textarea 
                                        rows={3}
                                        disabled={!isEditing}
                                        className={`w-full rounded-lg p-2.5 text-sm resize-none border ${isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent cursor-not-allowed'}`}
                                        placeholder="Ej: Magia, Globos, Música..."
                                        value={formData.skills}
                                        onChange={e => setFormData({...formData, skills: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECURITY SECTION */}
                        {isEditing && !isAdminMode && useSupabase && (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-bottom-2">
                                <h4 className="text-sm font-bold text-red-800 mb-3 flex items-center font-display">
                                    <Lock size={16} className="mr-2" />
                                    Cambiar Contraseña
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-red-600 uppercase mb-1">Nueva Contraseña</label>
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="w-full bg-white border border-red-200 rounded-lg p-2 text-sm"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-red-600 uppercase mb-1">Confirmar Contraseña</label>
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className="w-full bg-white border border-red-200 rounded-lg p-2 text-sm"
                                            placeholder="Repite la contraseña"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin Sections */}
                        {isAdminMode && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center font-display">
                                    <Shield size={16} className="mr-2" />
                                    Administración (Roles y Permisos)
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-blue-600 uppercase mb-1">Rol Principal</label>
                                        <select 
                                            className="w-full border border-blue-200 rounded-lg p-2 text-sm bg-white"
                                            value={formData.role}
                                            onChange={e => {
                                                const newRole = e.target.value as UserRole;
                                                const updatedAvailable = formData.availableRoles.includes(newRole) 
                                                    ? formData.availableRoles 
                                                    : [...formData.availableRoles, newRole];
                                                setFormData({ ...formData, role: newRole, availableRoles: updatedAvailable });
                                            }}
                                        >
                                            {Object.values(UserRole).map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center">
                                            <StickyNote size={14} className="mr-1" />
                                            Notas Privadas
                                        </label>
                                        <textarea 
                                            rows={2}
                                            className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm resize-none"
                                            value={formData.adminNotes}
                                            onChange={e => setFormData({...formData, adminNotes: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Developer Action */}
                        {useSupabase && !isAdminMode && (
                            <div className="border-t border-dashed border-gray-200 pt-4 mt-8">
                                <button
                                    type="button"
                                    onClick={handleDevMakeAdmin}
                                    className="text-xs text-gray-400 hover:text-red-600 flex items-center space-x-1 transition-colors"
                                >
                                    <Zap size={12} />
                                    <span>(DEV) Hacerme Admin</span>
                                </button>
                            </div>
                        )}

                    </form>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end space-x-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancelar
                    </button>
                    {isEditing && (
                        <button 
                            type="submit" 
                            form="profileForm"
                            disabled={loading || uploading}
                            className="px-4 py-2 text-sm font-bold text-white bg-clown-blue hover:bg-blue-600 rounded-lg flex items-center shadow-lg shadow-blue-200 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                            <Save size={16} className="ml-2" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
