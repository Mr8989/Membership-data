import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role:{
        type: String,
        enum: ["admin", "user"],
        default: "user"
    }
}, {
    timestamps: true
});

//hash password before saving it to the database 
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt)
            next()
        } catch (error) {
            next(error)
        }
})
    //compare password function
userSchema.methods.comparePassword = async function (userPassword) {
    try {
        return await bcrypt.compare(userPassword, this.password)
    } catch (error) {
        throw error;
    }
}

const User =  mongoose.model("User", userSchema)

export default User;