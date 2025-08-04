import mongoose, { mongo } from "mongoose";

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    presentMembers: [{
        type: mongoose.Schema.Types.ObjectId,  
        ref: "Member"
    }],
    absentMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member"
    }],
    serviceType: {
        type: String,
        required: true,
    }
})

const Attendance = mongoose.model("attendance", attendanceSchema);

export default Attendance;