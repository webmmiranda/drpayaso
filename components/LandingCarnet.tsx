
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, ArrowRight, LogOut, User as UserIcon, RefreshCw, Smile } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LandingCarnetProps {
    user: User;
    onEnter: () => void;
    onLogout: () => void;
}

export const LandingCarnet: React.FC<LandingCarnetProps> = ({ user, onEnter, onLogout }) => {
    const { config } = useTheme();
    const [isFlipped, setIsFlipped] = useState(false);
    
    const isDrPayaso = user.role === UserRole.DR_PAYASO;
    
    // Logic: If Dr. Payaso, we have two sides. If not, only "front".
    const hasDualIdentity = isDrPayaso;

    // Toggle Flip
    const handleFlip = () => {
        if (hasDualIdentity) {
            setIsFlipped(!isFlipped);
        }
    };

    // Determine current display data based on flip state
    // Default (Front) = Real Info. Flipped (Back) = Character Info.
    const displayName = (hasDualIdentity && isFlipped) ? (user.artisticName || 'Sin Nombre Artístico') : user.fullName;
    const displayRole = (hasDualIdentity && isFlipped) ? 'Personaje' : user.role;
    
    // Fallback logic for photos
    const realPhoto = user.photoUrl;
    const characterPhoto = user.characterPhotoUrl;

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-clown-red to-red-900 rounded-b-[3rem] z-0 shadow-2xl"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl z-0"></div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                
                {/* THE CARD */}
                <div className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden relative aspect-[3/4.5] flex flex-col">
                    
                    {/* Header Hole for Lanyard */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gray-200 rounded-full shadow-inner z-20"></div>

                    {/* Branding Header */}
                    <div className="bg-gray-50 pt-10 pb-4 px-6 text-center border-b border-gray-100">
                        <div className="flex justify-center items-center space-x-2 mb-1">
                             {config.logoUrl && (
                                <img src={config.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                            )}
                            <h2 className="font-bold text-gray-800 tracking-wider font-display uppercase text-sm">
                                {config.appName}
                            </h2>
                        </div>
                        <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">Credencial Oficial</p>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col items-center justify-center p-6 relative perspective-[1000px]">
                        
                        {/* FLIP CONTAINER */}
                        <div 
                            className={`relative w-48 h-48 cursor-pointer transition-all duration-700 mb-6 group`}
                            style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                            onClick={handleFlip}
                        >
                            {/* FRONT SIDE (Real Identity) */}
                            <div 
                                className="absolute inset-0 w-full h-full rounded-full p-1 bg-gradient-to-br from-gray-200 to-gray-400 shadow-xl backface-hidden"
                                style={{ backfaceVisibility: 'hidden' }}
                            >
                                <div className="w-full h-full rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center relative">
                                    {realPhoto ? (
                                        <img src={realPhoto} alt="Real" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={64} className="text-gray-300" />
                                    )}
                                    
                                    {/* Verified Badge */}
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm z-10">
                                        <ShieldCheck size={14} />
                                    </div>
                                    
                                    {/* Tap Hint */}
                                    {hasDualIdentity && (
                                        <div className="absolute bottom-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center animate-pulse">
                                            <RefreshCw size={10} className="mr-1" /> Girar
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BACK SIDE (Clown Identity) */}
                            <div 
                                className="absolute inset-0 w-full h-full rounded-full p-1 bg-gradient-to-br from-clown-red to-clown-yellow shadow-xl"
                                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            >
                                <div className="w-full h-full rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center relative">
                                    {characterPhoto ? (
                                        <img src={characterPhoto} alt="Character" className="w-full h-full object-cover" />
                                    ) : (
                                        <Smile size={64} className="text-clown-yellow" />
                                    )}
                                    
                                    <div className="absolute top-2 right-2 bg-clown-red text-white p-1 rounded-full border-2 border-white shadow-sm z-10">
                                        <Smile size={14} />
                                    </div>

                                    {/* Tap Hint */}
                                    <div className="absolute bottom-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center animate-pulse">
                                        <RefreshCw size={10} className="mr-1" /> Volver
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Names (Updates based on flip) */}
                        <div className="text-center transition-opacity duration-300 ease-in-out min-h-[5rem]">
                            <h1 className="text-3xl font-bold text-gray-900 font-display leading-tight mb-1 animate-in fade-in slide-in-from-bottom-2 key={isFlipped ? 'back' : 'front'}">
                                {displayName}
                            </h1>
                            
                            <div className="inline-block bg-gray-100 px-3 py-1 rounded-full mb-3">
                                <span className={`text-xs font-bold uppercase tracking-wide transition-colors duration-300 ${isFlipped ? 'text-clown-red' : 'text-gray-600'}`}>
                                    {displayRole}
                                </span>
                            </div>

                            {/* Show basic info always, but change context if needed */}
                            <p className="text-sm text-gray-400 font-mono">
                                ID: {user.cedula || '---'}
                            </p>
                        </div>
                    </div>

                    {/* Footer Status */}
                    <div className="bg-green-500 py-2 text-center">
                        <p className="text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center">
                            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                            Miembro Activo
                        </p>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="w-full mt-6 space-y-3 px-4">
                    <button 
                        onClick={onEnter}
                        className="w-full bg-white text-gray-900 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-black/20 flex items-center justify-between px-6 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                        <span>Ingresar al Sistema</span>
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-clown-red group-hover:text-white transition-colors">
                            <ArrowRight size={18} />
                        </div>
                    </button>

                    <button 
                        onClick={onLogout}
                        className="w-full py-3 text-white/60 text-sm font-medium hover:text-white flex items-center justify-center transition-colors"
                    >
                        <LogOut size={16} className="mr-2" />
                        Cerrar Sesión / Cambiar Cuenta
                    </button>
                </div>
                
                <p className="text-white/20 text-[10px] mt-4">v1.0.3 • PWA Secured</p>
            </div>
        </div>
    );
};
