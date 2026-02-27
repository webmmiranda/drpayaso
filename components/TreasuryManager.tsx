
import React, { useState, useEffect } from 'react';
import { User, Payment, UserRole } from '../types';
import { MockService } from '../services/mockService';
import { SupabaseService } from '../services/supabaseService';
import { PaymentModal } from './PaymentModal';
import { 
    Search, 
    Filter, 
    CheckCircle, 
    AlertCircle, 
    TrendingUp, 
    DollarSign,
    Calendar,
    ArrowUpRight,
    Wallet,
    Clock,
    Check,
    X as XIcon,
    Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface TreasuryManagerProps {
    useSupabase: boolean;
}

interface UserFinancialStatus extends User {
    lastPaymentMonth: string;
    isUpToDate: boolean;
    totalPaid: number;
}

export const TreasuryManager: React.FC<TreasuryManagerProps> = ({ useSupabase }) => {
    const [users, setUsers] = useState<UserFinancialStatus[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'uptodate' | 'overdue' | 'exempt'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserForPayment, setSelectedUserForPayment] = useState<string | null>(null);
    const { config } = useTheme();

    // Configuration for Fee (Simulated for MVP)
    const [monthlyFee] = useState(5000); 

    const service = useSupabase ? SupabaseService : MockService;
    const currentMonthString = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    const capitalizedMonth = currentMonthString.charAt(0).toUpperCase() + currentMonthString.slice(1);

    // Dummy user for Admin context in PaymentModal
    const adminUser = { id: 'admin', role: UserRole.ADMIN } as User; 

    useEffect(() => {
        loadData();
    }, [useSupabase]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allUsers, allPayments] = await Promise.all([
                service.getAllUsers(),
                service.getPayments() // Get ALL payments
            ]);
            
            setPayments(allPayments);

            // Process Users Status
            const processedUsers = allUsers.map(user => {
                // Filter VALID payments for this user (exclude pending/rejected)
                const userValidPayments = allPayments.filter(p => p.userId === user.id && p.status === 'paid');
                
                // Find if paid for current month
                const hasPaidCurrentMonth = userValidPayments.some(p => 
                    p.month.toLowerCase() === currentMonthString.toLowerCase()
                );
                
                // Sort to get last payment
                const sorted = [...userValidPayments].sort((a,b) => 
                     new Date(b.datePaid).getTime() - new Date(a.datePaid).getTime()
                );
                
                const lastPayment = sorted.length > 0 ? sorted[0].month : 'Sin pagos';
                const total = userValidPayments.reduce((sum, p) => sum + p.amount, 0);

                return {
                    ...user,
                    lastPaymentMonth: lastPayment,
                    isUpToDate: user.exemptFromFees ? true : hasPaidCurrentMonth, // Exempt are always up to date
                    totalPaid: total
                };
            });
            
            // Show all active users, even admins if they are in the list
            setUsers(processedUsers.filter(u => u.status === 'active'));
            
        } catch (error) {
            console.error("Error loading treasury data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (paymentId: string, approved: boolean) => {
        if (!confirm(approved ? "¿Confirmar que recibiste el dinero?" : "¿Rechazar este pago?")) return;
        
        try {
            // @ts-ignore
            await service.updatePaymentStatus(paymentId, approved ? 'paid' : 'rejected');
            loadData();
        } catch (error) {
            alert("Error actualizando estado");
        }
    };

    // Metrics - Filter EXEMPT users out of the calculations
    const eligibleUsers = users.filter(u => !u.exemptFromFees);
    
    const totalCollectedThisMonth = payments
        .filter(p => p.month.toLowerCase() === currentMonthString.toLowerCase() && p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingPayments = payments.filter(p => p.status === 'pending_approval');

    const upToDateCount = eligibleUsers.filter(u => u.isUpToDate).length;
    const overdueCount = eligibleUsers.filter(u => !u.isUpToDate).length;
    const complianceRate = eligibleUsers.length > 0 ? Math.round((upToDateCount / eligibleUsers.length) * 100) : 0;

    // Filtered List
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesStatus = true;
        if (filterStatus === 'uptodate') matchesStatus = u.isUpToDate && !u.exemptFromFees;
        if (filterStatus === 'overdue') matchesStatus = !u.isUpToDate && !u.exemptFromFees;
        if (filterStatus === 'exempt') matchesStatus = !!u.exemptFromFees;
        
        return matchesSearch && matchesStatus;
    });

    const handlePaymentSuccess = () => {
        setSelectedUserForPayment(null);
        loadData(); // Refresh data
    };
    
    const getUserName = (id: string) => users.find(u => u.id === id)?.fullName || 'Usuario Desconocido';

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando datos financieros...</div>;

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            
            {/* Header */}
             <div className="flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-bold text-gray-800 font-display">Tesorería</h2>
                    <p className="text-sm text-gray-500">Gestión de cuotas y estado de cuenta - <span className="font-bold text-gray-700 capitalize">{currentMonthString}</span></p>
                 </div>
                 <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Cuota Mensual</span>
                    <span className="text-lg font-bold text-gray-800">₡{monthlyFee.toLocaleString()}</span>
                    <button className="text-xs text-clown-blue hover:underline ml-2">Editar</button>
                 </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-green-500">
                        <DollarSign size={64} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase flex items-center mb-1">
                            <ArrowUpRight size={14} className="mr-1 text-green-500"/> Recaudado (Mes)
                        </p>
                        <h3 className="text-3xl font-bold text-gray-800">₡{totalCollectedThisMonth.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase flex items-center mb-1">
                            <TrendingUp size={14} className="mr-1 text-clown-blue"/> Tasa de Cumplimiento
                        </p>
                        <div className="flex items-end space-x-2">
                            <h3 className="text-3xl font-bold text-gray-800">{complianceRate}%</h3>
                            <span className="text-sm text-gray-500 mb-1">de {eligibleUsers.length} voluntarios</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                        <div className="bg-clown-blue h-2 rounded-full transition-all duration-1000" style={{ width: `${complianceRate}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Al Día</p>
                            <h3 className="text-2xl font-bold text-green-600">{upToDateCount}</h3>
                        </div>
                        <div className="w-px bg-gray-100"></div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Morosos</p>
                            <h3 className="text-2xl font-bold text-red-500">{overdueCount}</h3>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        {users.filter(u => u.exemptFromFees).length} Exentos de cuota
                    </p>
                </div>
            </div>

            {/* PENDING VALIDATIONS SECTION */}
            {pendingPayments.length > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 animate-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center">
                        <Clock size={16} className="mr-2" />
                        Solicitudes Pendientes de Validación ({pendingPayments.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pendingPayments.map(p => (
                            <div key={p.id} className="bg-white p-3 rounded-lg shadow-sm flex flex-col justify-between border border-orange-100">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-gray-800 text-sm">{getUserName(p.userId)}</p>
                                        <span className="text-xs font-mono bg-gray-100 px-1 rounded">{p.datePaid}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{p.month} - ₡{p.amount}</p>
                                    <p className="text-[10px] text-gray-400 truncate mt-1">Ref: {p.referenceId || 'N/A'}</p>
                                </div>
                                <div className="flex space-x-2 mt-3 pt-2 border-t border-gray-50">
                                    <button 
                                        onClick={() => handleApproval(p.id, false)}
                                        className="flex-1 py-1 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 flex justify-center items-center"
                                    >
                                        <XIcon size={12} className="mr-1" /> Rechazar
                                    </button>
                                    <button 
                                        onClick={() => handleApproval(p.id, true)}
                                        className="flex-1 py-1 bg-green-50 text-green-600 text-xs font-bold rounded hover:bg-green-100 flex justify-center items-center"
                                    >
                                        <Check size={12} className="mr-1" /> Aprobar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar voluntario..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-clown-blue w-full sm:w-64 bg-white"
                            />
                        </div>
                        <div className="relative">
                             <select 
                                className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-clown-blue appearance-none cursor-pointer"
                                value={filterStatus}
                                onChange={(e: any) => setFilterStatus(e.target.value)}
                             >
                                <option value="all">Todos</option>
                                <option value="uptodate">Al Día</option>
                                <option value="overdue">Morosos</option>
                                <option value="exempt">Exentos</option>
                             </select>
                             <Filter size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedUserForPayment('generic')} 
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-bold shadow-sm"
                    >
                        <DollarSign size={16} className="mr-1" /> Registrar Pago
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Voluntario</th>
                                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Último Pago</th>
                                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Total Histórico</th>
                                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Estado Actual</th>
                                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <img src={u.photoUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{u.fullName}</p>
                                                <p className="text-xs text-gray-500">{u.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 flex items-center">
                                        <Calendar size={14} className="mr-2 text-gray-400" />
                                        {u.exemptFromFees ? 'N/A' : u.lastPaymentMonth}
                                    </td>
                                    <td className="p-4 text-sm font-mono text-gray-600">
                                        ₡{u.totalPaid.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        {u.exemptFromFees ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                <Shield size={12} className="mr-1" />
                                                Exento
                                            </span>
                                        ) : u.isUpToDate ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle size={12} className="mr-1" />
                                                Al Día
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <AlertCircle size={12} className="mr-1" />
                                                Moroso
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {!u.exemptFromFees && !u.isUpToDate && (
                                            <button 
                                                onClick={() => setSelectedUserForPayment(u.id)}
                                                className="text-xs font-bold text-clown-blue border border-clown-blue px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                            >
                                                Pagar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No se encontraron voluntarios con los filtros seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            {selectedUserForPayment && (
                <PaymentModal 
                    useSupabase={useSupabase}
                    onClose={() => setSelectedUserForPayment(null)}
                    onPaymentSuccess={handlePaymentSuccess}
                    initialUserId={selectedUserForPayment === 'generic' ? undefined : selectedUserForPayment}
                    currentUser={adminUser}
                />
            )}
        </div>
    );
};
