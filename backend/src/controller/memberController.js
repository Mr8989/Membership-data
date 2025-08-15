import Member from "../models/Member.js";
import Attendance from "../models/Attendance.js"; // make sure you create & import this
import xlsx from "xlsx";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage }); // export so routes can use it

export const processAttendance = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded");
        }

        // Read Excel file
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Get all active members from database
        const allMembers = await Member.find({ isActive: true });

        // Names from uploaded file
        const presentNames = data.map(row =>
            `${row.FirstName?.trim() || ""} ${row.LastName?.trim() || ""}`.toLowerCase()
        );

        // Determine absent members
        const absentMembers = allMembers.filter(member => {
            const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
            return !presentNames.includes(fullName);
        });

        // Update lastAttendance for present members
        const today = new Date();
        const presentMembers = allMembers.filter(
            m => !absentMembers.some(a => a._id.equals(m._id))
        );

        await Member.updateMany(
            { _id: { $in: presentMembers.map(m => m._id) } },
            { lastAttendance: today }
        );

        // Save attendance record
        const attendanceRecord = new Attendance({
            date: today,
            presentMembers: presentMembers.map(m => m._id),
            absentMembers: absentMembers.map(m => m._id),
            serviceType: "Sunday Service"
        });

        await attendanceRecord.save();

        res.send({
            message: "Attendance processed successfully",
            absentMembers,
            totalPresent: presentMembers.length,
            totalAbsent: absentMembers.length
        });

    } catch (error) {
        console.error("Error in processing attendance:", error.message);
        res.status(500).json({ message: "Error processing attendance" });
    }
};

export const getMonthlyAttendanceStats = async (req, res) => {
    try {
        const stats = await Attendance.aggregate([
            {
                $group: {
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                    presentCount: { $sum: { $size: "$presentMembers" } },
                    absentCount: { $sum: { $size: "$absentMembers" } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Get total members (static across months)
        const totalMembers = await Member.countDocuments({ isActive: true });

        // Format result
        const formatted = stats.map(s => ({
            month: `${s._id.month}-${s._id.year}`, // e.g., 8-2025
            totalMembers,
            present: s.presentCount,
            absent: s.absentCount
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Error in getMonthlyAttendanceStats:", error);
        res.status(500).json({ message: "Error fetching monthly stats" });
    }
};



export const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: "Date is required" });
        }

        // normalize to midnight so comparison works
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);

        // find attendance records for that date
        const attendanceRecords = await Attendance.find({
            date: selectedDate,
        }).lean();

        // get total members
        const totalMembers = await Member.countDocuments();

        const presentCount = attendanceRecords.filter(
            (rec) => rec.status === "present"
        ).length;

        const absentCount = totalMembers - presentCount;

        res.json({
            date: selectedDate,
            total: totalMembers,
            present: presentCount,
            absent: absentCount,
        });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ error: "Server error" });
    }
};


