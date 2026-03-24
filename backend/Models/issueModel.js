import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open",
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repository",
        required: true,
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
});

const Issue = mongoose.model("Issue", IssueSchema);

export default Issue;