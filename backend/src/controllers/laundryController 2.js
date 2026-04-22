const LaundryBooking = require('../models/LaundryBooking');

const MACHINES = 6;
const TIME_SLOTS = [
    '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00',
    '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
    '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
    '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'
];

// GET /api/laundry/availability?date=YYYY-MM-DD
const getAvailability = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

        const bookings = await LaundryBooking.find({ date, status: { $ne: 'cancelled' } })
            .populate('student', 'name studentId');

        // Build a grid: machineId x slot => booking or null
        const grid = {};
        for (let m = 1; m <= MACHINES; m++) {
            grid[m] = {};
            TIME_SLOTS.forEach(slot => { grid[m][slot] = null; });
        }
        bookings.forEach(b => {
            if (grid[b.machineId]) grid[b.machineId][b.slot] = b;
        });

        res.json({ success: true, data: { grid, slots: TIME_SLOTS, machines: MACHINES } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/laundry/book
const bookSlot = async (req, res) => {
    try {
        const { machineId, date, slot, notes } = req.body;
        if (!machineId || !date || !slot)
            return res.status(400).json({ success: false, message: 'machineId, date and slot are required' });

        if (machineId < 1 || machineId > MACHINES)
            return res.status(400).json({ success: false, message: `Machine ID must be between 1 and ${MACHINES}` });

        if (!TIME_SLOTS.includes(slot))
            return res.status(400).json({ success: false, message: 'Invalid time slot' });

        // Check student doesn't already have a booking on same date
        const existing = await LaundryBooking.findOne({
            student: req.user._id, date, status: { $ne: 'cancelled' }
        });
        if (existing)
            return res.status(400).json({ success: false, message: 'You already have a laundry booking on this date' });

        const booking = await LaundryBooking.create({
            student: req.user._id,
            studentName: req.user.name,
            studentId: req.user.studentId,
            machineId, date, slot,
            notes: notes || ''
        });

        res.status(201).json({ success: true, data: booking, message: 'Slot booked successfully!' });
    } catch (err) {
        if (err.code === 11000)
            return res.status(400).json({ success: false, message: 'That slot is already booked. Please choose another.' });
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/laundry/my-bookings
const getMyBookings = async (req, res) => {
    try {
        const bookings = await LaundryBooking.find({ student: req.user._id })
            .sort({ date: -1, createdAt: -1 });
        res.json({ success: true, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/laundry/cancel/:id
const cancelBooking = async (req, res) => {
    try {
        const booking = await LaundryBooking.findOne({ _id: req.params.id, student: req.user._id });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (booking.status === 'cancelled')
            return res.status(400).json({ success: false, message: 'Already cancelled' });

        booking.status = 'cancelled';
        await booking.save();
        res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/laundry/all  (warden/admin)
const getAllBookings = async (req, res) => {
    try {
        const { date } = req.query;
        const filter = date ? { date } : {};
        const bookings = await LaundryBooking.find(filter)
            .populate('student', 'name studentId email')
            .sort({ date: -1, slot: 1 });
        res.json({ success: true, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/laundry/status/:id  (warden/admin update status)
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['booked', 'in-progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status))
            return res.status(400).json({ success: false, message: 'Invalid status' });

        const booking = await LaundryBooking.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        );
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: booking, message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/laundry/stats (innovative heatmap data)
const getLaundryStats = async (req, res) => {
    try {
        // Average occupancy per slot over the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

        const history = await LaundryBooking.find({
            date: { $gte: dateStr },
            status: { $ne: 'cancelled' }
        });

        const slotCounts = {};
        TIME_SLOTS.forEach(s => { slotCounts[s] = 0; });

        history.forEach(h => {
            if (slotCounts[h.slot] !== undefined) slotCounts[h.slot]++;
        });

        // Convert to occupancy percentage (assuming 6 machines, 30 days)
        const totalPossiblePerSlot = MACHINES * 30;
        const heatmap = TIME_SLOTS.map(slot => ({
            slot,
            occupancy: Math.round((slotCounts[slot] / totalPossiblePerSlot) * 100)
        }));

        res.json({
            success: true,
            data: {
                heatmap,
                totalBookings: history.length,
                peakSlot: heatmap.sort((a,b) => b.occupancy - a.occupancy)[0]?.slot || 'N/A'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAvailability, bookSlot, getMyBookings, cancelBooking, getAllBookings, updateStatus, getLaundryStats };
