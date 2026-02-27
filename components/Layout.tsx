
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { UserProfileModal } from './UserProfileModal';
import { 
  Menu, 
  LayoutDashboard, 
  CalendarDays, 
  CreditCard, 
  Users, 
  LogOut, 
  IdCard,
  Smile,
  BarChart,
  UserCog,
  Map,
  Building2,
  Landmark,
  GraduationCap,
  ChevronDown,
  Repeat,
  User as UserIcon,
  History
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onShowID: () => void;
  onLogout: () => void;
  onRoleSwitch: (role: UserRole) => void; // New Prop
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  activeTab, 
  onTabChange, 
  onShowID,
  onLogout,
  onRoleSwitch
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const { config } = useTheme();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Helper to determine visibility
  const canAccess = (requiredRoles: UserRole[]) => {
      // Super Admin always accesses everything
      if (user.isSuperAdmin) return true;
      // Admin accesses everything
      if (user.role === UserRole.ADMIN) return true;
      // Check specific role match
      return requiredRoles.includes(user.role);
  };

  const NavItem = ({ id, label, icon: Icon, allowedRoles }: { id: string, label: string, icon: any, allowedRoles?: UserRole[] }) => {
    // If allowedRoles is defined, check permission. If undefined, it's public.
    if (allowedRoles && !canAccess(allowedRoles)) return null;
    
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => {
            onTabChange(id);
            setIsSidebarOpen(false);
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 
          ${isActive 
            ? 'bg-clown-red text-white shadow-md' 
            : 'text-gray-600 hover:bg-red-50 hover:text-clown-red'
          }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  const userPhoto = user.role === UserRole.DR_PAYASO ? (user.characterPhotoUrl || user.photoUrl) : user.photoUrl;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
            {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
                <div className="w-10 h-10 bg-clown-red rounded-full flex items-center justify-center text-white shrink-0">
                    <Smile size={24} />
                </div>
            )}
            <div>
                <h1 className="font-bold text-gray-800 leading-tight font-display">{config.appName}</h1>
                <p className="text-xs text-gray-400">Gestión de Voluntarios</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem id="dashboard" label="Inicio" icon={LayoutDashboard} />
            <NavItem id="history" label="Mis Visitas" icon={History} />
            <NavItem id="activities" label="Calendario" icon={CalendarDays} />
            <NavItem id="finances" label="Mis Finanzas" icon={CreditCard} />
            
            {/* Admin/Management Section */}
            {(canAccess([UserRole.ADMIN, UserRole.BOARD, UserRole.TREASURER])) && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Administración</p>
                    
                    <NavItem 
                        id="treasury" 
                        label="Tesorería" 
                        icon={Landmark} 
                        allowedRoles={[UserRole.ADMIN, UserRole.BOARD, UserRole.TREASURER]} 
                    />
                    
                    <NavItem 
                        id="volunteers" 
                        label="Voluntarios" 
                        icon={Users} 
                        allowedRoles={[UserRole.ADMIN, UserRole.BOARD]} 
                    />
                    
                    <NavItem 
                        id="requests" 
                        label="Solicitudes" 
                        icon={GraduationCap} 
                        allowedRoles={[UserRole.ADMIN, UserRole.BOARD]} 
                    />
                    
                    <NavItem 
                        id="locations" 
                        label="Centros" 
                        icon={Building2} 
                        allowedRoles={[UserRole.ADMIN, UserRole.BOARD]} 
                    />
                    
                    <NavItem 
                        id="stats" 
                        label="Estadísticas" 
                        icon={BarChart} 
                        allowedRoles={[UserRole.ADMIN, UserRole.BOARD]} 
                    />
                </div>
            )}
          </nav>

          {/* User Profile Snippet & Role Switcher */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 relative">
            
            {/* Role Switcher Button */}
            {user.availableRoles.length > 1 && (
                <div className="mb-3">
                    <button 
                        onClick={() => setShowRoleSelector(!showRoleSelector)}
                        className="w-full flex items-center justify-between text-xs font-bold bg-white border border-gray-200 p-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                        <div className="flex items-center">
                            <Repeat size={14} className="mr-2 text-clown-blue" />
                            <span>Cambiar Rol: {user.role}</span>
                        </div>
                        <ChevronDown size={14} className={`transform transition-transform ${showRoleSelector ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Role Dropdown */}
                    {showRoleSelector && (
                        <div className="absolute left-4 right-4 bottom-32 bg-white shadow-xl rounded-lg border border-gray-200 z-50 overflow-hidden animate-in zoom-in-95 duration-100">
                            {user.availableRoles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => {
                                        onRoleSwitch(role);
                                        setShowRoleSelector(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 ${user.role === role ? 'text-clown-blue bg-blue-50' : 'text-gray-600'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center space-x-3 mb-3">
                {userPhoto ? (
                    <img src={userPhoto} alt="User" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <UserIcon size={18} />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate font-display">
                        {user.role === UserRole.DR_PAYASO ? user.artisticName : user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.role}</p>
                </div>
                <button 
                  onClick={() => setShowProfileEdit(true)}
                  className="p-1.5 text-gray-400 hover:text-clown-blue hover:bg-blue-50 rounded-full transition-colors"
                  title="Editar Perfil"
                >
                  <UserCog size={16} />
                </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button 
                    onClick={onShowID}
                    className="flex items-center justify-center space-x-1 py-1.5 px-3 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    <IdCard size={14} />
                    <span>Carnet</span>
                </button>
                <button 
                    onClick={onLogout}
                    className="flex items-center justify-center space-x-1 py-1.5 px-3 bg-white border border-gray-200 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={14} />
                    <span>Salir</span>
                </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900">
              <Menu size={24} />
            </button>
            <span className="font-semibold text-gray-800 font-display">
                {activeTab === 'treasury' ? 'Tesorería' :
                 activeTab === 'volunteers' ? 'Voluntarios' : 
                 activeTab === 'locations' ? 'Centros' :
                 activeTab === 'finances' ? 'Mis Finanzas' :
                 activeTab === 'requests' ? 'Solicitudes' :
                 activeTab === 'history' ? 'Mis Visitas' :
                 activeTab === 'activities' ? 'Calendario' :
                 activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </span>
          </div>
          <button onClick={onShowID} className="text-clown-red hover:text-red-700">
            <IdCard size={24} />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto font-sans">
            <div className="max-w-6xl mx-auto">
                {children}
            </div>
        </main>
      </div>

      {showProfileEdit && (
        <UserProfileModal 
          user={user}
          mode="self"
          useSupabase={false} // Assuming Layout usage for simplicity
          onClose={() => setShowProfileEdit(false)}
          onUpdate={() => {
            setShowProfileEdit(false);
          }}
        />
      )}
    </div>
  );
};
