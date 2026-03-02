import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Server, Trash2, Edit2, ShieldCheck, Activity } from 'lucide-react';

export default function Dashboard() {
    const [servers, setServers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [newServerName, setNewServerName] = useState('');
    const [newServerConfig, setNewServerConfig] = useState('');
    const [newServerCountry, setNewServerCountry] = useState('');

    useEffect(() => {
        const serversRef = ref(db, 'servers');
        const unsubscribe = onValue(serversRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const sortedServers = Object.entries(data).map(([key, value]: any) => ({
                    id: key,
                    ...value
                }));
                setServers(sortedServers);
            } else {
                setServers([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const handleAddServer = async (e: React.FormEvent) => {
        e.preventDefault();
        const serversRef = ref(db, 'servers');
        await push(serversRef, {
            name: newServerName,
            config: newServerConfig,
            countryCode: newServerCountry.toUpperCase(),
            status: 'active',
            addedAt: Date.now()
        });
        setNewServerName('');
        setNewServerConfig('');
        setNewServerCountry('');
        setShowAddForm(false);
    };

    const handleDeleteServer = async (id: string) => {
        if (confirm('Are you sure you want to delete this config?')) {
            await remove(ref(db, `servers/${id}`));
        }
    };

    const toggleServerStatus = async (id: string, currentStatus: string) => {
        await update(ref(db, `servers/${id}`), {
            status: currentStatus === 'active' ? 'maintenance' : 'active'
        });
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {/* Navbar */}
            <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-indigo-500" />
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                JumprVPN Admin
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Network Nodes</h1>
                        <p className="text-gray-400 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            {servers.length} Active VLESS Servers
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add Server
                    </button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 shadow-xl animate-fade-in">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Server className="w-5 h-5 text-indigo-400" />
                            New VLESS Configuration
                        </h3>
                        <form onSubmit={handleAddServer} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Server Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newServerName}
                                        onChange={(e) => setNewServerName(e.target.value)}
                                        placeholder="e.g. Germany Premium 1"
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Country Code (e.g. DE)</label>
                                    <input
                                        required
                                        type="text"
                                        maxLength={2}
                                        value={newServerCountry}
                                        onChange={(e) => setNewServerCountry(e.target.value)}
                                        placeholder="DE"
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">VLESS Link / Config JSON</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={newServerConfig}
                                    onChange={(e) => setNewServerConfig(e.target.value)}
                                    placeholder="vless://..."
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors font-mono text-xs text-gray-300"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
                                >
                                    Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Server List */}
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {servers.map((server) => (
                            <div
                                key={server.id}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{getFlagEmoji(server.countryCode)}</div>
                                        <div>
                                            <h4 className="font-semibold text-lg">{server.name}</h4>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${server.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                {server.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => toggleServerStatus(server.id, server.status)}
                                            className="p-2 text-gray-400 hover:text-indigo-400 rounded-lg hover:bg-gray-800"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteServer(server.id)}
                                            className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-950 rounded-lg p-3 overflow-hidden relative group/code">
                                    <p className="font-mono text-xs text-gray-500 truncate select-all">
                                        {server.config}
                                    </p>
                                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none"></div>
                                </div>
                            </div>
                        ))}

                        {servers.length === 0 && (
                            <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-800 rounded-2xl">
                                <Server className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-400 mb-1">No servers configured</h3>
                                <p className="text-gray-500">Add your first VLESS configuration to get started</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

// Helper function to convert country code to flag emoji
function getFlagEmoji(countryCode: string) {
    if (!countryCode) return '🏳️';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
