
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Search, MoreHorizontal, ShieldAlert, Power, PowerOff, UserPlus, Filter, User as UserIcon } from 'lucide-react';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';
import { UserProfileModal } from './UserProfileModal';
import { AddUserModal } from './AddUserModal';

interface UsersTableProps {
    isSupabase: boolean;
}

export const UsersTable: React.FC<UsersTableProps> = ({ isSupabase }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showAddUser, setShowAddUser] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const service = isSupabase ? SupabaseService : MockService;

    useEffect(() => {
        loadUsers();
    }, [isSupabase]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await service.getAllUsers();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (userId: string, currentStatus: 'active' | 'inactive') => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        if (!window.confirm(`¿Estás seguro que deseas cambiar el estado a: ${newStatus === 'active' ? 'ACTIVO' : 'INACTIVO'}?`)) {
            return;
        }

        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        setActiveMenuId(null);

        try {
            await service.updateUserStatus(userId, newStatus);
        } catch (error) {
            alert('Error actualizando estado');
            loadUsers(); // Revert
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setActiveMenuId(null);
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (user.artisticName && user.artisticName.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando voluntarios...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible min-h-[300px]">
            {/* Header / Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 rounded-t-xl gap-4">
                <div className="flex items-center space-x-2">
                     <h3 className="font-semibold text-gray-700 font-display">Directorio</h3>
                     <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-mono">{filteredUsers.length}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
                    {/* Role Filter */}
                    <div className="relative w-full sm:w-auto">
                         <select 
                            className="w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-clown-blue appearance-none"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                         >
                            <option value="all">Todos los Roles</option>
                            {Object.values(UserRole).map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                         </select>
                         <Filter size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative w-full sm:w-auto">
                         <select 
                            className="w-full sm:w-32 pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-clown-blue appearance-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                         >
                            <option value="all">Todos</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                         </select>
                         <div className={`w-2 h-2 rounded-full absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${statusFilter === 'active' ? 'bg-green-500' : statusFilter === 'inactive' ? 'bg-gray-300' : 'bg-transparent'}`}></div>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-auto flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-clown-blue w-full bg-white"
                        />
                    </div>

                    {/* Add Button */}
                    <button 
                        onClick={() => setShowAddUser(true)}
                        className="w-full sm:w-auto bg-clown-blue text-white p-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center"
                        title="Agregar Usuario Manualmente"
                    >
                        <UserPlus size={20} />
                        <span className="ml-2 sm:hidden text-sm font-bold">Nuevo Usuario</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Voluntario</th>
                            <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Rol</th>
                            <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Teléfono</th>
                            <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Estado</th>
                            <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 relative">
                        {filteredUsers.length > 0 ? filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                        {u.photoUrl ? (
                                            <img src={u.photoUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <UserIcon size={16} />
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center space-x-1">
                                                <p className="font-medium text-gray-800 text-sm font-display">{u.artisticName || u.fullName}</p>
                                                {u.isSuperAdmin && <span className="text-[10px] bg-gray-900 text-white px-1 rounded font-mono">Admin</span>}
                                            </div>
                                            {u.artisticName && <p className="text-xs text-gray-500">{u.fullName}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                        ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 
                                          u.role === UserRole.DR_PAYASO ? 'bg-red-100 text-red-700' :
                                          u.role === UserRole.RECRUIT ? 'bg-blue-100 text-blue-700' :
                                          'bg-gray-100 text-gray-700'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-600 font-mono">{u.phone}</td>
                                <td className="p-4">
                                    <span className={`flex items-center text-xs font-medium ${u.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${u.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {u.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="p-4 relative">
                                    <button 
                                        onClick={() => setActiveMenuId(activeMenuId === u.id ? null : u.id)}
                                        className="p-1 hover:bg-gray-200 rounded text-gray-500 relative z-10"
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>
                                    
                                    {/* Action Menu */}
                                    {activeMenuId === u.id && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setActiveMenuId(null)} 
                                            />
                                            <div className="absolute right-8 top-2 bg-white shadow-xl border border-gray-100 rounded-lg w-40 z-20 overflow-hidden animate-in zoom-in-95 duration-100 origin-top-right">
                                                <button 
                                                    onClick={() => handleEditUser(u)}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                                >
                                                    <ShieldAlert size={14} className="mr-2" />
                                                    Gestionar
                                                </button>
                                                <button 
                                                    onClick={() => toggleStatus(u.id, u.status)}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center
                                                        ${u.status === 'active' ? 'text-red-600' : 'text-green-600'}`}
                                                >
                                                    {u.status === 'active' ? (
                                                        <>
                                                            <PowerOff size={14} className="mr-2" />
                                                            Desactivar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power size={14} className="mr-2" />
                                                            Activar
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No hay voluntarios encontrados con esos filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <UserProfileModal 
                    user={editingUser}
                    mode="admin"
                    useSupabase={isSupabase}
                    onClose={() => setEditingUser(null)}
                    onUpdate={() => {
                        loadUsers();
                    }}
                />
            )}

            {showAddUser && (
                <AddUserModal 
                    useSupabase={isSupabase}
                    onClose={() => setShowAddUser(false)}
                    onUserAdded={() => loadUsers()}
                />
            )}
        </div>
    )
}
