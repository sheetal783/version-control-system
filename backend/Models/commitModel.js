import mongoose from "mongoose";

const CommitSchema = new mongoose.Schema({
    commitId: {
        type: String,
        required: true,
        unique: true,
    },
    repoName: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        default: "No message",
    },
    author: {
        type: String,
        default: "Unknown",
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    files: {
        type: [String],
        default: [],
    },
});

const Commit = mongoose.model("Commit", CommitSchema);

export default Commit;
