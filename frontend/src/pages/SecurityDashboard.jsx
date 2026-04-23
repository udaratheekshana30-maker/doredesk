import React from 'react';
import { HiOutlineShieldCheck, HiOutlineCpuChip, HiOutlineBolt } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import QrSecurityPinCard from '../components/QrSecurityPinCard';
import QrOutsideMonitor from '../components/QrOutsideMonitor';

const SecurityDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-[3rem] p-12 text-white shadow-2xl bg-slate-900 border border-white/5 group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-100 duration-1000"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] transition-all group-hover:scale-125 duration-1000"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-500/10 blur-[80px]"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></div>
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400">Security Core Operational</span>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                                Security <br/><span className="text-indigo-400 italic">Dashboard</span>
                            </h1>
                            <p className="text-slate-400 text-sm font-medium mt-4 max-w-xl leading-relaxed">
                                System Authorized: <span className="text-white font-bold">{user?.name || 'Security Officer'}</span>. Monitoring gateway protocols, QR authentication cycles, and real-time student location status.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                    <HiOutlineShieldCheck size={20} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Encrypted Gateway</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                    <HiOutlineCpuChip size={20} />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Real-time Sync</div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-center">
                        <div className="relative">
                            <div className="w-48 h-48 rounded-[3rem] border-2 border-white/5 flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-700">
                                <HiOutlineShieldCheck size={80} className="text-white/10 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-600/40 animate-bounce">
                                <HiOutlineBolt className="text-white" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Operational Cards */}
            <div className="grid grid-cols-1 gap-10">
                <QrSecurityPinCard />
                <QrOutsideMonitor title="Active Gateway Monitoring" />
            </div>
        </div>
    );
};

export default SecurityDashboard;
