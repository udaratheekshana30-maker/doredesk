import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/dormdesk_logo.png';
import heroBg from '../assets/hero-bg.png';
import AuthModal from '../components/AuthModal';
import { api } from '../services/api';
import {
    HiOutlineHome,
    HiOutlineBuildingOffice2,
    HiOutlineUserGroup,
    HiOutlineClipboardDocumentList,
    HiOutlinePhone,
    HiOutlineMapPin,
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineArrowRight,
    HiOutlineMegaphone,
    HiOutlineCalendarDays,
    HiOutlineArrowDownTray,
    HiOutlinePhoto
} from 'react-icons/hi2';


const normalizeAttachments = (notice) => {
    if (notice.attachments && notice.attachments.length > 0) return notice.attachments;
    if (notice.attachmentUrl) return [{ url: notice.attachmentUrl, type: notice.attachmentType }];
    return [];
};

const LandingSlideshow = ({ images }) => {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        if (images.length <= 1) return;
        const t = setInterval(() => setIdx(i => (i + 1) % images.length), 5000);
        return () => clearInterval(t);
    }, [images.length]);
    if (images.length === 0) return null;
    return (
        <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            {images.map((img, i) => (
                <img key={i} src={img.url} alt={`Slide ${i + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                        <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
                        />
                    ))}
                </div>
            )}
            <span className="absolute top-3 right-3 text-white text-[9px] font-black uppercase tracking-widest bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">Read Notice ↗</span>
        </div>
    );
};

const Landing = () => {
    const navigate = useNavigate();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [notices, setNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(true);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await api.getNotices();
            if (res.success) setNotices(res.data);
        } catch (err) {
            console.error('Failed to fetch notices:', err);
        } finally {
            setLoadingNotices(false);
        }
    };

    const openAuth = (mode) => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    const stats = [
        { label: 'Total Rooms', value: '450+', icon: HiOutlineBuildingOffice2 },
        { label: 'Happy Students', value: '1200+', icon: HiOutlineUserGroup },
        { label: 'Security Level', value: '24/7', icon: HiOutlineLockClosed },
        { label: 'Campus Units', value: '02', icon: HiOutlineHome },
    ];

    return (
        <div className="landing-page min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-900">
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />

            {/* Navbar */}
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 rounded-[2rem] px-8 py-4 flex items-center justify-between shadow-2xl shadow-indigo-500/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <img src={logo} alt="DormDesk Logo" className="w-8 h-8 object-contain brightness-0 invert" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">DormDesk <span className="text-indigo-600">UNI</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Premium Living</p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-10">
                    <a href="#about" className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-colors">About</a>
                    <a href="#services" className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-colors">Services</a>
                    <a href="#notices" className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <HiOutlineMegaphone className="text-indigo-500 text-lg" /> Notices
                    </a>
                    <a href="#contact" className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-colors">Contact</a>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openAuth('login')}
                        className="px-6 py-3 text-slate-600 hover:text-indigo-600 text-[11px] font-black uppercase tracking-widest transition-all"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => openAuth('register')}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        Join Now
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Professional Blurred Background */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src={heroBg} 
                        alt="Hostel Bedroom Background" 
                        className="w-full h-full object-cover blur-[10px] scale-110 opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/40 dark:from-slate-950/95 dark:via-slate-950/80 dark:to-slate-950/40"></div>
                </div>
                
                <div className="relative z-20 text-center px-6 max-w-5xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/50 backdrop-blur-xl border border-white/40 text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] mb-4 shadow-xl shadow-indigo-500/5 animate-in slide-in-from-bottom duration-700">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        DormDesk — The Future of Student Living
                    </div>
                    
                    <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] animate-in slide-in-from-bottom duration-1000">
                        Your Academic <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                            Success Partner.
                        </span>
                    </h2>
                    
                    <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto font-medium leading-relaxed animate-in slide-in-from-bottom duration-1000 delay-200">
                        Experience a premium, technology-driven living environment designed to fuel your engineering excellence and community spirit.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in slide-in-from-bottom duration-1000 delay-300">
                        <button
                            onClick={() => openAuth('login')}
                            className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:scale-105 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            Get Your Room <HiOutlineArrowRight className="text-xl" />
                        </button>
                        <a href="#about" className="w-full sm:w-auto px-12 py-5 bg-white/50 backdrop-blur-xl text-slate-900 border border-white/80 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-white/80 hover:shadow-xl active:scale-95 transition-all text-center">
                            Virtual Tour
                        </a>
                    </div>
                </div>

                {/* Decorative Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-1">
                        <div className="w-1 h-2 bg-slate-300 rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* Quick Stats Section */}
            <section className="relative z-30 -mt-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-white/40 flex flex-col items-center text-center transition-all duration-500 hover:-translate-y-2 hover:bg-white dark:hover:bg-slate-900">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mb-5 shadow-inner group-hover:scale-110 transition-transform">
                                <stat.icon />
                            </div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2 group-hover:text-indigo-500 transition-colors">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Room Types Section */}
            <section id="services" className="py-32 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 space-y-4">
                        <div className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px]">Your Sanctuary</div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Explore Our Rooms</h2>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
                        {/* Single Room */}
                        <div className="flip-card perspective-1000 h-[600px] group">
                            <div className="flip-card-inner preserve-3d relative w-full h-full">
                                {/* Front */}
                                <div className="flip-card-front backface-hidden absolute inset-0 bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800">
                                    <div className="h-2/3 overflow-hidden relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop"
                                            alt="Single Room"
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute top-6 left-6 px-5 py-2 rounded-2xl bg-white/90 backdrop-blur-md text-indigo-600 text-[10px] font-black uppercase tracking-widest shadow-lg">Premium Solo</div>
                                    </div>
                                    <div className="p-10 text-center space-y-3">
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Single Luxury</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">A private oasis designed for ultimate focus and deep thinking.</p>
                                        <div className="pt-4 flex items-center justify-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                            Hover to discover <HiOutlineArrowRight />
                                        </div>
                                    </div>
                                </div>
                                {/* Back */}
                                <div className="flip-card-back backface-hidden absolute inset-0 rotate-y-180 bg-indigo-900 rounded-[3.5rem] p-12 flex flex-col justify-center text-left text-white shadow-2xl shadow-indigo-900/60 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                    <h3 className="text-4xl font-black mb-8 tracking-tighter">Solo Features</h3>
                                    <ul className="space-y-6 mb-12">
                                        {[
                                            'Private A/C & Smart Ambient Lighting',
                                            'Attached High-End Designer Bathroom',
                                            'Ergonomic Workstation with Dual Monitors',
                                            'Ultra-speed Dedicated 1Gbps Fiber Link'
                                        ].map((f, i) => (
                                            <li key={i} className="flex items-center gap-4 group/item">
                                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover/item:bg-emerald-400 group-hover/item:text-indigo-900 transition-all">✓</div>
                                                <span className="text-indigo-100 font-bold tracking-tight">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => openAuth('login')}
                                        className="w-full py-5 bg-white text-indigo-900 rounded-3xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
                                    >
                                        Check Availability
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Double Room */}
                        <div className="flip-card perspective-1000 h-[600px] group">
                            <div className="flip-card-inner preserve-3d relative w-full h-full">
                                {/* Front */}
                                <div className="flip-card-front backface-hidden absolute inset-0 bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800">
                                    <div className="h-2/3 overflow-hidden relative">
                                        <img
                                            src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop"
                                            alt="Double Room"
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute top-6 left-6 px-5 py-2 rounded-2xl bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Collab Space</div>
                                    </div>
                                    <div className="p-10 text-center space-y-3">
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Double Sharing</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">The perfect balance of social life and academic partnership.</p>
                                        <div className="pt-4 flex items-center justify-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                            Hover to discover <HiOutlineArrowRight />
                                        </div>
                                    </div>
                                </div>
                                {/* Back */}
                                <div className="flip-card-back backface-hidden absolute inset-0 rotate-y-180 bg-emerald-900 rounded-[3.5rem] p-12 flex flex-col justify-center text-left text-white shadow-2xl shadow-emerald-900/60 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                                    <h3 className="text-4xl font-black mb-8 tracking-tighter">Shared Luxuries</h3>
                                    <ul className="space-y-6 mb-12">
                                        {[
                                            'Vast Balcony with City/Campus View',
                                            'Personal Storage & Security Vaults',
                                            'Collaborative Discussion Lounge Area',
                                            'Shared Kitchenette Access'
                                        ].map((f, i) => (
                                            <li key={i} className="flex items-center gap-4 group/item">
                                                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300 group-hover/item:bg-indigo-300 group-hover/item:text-emerald-900 transition-all">✓</div>
                                                <span className="text-emerald-50 font-bold tracking-tight">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => openAuth('login')}
                                        className="w-full py-5 bg-white text-emerald-900 rounded-3xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
                                    >
                                        Check Availability
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/20">
                            <img
                                src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070&auto=format&fit=crop"
                                alt="Modern Living"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-indigo-600 rounded-3xl -z-10 animate-pulse"></div>
                    </div>
                    <div>
                        <div className="text-indigo-600 font-black uppercase tracking-[0.2em] text-xs mb-4">About the Hostel</div>
                        <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                            Providing A Second Home <br />
                            <span className="text-indigo-600">For Your Academic Journey.</span>
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                            At DormDesk, we believe that education is not just about the classroom.
                            Our hostels provide a secure, modern, and collaborative environment where
                            students can thrive. With state-of-the-art facilities and a dedicated
                            management team, we ensure your focus remains on your studies while you
                            enjoy a comfortable stay.
                        </p>
                        <div className="space-y-4">
                            {[
                                'Fully Furnished Single & Double Rooms',
                                '24/7 High-Speed Wi-Fi Connectivity',
                                'Dedicated Study Halls & Discussion Areas',
                                'Integrated Security & QR Access System'
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">✓</div>
                                    <span className="text-slate-700 font-semibold">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Notices Section */}
            <section id="notices" className="py-24 px-6 bg-slate-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="text-indigo-600 font-black uppercase tracking-[0.2em] text-xs mb-4">Announcements</div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Latest Notices</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg italic">Stay informed with the latest updates from the warden.</p>
                    </div>

                    {loadingNotices ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : notices.length > 0 ? (
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-8 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
                            {notices.map((notice) => {
                                const atts = normalizeAttachments(notice);
                                const images = atts.filter(a => a.type === 'image');
                                const docs = atts.filter(a => a.type !== 'image');
                                return (
                                    <div key={notice._id} className="min-w-[85vw] md:min-w-0 snap-start group bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer" onClick={() => navigate(`/notice/${notice._id}`)}>
                                        {/* Multi-photo auto-slideshow */}
                                        {images.length > 0 && <LandingSlideshow images={images} />}

                                        <div className="p-8 flex flex-col flex-grow">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                                                    <HiOutlineMegaphone />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest">Official Update</div>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                                                {notice.title}
                                            </h3>

                                            <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-grow line-clamp-3">
                                                {notice.content}
                                            </p>

                                            {/* Document attachment */}
                                            {docs.length > 0 && (
                                                <a
                                                    href={docs[0].url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors mb-5"
                                                >
                                                    <HiOutlineCalendarDays className="text-lg" />
                                                    View Document Attached
                                                    <HiOutlineArrowDownTray className="ml-auto text-slate-400" />
                                                </a>
                                            )}

                                            <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                                                        {notice.createdBy?.name?.charAt(0) || 'W'}
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{notice.createdBy?.role}</span>
                                                </div>
                                                <span className="text-xs font-black text-indigo-600 flex items-center gap-1">
                                                    Read More <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <HiOutlineClipboardDocumentList className="text-5xl text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active notices at the moment</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Support/Footer Banner */}
            <section className="py-24 px-6 bg-indigo-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl font-black text-white mb-6">Need Immediate Assistance?</h2>
                    <p className="text-indigo-100/60 text-lg mb-12 max-w-2xl mx-auto">
                        Our team is available 24/7 to help you with any issues or queries related to your stay.
                    </p>
                    <button
                        onClick={() => openAuth('login')}
                        className="px-10 py-4 bg-white text-indigo-900 rounded-2xl text-base font-black shadow-2xl shadow-indigo-950/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Login to Help Center
                    </button>
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-4">Contact Us</div>
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Ready To Join Us?</h2>
                        <p className="text-slate-500 font-medium">We're here to help you with any questions regarding your stay.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 text-center flex flex-col items-center">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm">
                                <HiOutlineMapPin />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-2 leading-none">Our Location</h3>
                            <p className="text-slate-500 text-sm mt-3">
                                DormDesk, No. 670, <br />
                                University Ave, Campus District, <br />
                                Sri Lanka.
                            </p>
                        </div>
                        <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 text-center flex flex-col items-center">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm">
                                <HiOutlinePhone />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-2 leading-none">Phone Number</h3>
                            <p className="text-slate-500 text-sm mt-3 mb-1">+94 81 2 386 611</p>
                            <p className="text-slate-500 text-sm">+94 81 2 386 612</p>
                        </div>
                        <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 text-center flex flex-col items-center">
                            <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm">
                                <HiOutlineEnvelope />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-2 leading-none">Email Support</h3>
                            <p className="text-slate-500 text-sm mt-3 mb-1">officer@dorm.lk</p>
                            <p className="text-slate-500 text-sm">hostel.info@dorm.lk</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-6 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="max-w-xs">
                        <div className="flex items-center gap-3 mb-6">
                            <img src={logo} alt="DormDesk Logo" className="w-14 h-10 object-contain" />
                            <span className="text-xl font-black text-slate-900">DormDesk UNI</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            A modern management solution for a premium hostel experience in the hill capital.
                            Built for students, by design.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                        <div>
                            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Navigation</h4>
                            <ul className="space-y-4 text-sm text-slate-500 font-medium">
                                <li><a href="#about" className="hover:text-indigo-600 transition-colors">About Us</a></li>
                                <li><a href="#services" className="hover:text-indigo-600 transition-colors">Room Types</a></li>
                                <li><a href="#notices" className="hover:text-indigo-600 transition-colors">Official Notices</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Resources</h4>
                            <ul className="space-y-4 text-sm text-slate-500 font-medium">
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Guidelines</a></li>
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">FAQs</a></li>
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Fee Structure</a></li>
                            </ul>
                        </div>
                        <div className="hidden sm:block">
                            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-[10px]">Legal</h4>
                            <ul className="space-y-4 text-sm text-slate-500 font-medium">
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-slate-100 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">© 2026 DormDesk Hostel. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
