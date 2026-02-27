import React, { useState } from 'react';
import { useTheme, FONT_OPTIONS } from '../contexts/ThemeContext';
import { X, Save, Palette, Type, Layout, Image as ImageIcon } from 'lucide-react';

interface SystemSettingsModalProps {
    onClose: () => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({ onClose }) => {
    const { config, updateConfig } = useTheme();
    const [localConfig, setLocalConfig] = useState(config);

    const handleSave = () => {
        updateConfig(localConfig);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="bg-gray-900 p-4 flex justify-between items-center text-white rounded-t-2xl">
                    <div className="flex items-center space-x-2">
                        <Palette size={20} className="text-clown-yellow" />
                        <h2 className="font-bold font-display">Configuración del Sistema</h2>
                    </div>
                    <button onClick={onClose} className="hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* App Identity */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center font-display">
                            <Layout size={18} className="mr-2 text-clown-blue" />
                            Identidad
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nombre de la Organización</label>
                                <input 
                                    type="text" 
                                    value={localConfig.appName}
                                    onChange={e => setLocalConfig({...localConfig, appName: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm"
                                    placeholder="Ej: Dr. Payaso"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center">
                                    <ImageIcon size={14} className="mr-1" />
                                    URL del Logo (Imagen)
                                </label>
                                <input 
                                    type="text" 
                                    value={localConfig.logoUrl || ''}
                                    onChange={e => setLocalConfig({...localConfig, logoUrl: e.target.value})}
                                    className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm"
                                    placeholder="https://ejemplo.com/logo.png"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Deja este campo vacío para usar el icono por defecto.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Colors */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center font-display">
                            <Palette size={18} className="mr-2 text-clown-blue" />
                            Colores de Marca
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Color Primario (Rojo)</label>
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="color" 
                                        value={localConfig.primaryColor}
                                        onChange={e => setLocalConfig({...localConfig, primaryColor: e.target.value})}
                                        className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                    />
                                    <span className="text-sm font-mono text-gray-600">{localConfig.primaryColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Color Secundario (Azul)</label>
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="color" 
                                        value={localConfig.secondaryColor}
                                        onChange={e => setLocalConfig({...localConfig, secondaryColor: e.target.value})}
                                        className="h-10 w-20 rounded cursor-pointer border-0 p-0"
                                    />
                                    <span className="text-sm font-mono text-gray-600">{localConfig.secondaryColor}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Typography */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center font-display">
                            <Type size={18} className="mr-2 text-clown-blue" />
                            Tipografía
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {FONT_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setLocalConfig({...localConfig, fontConfigId: opt.id})}
                                    className={`p-4 rounded-xl border-2 text-left transition-all hover:bg-gray-50 ${
                                        localConfig.fontConfigId === opt.id 
                                        ? 'border-clown-blue ring-1 ring-clown-blue bg-blue-50/50' 
                                        : 'border-gray-100'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-gray-800">{opt.name}</span>
                                        {localConfig.fontConfigId === opt.id && <span className="text-clown-blue text-xs font-bold">Seleccionado</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{opt.description}</p>
                                    
                                    {/* Font Preview */}
                                    <div className="bg-white p-3 rounded border border-gray-100 text-sm space-y-1">
                                        <p style={{ fontFamily: opt.heading }} className="text-gray-900 font-bold text-lg">Dr. Payaso</p>
                                        <p style={{ fontFamily: opt.body }} className="text-gray-600">El voluntariado transforma vidas.</p>
                                        <p style={{ fontFamily: opt.accent }} className="text-gray-400 text-xs">1234567890</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-bold text-white bg-clown-blue hover:bg-blue-600 rounded-lg flex items-center shadow-lg"
                    >
                        Guardar Configuración
                        <Save size={16} className="ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};