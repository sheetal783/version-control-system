import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,

    },
    repositories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
        },
    ],
    followedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    starRepos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Repository",
        },
    ],
});

const User = mongoose.model("User", UserSchema);

export default User;