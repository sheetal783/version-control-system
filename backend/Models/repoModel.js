import mongoose from "mongoose";

const RepoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    content: {
        type: String,
    },
    visibility: {
        type: Boolean,

    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    issues: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Issue",
    },
    collaborators: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    starRepos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});

const Repository = mongoose.model("Repository", RepoSchema);

export default Repository;