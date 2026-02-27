import React from 'react';
import { User } from '../types';
import { ShieldCheck } from 'lucide-react';

interface DigitalIDProps {
  user: User;
  onClose: () => void;
}

export const DigitalID: React.FC<DigitalIDProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-clown-red p-4 text-white text-center relative">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
                ✕
            </button>
            <h2 className="text-xl font-bold uppercase tracking-wider">Identificación Oficial</h2>
            <p className="text-sm opacity-90">Organización Dr. Payaso</p>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
            <div className="relative mb-4">
                <img 
                    src={user.characterPhotoUrl || user.photoUrl} 
                    alt="ID Photo" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-clown-yellow shadow-lg"
                />
                <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                    <ShieldCheck size={16} />
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 text-center font-display">
                {user.artisticName ? user.artisticName : user.fullName}
            </h1>
            <p className="text-clown-red font-semibold mb-6 uppercase tracking-widest text-sm">
                {user.role}
            </p>

            <div className="w-full space-y-3 mb-6">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 text-sm">Nombre Real</span>
                    <span className="font-medium text-gray-800">{user.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 text-sm">Cédula</span>
                    <span className="font-medium text-gray-800 font-mono">{user.cedula}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500 text-sm">Vigencia</span>
                    <span className="font-medium text-green-600 font-mono">{user.validUntil}</span>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-3 text-center text-[10px] text-gray-400">
            Este carnet es personal e intransferible.
        </div>
      </div>
    </div>
  );
};