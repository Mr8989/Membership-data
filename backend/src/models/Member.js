import mongoose from "mongoose";

const memberScheme = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    birthDate: {
        type: Date,
        required: true
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    gender: {
        enum: ["male", "female"],
    },
    lastAttendance: {
        type: Date,
        required: true,
    },
    role: {
        enum: ["user", "admin"]
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    groups: {
        type: [String]
    }
},
    {
        timestamps: true,
    }
)

const Member = mongoose.model("member",memberScheme);

export default Member;