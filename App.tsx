
import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { LandingCarnet } from './components/LandingCarnet';
import { EventChat } from './components/EventChat';
import { CreateEventModal } from './components/CreateEventModal';
import { AttendanceModal } from './components/AttendanceModal';
import { PaymentModal } from './components/PaymentModal';
import { MassMessageModal } from './components/MassMessageModal';
import { UsersTable } from './components/UsersTable';
import { LocationsManager } from './components/LocationsManager';
import { TreasuryManager } from './components/TreasuryManager';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { ProgressTracker } from './components/ProgressTracker';
import { GraduationManager } from './components/GraduationManager'; 
import { MOCK_USERS } from './constants';
import { MockService } from './services/mockService';
import { SupabaseService } from './services/supabaseService';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';
import { User, PayasoEvent, Payment, EventType, UserRole, UserStats, ImpactStats } from './types';
import { 
    CalendarCheck, 
    Clock, 
    TrendingUp,
    Database,
    Zap,
    MessageSquare,
    Plus,
    CalendarDays,
    Settings,
    ClipboardCheck,
    Mail,
    AlertTriangle,
    MapPin,
    UploadCloud,
    AlertCircle,
    Calendar as CalendarIcon,
    User as UserIcon,
    CheckCircle,
    XCircle,
    PieChart as PieChartIcon,
    Activity,
    Heart,
    Star,
    ArrowUpRight,
    Smile,
    ArrowDownCircle
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Legend
} from 'recharts';

// --- Login View ---
const LoginView = ({ onLogin }: { onLogin: (user: User, useSupabase: boolean) => void }) => {
    const [loading, setLoading] = useState(false);
    const [useSupabase, setUseSupabase] = useState(true); // Default to true now that it's configured
    const [sbConfigured, setSbConfigured] = useState(false);
    
    const [identifier, setIdentifier] = useState(''); 
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    const { config } = useTheme();

    useEffect(() => {
        setSbConfigured(isSupabaseConfigured());
    }, []);

    const handleQuickLogin = async (userId: string) => {
        setLoading(true);
        setErrorMessage('');
        try {
            const user = await MockService.authenticate(userId);
            onLogin(user, false);
        } catch (error) {
            alert("Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    const handleSupabaseAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!sbConfigured) {
            setErrorMessage("Supabase no está configurado correctamente en las variables de entorno.");
            return;
        }
        
        setLoading(true);
        try {
            const user = await SupabaseService.authenticate(identifier, password);
            onLogin(user, true);
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.message || "Error conectando con Supabase.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center animate-in fade-in zoom-in-95 duration-300">
                {config.logoUrl ? (
                    <img src={config.logoUrl} alt="Logo" className="w-24 h-24 mx-auto mb-6 object-contain" />
                ) : (
                    <div className="w-20 h-20 bg-clown-red rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                        <span className="text-4xl">🤡</span>
                    </div>
                )}
                
                <h1 className="text-3xl font-bold text-gray-800 mb-2 font-display">{config.appName}</h1>
                <p className="text-sm text-gray-500 mb-6">Plataforma de Gestión de Voluntarios</p>
                
                <div className="flex justify-center items-center space-x-2 mb-8">
                    <button 
                        onClick={() => { setUseSupabase(false); setErrorMessage(''); }}
                        className={`px-3 py-1 text-xs rounded-full flex items-center space-x-1 border transition-all ${!useSupabase ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Zap size={12} /> <span>Demo Mode</span>
                    </button>
                    <button 
                         onClick={() => { setUseSupabase(true); setErrorMessage(''); }}
                         className={`px-3 py-1 text-xs rounded-full flex items-center space-x-1 border transition-all ${useSupabase ? 'bg-green-600 text-white border-green-600' : 'text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                    >
                        <Database size={12} /> <span>Supabase DB</span>
                    </button>
                </div>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-left flex items-start space-x-3 animate-in slide-in-from-top-2">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <h4 className="text-sm font-bold text-red-800">Error de Conexión</h4>
                            <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {!useSupabase && (
                    <>
                        <p className="text-gray-500 mb-8">
                            Selecciona un perfil para simular el acceso (Datos en memoria):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {MOCK_USERS.map((u) => (
                                <button 
                                    key={u.id}
                                    onClick={() => handleQuickLogin(u.id)}
                                    className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-clown-red hover:bg-red-50 transition-all text-left group bg-white"
                                >
                                    {u.photoUrl ? (
                                        <img 
                                            src={u.photoUrl} 
                                            alt={u.fullName} 
                                            className="w-12 h-12 rounded-full mr-4 bg-gray-200 object-cover" 
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full mr-4 bg-gray-100 flex items-center justify-center text-gray-400">
                                            <UserIcon size={20} />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-gray-800 group-hover:text-clown-red transition-colors font-display">
                                            {u.artisticName || u.fullName}
                                        </p>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">{u.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {useSupabase && sbConfigured && (
                    <form onSubmit={handleSupabaseAuth} className="max-w-sm mx-auto space-y-4 text-left animate-in slide-in-from-right duration-300">
                        <div className="bg-green-50 text-green-800 text-xs p-3 rounded-lg border border-green-200 mb-4 flex justify-between items-start">
                            <div>
                                <p className="font-bold flex items-center mb-1"><Database size={12} className="mr-1"/> Conectado a Base de Datos</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Correo o Cédula</label>
                            <input required type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contraseña</label>
                            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg disabled:opacity-50">Iniciar Sesión</button>
                    </form>
                )}
            </div>
        </div>
    );
};

// --- App Content ---

const AppContent = () => {
    const { config } = useTheme();
    const [user, setUser] = useState<User | null>(null);
    const [userStats, setUserStats] = useState<UserStats>({ trainingHours: 0, visitsCount: 0 });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLandingCarnet, setShowLandingCarnet] = useState(false); // Controls Landing View
    const [activeTab, setActiveTab] = useState('dashboard');
    const [useSupabase, setUseSupabase] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    // Modals
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [attendanceEvent, setAttendanceEvent] = useState<PayasoEvent | null>(null);
    const [chatEvent, setChatEvent] = useState<PayasoEvent | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [showMassMessage, setShowMassMessage] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Data
    const [events, setEvents] = useState<PayasoEvent[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    
    // History View State
    const [visibleHistoryCount, setVisibleHistoryCount] = useState(5); // Default number of past items to show

    // Filters
    const [activityFilter, setActivityFilter] = useState<'all' | 'training' | 'visit'>('all');

    const service = useSupabase ? SupabaseService : MockService;

    // 🚀 INITIAL SESSION CHECK
    useEffect(() => {
        const checkSession = async () => {
            if (isSupabaseConfigured()) {
                const sbUser = await SupabaseService.checkSession();
                if (sbUser) {
                    setUseSupabase(true);
                    setUser(sbUser);
                    setIsAuthenticated(true);
                    setShowLandingCarnet(true);
                    setCheckingSession(false);
                    return;
                }
            }
            // @ts-ignore
            const mockUser = await MockService.checkSession();
            if (mockUser) {
                setUseSupabase(false);
                setUser(mockUser);
                setIsAuthenticated(true);
                setShowLandingCarnet(true);
            }
            setCheckingSession(false);
        };
        checkSession();
    }, []);

    const handleLogin = (u: User, useSb: boolean) => {
        setUser(u);
        setUseSupabase(useSb);
        setIsAuthenticated(true);
        setShowLandingCarnet(true);
    };

    const handleEnterSystem = () => {
        setShowLandingCarnet(false);
    };

    const handleLogout = async () => {
        await service.logout();
        setIsAuthenticated(false);
        setUser(null);
        setShowLandingCarnet(false);
    };

    const handleRoleSwitch = (newRole: UserRole) => {
        if (!user) return;
        setUser({ ...user, role: newRole }); 
        loadData(newRole); 
    };

    // Load data only if authenticated and NOT on landing screen
    useEffect(() => {
        if (isAuthenticated && user && !showLandingCarnet) {
            loadData(user.role);
            if (useSupabase) {
                const channel = supabase.channel('realtime_updates')
                .on('postgres_changes', { event: '*', schema: 'public' }, () => loadData(user.role))
                .subscribe();
                return () => { supabase.removeChannel(channel); };
            }
        }
    }, [isAuthenticated, user?.id, useSupabase, showLandingCarnet]);

    const loadData = async (activeRoleOverride?: UserRole) => {
        if (!user) return;
        setLoading(true);
        try {
            const currentRole = activeRoleOverride || user.role;
            const [evs, pays, stats, usersList] = await Promise.all([
                service.getEvents(),
                service.getPayments(user.id),
                // @ts-ignore
                service.getUserStats(user.id),
                // Only load all users if necessary to save bandwidth
                (currentRole === UserRole.ADMIN || currentRole === UserRole.BOARD || currentRole === UserRole.TREASURER) 
                    ? service.getAllUsers() 
                    : Promise.resolve([]) 
            ]);
            
            setEvents(evs);
            setPayments(pays);
            setUserStats(stats);
            setAllUsers(usersList);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterToggle = async (eventId: string, type: EventType, currentStatus: boolean) => {
        if (!user) return;
        try {
            if (useSupabase) {
                // @ts-ignore
                await service.registerWithRole(eventId, type, user.id, user.role);
            } else {
                await service.toggleRegistration(eventId, type, currentStatus, user.id);
            }
            loadData(user.role); 
        } catch (e) {
            alert("Error actualizando inscripción");
        }
    };
    
    // Add to Google Calendar Helper
    const addToGoogleCalendar = (event: PayasoEvent) => {
        const formatDate = (date: Date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, "");
        };
        const startDate = new Date(event.date);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours
        const startStr = formatDate(startDate);
        const endStr = formatDate(endDate);
        const details = encodeURIComponent(`${event.description}\n\nRol: ${user?.role}`);
        const location = encodeURIComponent(event.location);
        const title = encodeURIComponent(event.title);
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
        window.open(url, '_blank');
    };

    const getCapacityForRole = (event: PayasoEvent, role: UserRole) => {
        if (event.type === EventType.TRAINING) return { taken: event.totalAttendees, max: event.totalCapacity };
        let max = 0;
        let taken = 0;
        if (role === UserRole.DR_PAYASO) { max = event.capacity.dr_payaso; taken = event.attendeesCount.dr_payaso; }
        else if (role === UserRole.RECRUIT) { max = event.capacity.recruit; taken = event.attendeesCount.recruit; }
        else if (role === UserRole.PHOTOGRAPHER) { max = event.capacity.photographer; taken = event.attendeesCount.photographer; }
        else { max = event.capacity.volunteer; taken = event.attendeesCount.volunteer; }
        return { taken, max };
    };
    
    // Filter logic for "Calendario" tab
    const filteredEvents = events.filter(e => {
        // First filter by visibility for role
        let isVisible = false;
        if (user.role === UserRole.ADMIN || user.role === UserRole.BOARD) isVisible = true;
        else if (e.type === EventType.TRAINING) isVisible = true;
        else {
            if (user.role === UserRole.DR_PAYASO && e.capacity.dr_payaso > 0) isVisible = true;
            if (user.role === UserRole.RECRUIT && e.capacity.recruit > 0) isVisible = true;
            if (user.role === UserRole.PHOTOGRAPHER && e.capacity.photographer > 0) isVisible = true;
            if (user.role === UserRole.VOLUNTEER && e.capacity.volunteer > 0) isVisible = true;
        }
        
        if (!isVisible) return false;

        // Then filter by tab selection
        if (activityFilter === 'all') return true;
        if (activityFilter === 'training') return e.type === EventType.TRAINING;
        if (activityFilter === 'visit') return e.type === EventType.VISIT;
        return true;
    });

    const getMyHistory = () => {
        const now = new Date();
        const myEvents = events.filter(e => e.registered);
        const upcoming = myEvents.filter(e => new Date(e.date) >= now).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const past = myEvents.filter(e => new Date(e.date) < now).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { upcoming, past };
    };

    const myHistory = getMyHistory();
    const pastEventsToShow = myHistory.past.slice(0, visibleHistoryCount);
    const hasMorePastEvents = myHistory.past.length > visibleHistoryCount;

    // --- CALCULATE ADMIN STATS (Dynamic) ---
    // Expanded with more insights
    const adminStats = useMemo(() => {
        if (allUsers.length === 0) return null;

        const activeVolunteers = allUsers.filter(u => u.status === 'active').length;
        
        const roleDist = [
            { name: 'Dr. Payaso', value: allUsers.filter(u => u.role === UserRole.DR_PAYASO).length },
            { name: 'Reclutas', value: allUsers.filter(u => u.role === UserRole.RECRUIT).length },
            { name: 'Fotógrafos', value: allUsers.filter(u => u.role === UserRole.PHOTOGRAPHER).length },
            { name: 'Staff', value: allUsers.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.BOARD || u.role === UserRole.TREASURER).length }
        ];

        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthlyData = months.map((m, idx) => ({ name: m, visits: 0, trainings: 0, financial: 0 }));
        
        const locationCounts: Record<string, number> = {};
        const weekDayCounts = [
            { name: 'Dom', count: 0 }, { name: 'Lun', count: 0 }, { name: 'Mar', count: 0 }, 
            { name: 'Mié', count: 0 }, { name: 'Jue', count: 0 }, { name: 'Vie', count: 0 }, { name: 'Sáb', count: 0 }
        ];

        events.forEach(e => {
            const date = new Date(e.date);
            const monthIdx = date.getMonth();
            const dayIdx = date.getDay();
            
            if (e.type === EventType.VISIT) {
                monthlyData[monthIdx].visits++;
                weekDayCounts[dayIdx].count++;
            } else {
                monthlyData[monthIdx].trainings++;
            }

            if (e.location) locationCounts[e.location] = (locationCounts[e.location] || 0) + 1;
        });

        // Simulate Financial Data (Income) based on payments
        payments.forEach(p => {
            // Very simple mapping for MVP based on string 'Month Year'
            const mName = p.month.split(' ')[0].substring(0, 3);
            const foundM = monthlyData.find(d => d.name.toLowerCase() === mName.toLowerCase());
            if (foundM && p.status === 'paid') {
                foundM.financial += p.amount;
            }
        });

        const topLocations = Object.entries(locationCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a,b) => b.count - a.count)
            .slice(0, 5);

        return {
            totalVolunteers: allUsers.length,
            activeVolunteers,
            roleDistribution: roleDist,
            monthlyVisits: monthlyData,
            topLocations,
            weekDayActivity: weekDayCounts
        };
    }, [allUsers, events, payments]);

    const COLORS = ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'];

    // Identify "Next Mission" for operational roles
    const nextMission = useMemo(() => {
        const myUpcoming = getMyHistory().upcoming;
        return myUpcoming.length > 0 ? myUpcoming[0] : null;
    }, [events]);

    if (checkingSession) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-clown-red animate-pulse">
            <span className="text-4xl">🤡</span>
        </div>;
    }

    if (!isAuthenticated) return <LoginView onLogin={handleLogin} />;
    if (!user) return null;
    if (showLandingCarnet) return <LandingCarnet user={user} onEnter={handleEnterSystem} onLogout={handleLogout} />;

    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.BOARD || user.isSuperAdmin;
    const isTreasurer = user.role === UserRole.TREASURER;

    return (
        <Layout 
            user={user} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onShowID={() => setShowLandingCarnet(true)} 
            onLogout={handleLogout}
            onRoleSwitch={handleRoleSwitch}
        >
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 font-display">Hola, {user.role === UserRole.DR_PAYASO ? (user.artisticName || user.fullName) : user.fullName} 👋</h2>
                            <p className="text-sm text-gray-500">Panel de control: <span className="font-bold text-clown-blue">{user.role}</span></p>
                        </div>
                        {isAdmin && (
                            <div className="flex space-x-2">
                                <button onClick={() => setShowMassMessage(true)} className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200" title="Mensaje Masivo"><Mail size={20} /></button>
                                <button onClick={() => setShowSettings(true)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" title="Configuración"><Settings size={20} /></button>
                            </div>
                        )}
                    </div>

                    {/* CONTEXTUAL WIDGETS */}
                    
                    {/* 1. Treasurer Context */}
                    {isTreasurer && (
                        <div 
                            className="bg-green-50 p-4 rounded-xl border border-green-200 cursor-pointer hover:bg-green-100 transition-colors shadow-sm"
                            onClick={() => setActiveTab('treasury')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-200 text-green-700 rounded-full"><ClipboardCheck size={24} /></div>
                                    <div>
                                        <h3 className="font-bold text-green-900">Acciones de Tesorería</h3>
                                        <p className="text-xs text-green-700">Gestión de pagos y validaciones.</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-white text-green-700 text-xs font-bold rounded-full shadow-sm">Ver Gestión</span>
                            </div>
                        </div>
                    )}

                    {/* 2. Admin Context */}
                    {(isAdmin && !isTreasurer) && (
                        <div 
                            className="bg-purple-50 p-4 rounded-xl border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors shadow-sm"
                            onClick={() => setActiveTab('requests')}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-200 text-purple-700 rounded-full"><Activity size={24} /></div>
                                    <div>
                                        <h3 className="font-bold text-purple-900">Solicitudes Pendientes</h3>
                                        <p className="text-xs text-purple-700">Reclutas esperando aprobación de graduación.</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-white text-purple-700 text-xs font-bold rounded-full shadow-sm">Revisar</span>
                            </div>
                        </div>
                    )}

                    {/* 3. Recruit Context */}
                    {user.role === UserRole.RECRUIT && (
                        <ProgressTracker user={user} stats={userStats} useSupabase={useSupabase} onGraduationRequested={() => loadData(user.role)} />
                    )}

                    {/* 4. Operational "Next Mission" Card (Dr Payaso / Photographer) */}
                    {(user.role === UserRole.DR_PAYASO || user.role === UserRole.PHOTOGRAPHER) && (
                        nextMission ? (
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                <div className="relative z-10 flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2 text-clown-yellow font-bold uppercase tracking-wider text-xs">
                                            <Star size={14} className="fill-current" />
                                            <span>Próxima Misión Confirmada</span>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-1">{nextMission.title}</h3>
                                        <p className="text-gray-300 text-sm flex items-center mb-4">
                                            <CalendarIcon size={14} className="mr-2" />
                                            {new Date(nextMission.date).toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric', month: 'long'})}
                                            <span className="mx-2">•</span>
                                            {new Date(nextMission.date).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                                        </p>
                                        <div className="inline-flex items-center bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                                            <MapPin size={14} className="mr-2 text-red-400" />
                                            <span className="text-xs font-medium">{nextMission.location}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10">
                                        <p className="text-xs text-gray-400 uppercase">Faltan</p>
                                        <p className="text-3xl font-bold font-mono">
                                            {Math.ceil((new Date(nextMission.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase">Días</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                                <div className="bg-blue-50 p-3 rounded-full text-clown-blue mb-3">
                                    <Smile size={32} />
                                </div>
                                <h3 className="font-bold text-gray-800">¡Tiempo de Descanso!</h3>
                                <p className="text-sm text-gray-500 max-w-xs mt-1">No tienes misiones programadas. Revisa el calendario para unirte a la próxima aventura.</p>
                                <button 
                                    onClick={() => setActiveTab('activities')}
                                    className="mt-4 text-clown-blue text-sm font-bold hover:underline"
                                >
                                    Ver Calendario
                                </button>
                            </div>
                        )
                    )}

                    {/* Stats Summary (For everyone except Recruit who has tracker) */}
                    {user.role !== UserRole.RECRUIT && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                                <div className="p-3 bg-red-50 text-clown-red rounded-xl"><Heart size={24} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Impacto Total</p>
                                    <p className="text-lg font-bold text-gray-800">{userStats.visitsCount} Visitas</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                                <div className="p-3 bg-blue-50 text-clown-blue rounded-xl"><Clock size={24} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Entrenamiento</p>
                                    <p className="text-lg font-bold text-gray-800">{userStats.trainingHours} Horas</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={24} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Estado Cuota</p>
                                    <p className="text-lg font-bold text-gray-800">{user.exemptFromFees ? 'Exento' : 'Al día'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                    <h2 className="text-2xl font-bold text-gray-800 font-display">Mis Visitas y Entrenamientos</h2>
                    
                    {/* Upcoming Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                            <CalendarCheck className="mr-2 text-clown-blue" size={20} />
                            Próximos Eventos
                        </h3>
                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                            {myHistory.upcoming.length > 0 ? myHistory.upcoming.map(event => (
                                <div key={event.id} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-clown-blue border-2 border-white ring-2 ring-gray-100"></div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 font-mono mb-1">
                                                    {new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                                <h4 className="font-bold text-gray-800 text-lg">{event.title}</h4>
                                                <p className="text-sm text-gray-500">{event.location}</p>
                                            </div>
                                            <div className="bg-blue-50 text-clown-blue px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                Inscrito
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 pl-8 italic">No tienes eventos próximos agendados.</p>
                            )}
                        </div>
                    </div>

                    {/* Past Section - Optimized Load More */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                            <Clock className="mr-2 text-gray-400" size={20} />
                            Historial Pasado
                        </h3>
                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                            {pastEventsToShow.length > 0 ? (
                                <>
                                    {pastEventsToShow.map(event => (
                                        <div key={event.id} className="relative pl-8 animate-in fade-in slide-in-from-top-2">
                                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ring-2 ring-gray-100 ${
                                                event.currentUserStatus === 'attended' ? 'bg-green-500' : 
                                                event.currentUserStatus === 'absent' ? 'bg-red-500' : 'bg-gray-300'
                                            }`}></div>
                                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 opacity-90 hover:opacity-100 transition-opacity">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-400 font-mono mb-1">
                                                            {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </p>
                                                        <h4 className="font-bold text-gray-800">{event.title}</h4>
                                                        <p className="text-xs text-gray-500">{event.location}</p>
                                                    </div>
                                                    {event.currentUserStatus === 'attended' && (
                                                        <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
                                                            <CheckCircle size={12} className="mr-1" /> Asistió
                                                        </div>
                                                    )}
                                                    {event.currentUserStatus === 'absent' && (
                                                        <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">
                                                            <XCircle size={12} className="mr-1" /> Ausente
                                                        </div>
                                                    )}
                                                    {event.currentUserStatus === 'registered' && (
                                                        <div className="flex items-center text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-bold">
                                                            Sin registro
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Load More Button */}
                                    {hasMorePastEvents && (
                                        <div className="pl-8 pt-2">
                                            <button 
                                                onClick={() => setVisibleHistoryCount(prev => prev + 5)}
                                                className="flex items-center justify-center w-full py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <ArrowDownCircle size={16} className="mr-2" />
                                                Ver {Math.min(5, myHistory.past.length - visibleHistoryCount)} anteriores...
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 pl-8 italic">No hay historial disponible.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                         <h2 className="text-2xl font-bold text-gray-800 font-display">Calendario de Actividades</h2>
                         {isAdmin && (
                             <button 
                                onClick={() => setShowCreateEvent(true)}
                                className="flex items-center space-x-2 bg-clown-red text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                             >
                                <Plus size={18} />
                                <span className="text-sm font-bold">Nueva Actividad</span>
                             </button>
                         )}
                    </div>

                    {/* Filters */}
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setActivityFilter('all')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activityFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Todo
                        </button>
                        <button 
                            onClick={() => setActivityFilter('training')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activityFilter === 'training' ? 'bg-yellow-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Entrenamientos
                        </button>
                        <button 
                            onClick={() => setActivityFilter('visit')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activityFilter === 'visit' ? 'bg-clown-red text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Visitas
                        </button>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4 flex items-center">
                        <AlertCircle size={16} className="mr-2" />
                        Mostrando actividades disponibles para el rol: <strong className="ml-1">{user.role}</strong>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredEvents.map(event => {
                            const { taken, max } = getCapacityForRole(event, user.role);
                            const isFull = taken >= max && !event.registered;
                            
                            return (
                                <div key={event.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between group">
                                    <div className="flex-1 mb-4 sm:mb-0">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${event.type === EventType.TRAINING ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {event.type}
                                            </div>
                                            <span className="text-sm text-gray-400 font-mono flex items-center">
                                                <CalendarDays size={14} className="mr-1" />
                                                {new Date(event.date).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-800 mb-1">{event.title}</h3>
                                        <p className="text-gray-500 text-sm mb-2">{event.description}</p>
                                        <p className="text-xs text-gray-400 flex items-center">
                                            <MapPin size={12} className="mr-1" /> {event.location}
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-3 sm:ml-4">
                                        <button 
                                            onClick={() => addToGoogleCalendar(event)}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg flex items-center"
                                            title="Agregar a Google Calendar"
                                        >
                                            <CalendarIcon size={20} />
                                            <span className="sm:hidden ml-2 text-xs font-medium">Google Cal</span>
                                        </button>

                                        {isAdmin && (
                                            <button onClick={() => setAttendanceEvent(event)} className="p-2 text-gray-400 hover:text-clown-blue hover:bg-blue-50 rounded-lg" title="Asistencia"><ClipboardCheck size={20} /></button>
                                        )}
                                        <button onClick={() => setChatEvent(event)} className="p-2 text-gray-400 hover:text-clown-blue hover:bg-blue-50 rounded-lg relative" title="Chat">
                                            <MessageSquare size={20} />
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                        </button>
                                        
                                        <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

                                        <div className="text-right mr-4 hidden sm:block">
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Cupos {user.role}</p>
                                            <p className={`text-sm font-bold ${isFull ? 'text-red-500' : 'text-gray-700'}`}>
                                                {taken}/{max}
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => handleRegisterToggle(event.id, event.type, event.registered)}
                                            disabled={isFull && !event.registered}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                                event.registered 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : isFull 
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-md'
                                            }`}
                                        >
                                            {event.registered ? 'Inscrito' : isFull ? 'Lleno' : 'Inscribirse'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Finances Tab */}
            {activeTab === 'finances' && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                    <div className="flex justify-between items-center">
                         <h2 className="text-2xl font-bold text-gray-800 font-display">Mis Finanzas</h2>
                        {!user.exemptFromFees && (
                            <button onClick={() => setShowPayment(true)} className="flex items-center space-x-2 bg-clown-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"><UploadCloud size={18} /><span className="text-sm font-bold">Reportar Pago</span></button>
                        )}
                    </div>
                    {user.exemptFromFees && (
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200 flex items-start space-x-3 mb-4"><Zap size={20} className="mt-0.5 shrink-0" /><div><h3 className="font-bold text-sm">Estado de Cuenta: EXENTO</h3><p className="text-xs mt-1">Tu perfil ha sido marcado como exento de cuotas mensuales.</p></div></div>
                    )}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Historial de Pagos</h3>
                            {!user.exemptFromFees && (<span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">Cuota Mensual: ₡5,000</span>)}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead><tr><th className="p-4 text-xs font-semibold text-gray-500 uppercase">Mes</th><th className="p-4 text-xs font-semibold text-gray-500 uppercase">Fecha Pago</th><th className="p-4 text-xs font-semibold text-gray-500 uppercase">Monto</th><th className="p-4 text-xs font-semibold text-gray-500 uppercase">Estado</th></tr></thead>
                                <tbody className="divide-y divide-gray-100">{payments.length > 0 ? payments.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="p-4 font-medium text-gray-800">{p.month}</td><td className="p-4 text-sm text-gray-500 font-mono">{p.datePaid || '-'}</td><td className="p-4 text-sm font-bold text-gray-700">₡{p.amount.toLocaleString()}</td><td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center ${p.status === 'paid' ? 'bg-green-100 text-green-700' : p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status === 'paid' ? 'Pagado' : p.status === 'rejected' ? 'Rechazado' : 'Validando...'}</span></td></tr>)) : (<tr><td colSpan={4} className="p-6 text-center text-gray-400 text-sm">No hay registros de pagos.</td></tr>)}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ADMIN Tabs */}
            {activeTab === 'volunteers' && isAdmin && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800 font-display">Gestión de Voluntarios</h2></div><UsersTable isSupabase={useSupabase} /></div>
            )}
             {activeTab === 'requests' && isAdmin && (
                <GraduationManager useSupabase={useSupabase} />
            )}
             {activeTab === 'treasury' && (isAdmin || isTreasurer) && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500"><TreasuryManager useSupabase={useSupabase} /></div>
            )}
            {activeTab === 'locations' && isAdmin && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800 font-display">Gestión de Centros</h2></div><LocationsManager useSupabase={useSupabase} /></div>
            )}
            {activeTab === 'stats' && adminStats && isAdmin && (
                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                    <h2 className="text-2xl font-bold text-gray-800 font-display mb-4">Panel de Impacto</h2>
                    {/* ... (Admin stats content remains same, truncated for brevity) ... */}
                    {/* Re-rendering stats content exactly as before */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Fuerza Activa</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-1">{adminStats.activeVolunteers}</h3>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-full">+2 este mes</span>
                                <UserIcon className="text-clown-blue" size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Visitas Realizadas</p>
                                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                                    {adminStats.monthlyVisits.reduce((acc, curr) => acc + curr.visits, 0)}
                                </h3>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-[10px] text-gray-400">Total Anual</span>
                                <Activity className="text-clown-red" size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Recaudado (Año)</p>
                                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                    ₡{adminStats.monthlyVisits.reduce((acc, curr) => acc + curr.financial, 0).toLocaleString()}
                                </h3>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-[10px] text-gray-400">Fondos Operativos</span>
                                <ArrowUpRight className="text-green-500" size={24} />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-clown-blue to-blue-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-blue-200 uppercase">Valor Donado</p>
                                <h3 className="text-2xl font-bold mt-1">
                                    ~{(adminStats.monthlyVisits.reduce((acc, curr) => acc + curr.visits, 0) * 15000).toLocaleString()}h
                                </h3>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="text-[10px] text-blue-100">Impacto Social</span>
                                <Heart className="text-white fill-current" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-6 flex items-center">
                                <TrendingUp size={18} className="mr-2 text-green-600" /> 
                                Salud Financiera (Ingresos)
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={adminStats.monthlyVisits}>
                                        <defs>
                                            <linearGradient id="colorFinancial" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                        <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            formatter={(value) => [`₡${value}`, 'Recaudado']}
                                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                                        />
                                        <Area type="monotone" dataKey="financial" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorFinancial)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-6 flex items-center">
                                <CalendarDays size={18} className="mr-2 text-clown-blue" /> 
                                Actividad Semanal (Días Pico)
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={adminStats.weekDayActivity}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: '#f3f4f6'}} />
                                        <Bar dataKey="count" fill={config.secondaryColor} radius={[4, 4, 0, 0]} name="Eventos" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-6 flex items-center">
                                <PieChartIcon size={18} className="mr-2 text-clown-red" /> 
                                Distribución de Fuerza
                            </h3>
                            <div className="h-64 w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={adminStats.roleDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {adminStats.roleDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-700 mb-6 flex items-center">
                                <MapPin size={18} className="mr-2 text-green-600" /> 
                                Top Centros Visitados
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={adminStats.topLocations} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                                            cursor={{fill: '#f8fafc'}} 
                                        />
                                        <Bar dataKey="count" fill={config.secondaryColor} radius={[0, 4, 4, 0]} barSize={24} name="Visitas" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {/* NO DIGITAL ID - Replaced by Landing */}
            {showCreateEvent && (<CreateEventModal useSupabase={useSupabase} onClose={() => setShowCreateEvent(false)} onEventCreated={() => loadData(user.role)} />)}
            {attendanceEvent && (<AttendanceModal event={attendanceEvent} useSupabase={useSupabase} onClose={() => setAttendanceEvent(null)} />)}
            {chatEvent && (<EventChat user={user} eventId={chatEvent.id} eventTitle={chatEvent.title} useSupabase={useSupabase} onClose={() => setChatEvent(null)} />)}
            {showPayment && (<PaymentModal useSupabase={useSupabase} onClose={() => setShowPayment(false)} onPaymentSuccess={() => loadData(user.role)} currentUser={user} />)}
            {showMassMessage && (<MassMessageModal useSupabase={useSupabase} onClose={() => setShowMassMessage(false)} />)}
            {showSettings && (<SystemSettingsModal onClose={() => setShowSettings(false)} />)}
        </Layout>
    );
};

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}
