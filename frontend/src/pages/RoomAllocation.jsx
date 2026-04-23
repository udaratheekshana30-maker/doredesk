import { useState, useEffect, useCallback, useMemo } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import { 
    HiOutlineXMark, 
    HiOutlineHome, 
    HiOutlineUserGroup, 
    HiOutlineSparkles, 
    HiOutlineKey,
    HiOutlineArrowRight,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlineAdjustmentsHorizontal,
    HiOutlineMapPin,
    HiOutlineTrash,
    HiOutlineNoSymbol
} from 'react-icons/hi2'

// Format room number as M1/F1 based on wing
const fmtRoom = (wing, roomnumber) => {
    const prefix = wing?.toLowerCase() === 'female' ? 'F' : 'M';
    return `${prefix}${roomnumber}`;
};

export default function RoomAllocation({ allocatingStudent, setAllocatingStudent }) {
    const [wing, setWing] = useState(allocatingStudent?.wing?.toLowerCase() || 'male')
    const [floors, setFloors] = useState([])
    const [selectedFloor, setSelectedFloor] = useState(null)
    const [rooms, setRooms] = useState([])
    const [suggestedRoomIds, setSuggestedRoomIds] = useState(new Set())
    const [degreeMatchRoomIds, setDegreeMatchRoomIds] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [confirmBed, setConfirmBed] = useState(null)
    const [stats, setStats] = useState({ total: 0, occupied: 0, maintenance: 0 })

    useEffect(() => {
        if (allocatingStudent) setWing(allocatingStudent.wing?.toLowerCase() || 'male')
    }, [allocatingStudent])

    const loadFloors = useCallback(async () => {
        try {
            const data = await api.getFloors(wing)
            const active = data.filter(f => f.isactive)
            setFloors(active)
            if (active.length > 0 && !selectedFloor) {
                setSelectedFloor(active[0]._id)
            }
        } catch { toast.error('Failed to load floors') }
    }, [wing, selectedFloor])

    useEffect(() => { loadFloors() }, [wing, loadFloors])

    const loadRooms = useCallback(async () => {
        if (!selectedFloor) return
        try {
            setLoading(true)
            const data = await api.getRooms({ floor: selectedFloor })
            setRooms(data)
            
            // Calculate Stats
            let total = 0, occ = 0, maint = 0;
            data.forEach(r => {
                if (!r.isactive) maint++;
                r.beds.forEach(b => {
                    total++;
                    if (b.isOccupied) occ++;
                })
            })
            setStats({ total, occupied: occ, maintenance: maint })
        } catch { toast.error('Failed to load rooms') }
        finally { setLoading(false) }
    }, [selectedFloor])

    useEffect(() => { loadRooms() }, [loadRooms])

    useEffect(() => {
        if (allocatingStudent) loadSuggestions()
    }, [allocatingStudent, wing])

    const loadSuggestions = async () => {
        if (!allocatingStudent) return
        try {
            const data = await api.getSuggestions(wing, allocatingStudent.degree)
            setSuggestedRoomIds(new Set(data.map(s => s.room._id)))
            setDegreeMatchRoomIds(new Set(data.filter(s => s.degreeMatch).map(s => s.room._id)))
        } catch { console.error('Failed to load suggestions') }
    }

    const handleSelectBed = (room, bedId) => {
        if (!allocatingStudent) { 
            toast.error('Select a student first from Student Applications', {
                icon: '👤',
                style: { borderRadius: '1rem', background: '#334155', color: '#fff' }
            }); 
            return 
        }
        setConfirmBed({ room, bedId })
    }

    const toggleRoomStatus = async (roomId) => {
        try {
            await api.toggleRoom(roomId)
            toast.success('Room status updated')
            loadRooms()
        } catch (err) { toast.error(err.message) }
    }

    const handleConfirmAllocation = async () => {
        if (!confirmBed || !allocatingStudent) return
        try {
            await api.allocate({ 
                studentId: allocatingStudent._id, 
                roomId: confirmBed.room._id, 
                bedId: confirmBed.bedId 
            })
            toast.success(`Successfully allocated to ${fmtRoom(wing, confirmBed.room.roomnumber)}`, {
                icon: '✅',
                style: { borderRadius: '1rem', background: '#10b981', color: '#fff' }
            })
            setAllocatingStudent(null); 
            setConfirmBed(null); 
            loadRooms()
        } catch (err) { toast.error(err.message) }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Management Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full -ml-24 -mb-24 blur-3xl"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                            <HiOutlineAdjustmentsHorizontal className="animate-spin-slow" />
                            Room Management Center
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                            Manage & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Allocate</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-md">
                            Monitor occupancy, handle smart allocations, and manage room statuses in real-time.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 min-w-[320px]">
                        {[
                            { label: 'Total Beds', val: stats.total, color: 'text-white' },
                            { label: 'Occupied', val: stats.occupied, color: 'text-emerald-400' },
                            { label: 'Off-line', val: stats.maintenance, color: 'text-rose-400' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl text-center group hover:bg-white/10 transition-all">
                                <div className={`text-3xl font-black ${s.color} group-hover:scale-110 transition-transform`}>{s.val}</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Student Alert */}
            {allocatingStudent && (
                <div className="bg-indigo-600 rounded-3xl p-6 shadow-xl border border-white/20 flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white relative">
                            <HiOutlineUserGroup size={28} />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Ready for Allocation</div>
                            <h3 className="text-xl font-black text-white">{allocatingStudent.name}</h3>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] font-bold text-indigo-100 bg-white/10 px-2 py-0.5 rounded-md uppercase">{allocatingStudent.degree}</span>
                                <span className="text-[10px] font-bold text-indigo-100 bg-white/10 px-2 py-0.5 rounded-md uppercase">{allocatingStudent.wing} WING</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setAllocatingStudent(null)}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2"
                    >
                        <HiOutlineXMark /> Cancel Allocation
                    </button>
                </div>
            )}

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                    {!allocatingStudent ? (
                        <>
                            <button 
                                onClick={() => setWing('male')}
                                className={`px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${wing === 'male' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-lg' : 'text-slate-400'}`}
                            >
                                Male Wing
                            </button>
                            <button 
                                onClick={() => setWing('female')}
                                className={`px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${wing === 'female' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-lg' : 'text-slate-400'}`}
                            >
                                Female Wing
                            </button>
                        </>
                    ) : (
                        <div className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-indigo-500">
                            Locked to {wing} wing
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                    {floors.map(f => (
                        <button 
                            key={f._id} 
                            onClick={() => setSelectedFloor(f._id)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                selectedFloor === f._id 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' 
                                : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-indigo-300'
                            }`}
                        >
                            Floor {f.floorNumber}
                        </button>
                    ))}
                </div>
            </div>

            {/* Room Grid */}
            {loading ? (
                <div className="py-32 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Scanning Rooms...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {rooms.map(room => (
                        <div 
                            key={room._id} 
                            className={`group bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border-2 transition-all duration-500 relative overflow-hidden ${
                                !room.isactive ? 'border-rose-100 dark:border-rose-900/30 opacity-75' :
                                degreeMatchRoomIds.has(room._id) ? 'border-red-500 shadow-[0_0_30px_-5px_rgba(239,68,68,0.2)]' :
                                suggestedRoomIds.has(room._id) ? 'border-indigo-400' : 
                                'border-slate-50 dark:border-slate-800 hover:border-indigo-200'
                            }`}
                        >
                            {/* Room Badge */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">
                                        {fmtRoom(room.wing, room.roomnumber)}
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{room.type}</span>
                                </div>
                                <button 
                                    onClick={() => toggleRoomStatus(room._id)}
                                    title={room.isactive ? "Put on Maintenance" : "Activate Room"}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                        room.isactive 
                                        ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500' 
                                        : 'bg-rose-500 text-white'
                                    }`}
                                >
                                    {room.isactive ? <HiOutlineAdjustmentsHorizontal size={20} /> : <HiOutlineNoSymbol size={20} />}
                                </button>
                            </div>

                            {/* Beds View */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {room.beds.map(bed => (
                                    <button
                                        key={bed.bedId}
                                        disabled={bed.isOccupied || !room.isactive}
                                        onClick={() => handleSelectBed(room, bed.bedId)}
                                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                                            bed.isOccupied 
                                            ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700' 
                                            : !room.isactive
                                                ? 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                                                : 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/20 hover:border-emerald-500 hover:shadow-lg group/bed'
                                        }`}
                                    >
                                        <HiOutlineKey className={`text-lg ${bed.isOccupied ? 'text-slate-300' : 'text-emerald-500 group-hover/bed:scale-110 transition-transform'}`} />
                                        <span className={`text-[10px] font-black uppercase ${bed.isOccupied ? 'text-slate-400' : 'text-slate-600'}`}>Bed {bed.bedId}</span>
                                        <div className={`w-1.5 h-1.5 rounded-full ${bed.isOccupied ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                                    </button>
                                ))}
                            </div>

                            {/* Occupants Preview */}
                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex -space-x-2">
                                    {room.beds.filter(b => b.isOccupied).map((b, i) => (
                                        <div 
                                            key={i} 
                                            className="w-8 h-8 rounded-lg bg-indigo-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-white"
                                            title="View Student Info"
                                        >
                                            {['JD', 'AS', 'RK', 'ML'][i % 4]}
                                        </div>
                                    ))}
                                    {room.beds.filter(b => !b.isOccupied).map((b, i) => (
                                        <div 
                                            key={i} 
                                            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-slate-300"
                                        >
                                            <HiOutlineKey size={12} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Decorative Overlay for Maintenance */}
                            {!room.isactive && (
                                <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                                    <div className="bg-rose-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest rotate-[-12deg] shadow-lg">
                                        Maintenance
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm Allocation Modal */}
            {confirmBed && allocatingStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-white/20 space-y-8 animate-in zoom-in duration-300">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto text-indigo-600">
                                <HiOutlineCheckCircle size={40} className="animate-bounce" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Finalize Allocation</h3>
                            <p className="text-slate-500 font-medium">Please confirm the details before proceeding.</p>
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: 'Student', val: allocatingStudent.name },
                                { label: 'Degree', val: allocatingStudent.degree },
                                { label: 'Room', val: `${fmtRoom(wing, confirmBed.room.roomnumber)} (${confirmBed.room.type})` },
                                { label: 'Bed Position', val: `Bed ${confirmBed.bedId}` },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                    <span className="text-sm font-black text-slate-800 dark:text-white">{item.val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setConfirmBed(null)}
                                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                                Back
                            </button>
                            <button 
                                onClick={handleConfirmAllocation}
                                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
