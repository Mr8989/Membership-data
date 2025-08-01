import Member from "../models/Member.js";
import xlsx from "xlsx";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//get new members
export const newMembers = async (req, res) => {
    try {
        const member = new Member(req.body);
        await member.save();
        res.status(201).send(member);
    } catch (error) {
        console.log("Error in get new member in member controller");
    }
}

//get all members
export const getMembers = async (req, res) => {
    try {
        const members = await Member.find();
        res.send(members);
    } catch (error) {
        console.log("Error in get all members in member Controller", error)
        res.status(500).json({ message: "Internal server error ", error })
    }
}

export const processAttendance = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded")
        }

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(worksheet);

        //Get all members from database

        const allMembers = await Member.find({ isActive: true });

        //Process attendance
        const presentMembers = data.map(row => `${row.FirstName} ${row.LastName}`.toLowerCase());

        const absentMembers = allMembers.filter(member => {
            const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
            return !presentNames.includes(fullName);
        })

        //update lastAttendance for present members
        const today = new Date();
        await Member.updateMany(
            {
                _id: {
                    $in: allMembers.filter(m => !absentMembers.some(a => a._id.equals(m._id))).map(m._id)
                }
            },
            { lastAttendance: today }
        );

        //create attendance record
        const attendanceRecord = new Attendance({
            date: today,
            presentMembers: allMembers.filter(m => !absentMembers.some(a => a._id.equals(m._id))).map(m => m._id),
            absentMembers: absentMembers.map(m => m._id),
            serviceType: "Sunday Service"
        });

        await attendanceRecord.save();

        res.send({
            message: "Attendance processed successfully",
            absentMembers,
            totalPresent: presentNames.length,
            totalAbsent: absentMembers.length
        })

    } catch (error) {
        console.log("Error in processed attendance ", error.message)
        res.status(500).json({ message: "Error processing in attendance" })
    }
}