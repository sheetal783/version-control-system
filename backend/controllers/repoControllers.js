import mongoose from "mongoose";
import Repository from "../Models/repoModel.js";
import Issue from "../Models/issueModel.js";
import "../Models/userModel.js";

export  async function createRepository(req, res) {
    const { owner, name, content, description, visibility } = req.body;
    try{
if(!name){
    return res.status(400).json({ error: "repository name is required" });
}
if(!mongoose.Types.ObjectId.isValid(owner)){
    return res.status(400).json({ error: "invalid owner id" });
}
const newRepository = new Repository({
    name,
    description,
    visibility: Boolean(visibility),
    owner,
    issues: [],
    content
});
const result=await newRepository.save();
res.status(201).json({ message: "repository created successfully", repositoryId: result._id, });
    }
    catch(error){
        console.error("Error during repository creation:", error.message);
        res.status(500).send("server error");
    }
};

export async function getAllRepositories(req, res) {
    try {
        const repositories = await Repository.find()
        .populate("owner")
        .populate({ path: "issues", populate: "owner" });
        res.status(200).json(repositories);
    }
    catch (error) {
        console.error("❌ Error fetching repositories:", error.message);
        console.error("Error details:", error);
        
        if (error.name === "MongoNetworkError" || error.name === "MongoTimeoutError") {
            return res.status(503).json({ 
                error: "Database connection failed. Please try again later.",
                details: error.message 
            });
        }
        
        res.status(500).json({ 
            error: "server error",
            details: error.message 
        });
    }
};

export async function fetchRepositoryById(req, res) {
    const repoID=req.params.id;
    try {
        const repository = await Repository.findById(repoID)
          .populate("owner")
          .populate({ path: "issues", populate: "owner" });
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }
        res.status(200).json(repository);

    }
        catch (error) {
            console.error("Error fetching repository by id:", error.message);
            res.status(500).send("server error");
        }
};

export async function fetchRepositoryByName(req, res) {
  const repoName=req.params.name;
    try {
        const repository = await Repository.findOne({ name: repoName })
          .populate("owner")
          .populate({ path: "issues", populate: "owner" });
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }
        res.status(200).json(repository);
        
    }
        catch (error) {
            console.error("Error fetching repository by id:", error.message);
            res.status(500).send("server error");
        }
};

export async function fetchRepositoriesForCurrentUser(req, res) {
    const userID=req.user;

    try{
        const repositories = await Repository.find({ owner: userID })
          .populate("owner")
          .populate({ path: "issues", populate: "owner" });
        res.status(200).json({message:"repositories fetched successfully", repositories});
    }
    catch (error) {
        console.error("❌ Error fetching repositories for current user:", error.message);
        console.error("Error details:", error);
        
        if (error.name === "MongoNetworkError" || error.name === "MongoTimeoutError") {
            return res.status(503).json({ 
                error: "Database connection failed. Please try again later.",
                details: error.message 
            });
        }
        
        res.status(500).json({ 
            error: "server error",
            details: error.message 
        });
    }
};

export async function updateRepositoryById(req, res) {
    const userID = req.user;
    const repoID = req.params.id;
    const { name, description, content, visibility } = req.body;

    try {
        const repository = await Repository.findOne({ _id: repoID, owner: userID });
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        if (name !== undefined) repository.name = name;
        if (description !== undefined) repository.description = description;
        if (content !== undefined) repository.content = content;
        if (visibility !== undefined) repository.visibility = Boolean(visibility);

        await repository.save();
        res.status(200).json({ message: "repository updated", repository });
    } catch (error) {
        console.error("Error updating repository:", error.message);
        res.status(500).json({ message: "server error" });
    }
};

export async function toggleVisibilityById(req, res) {
    const userID = req.user;
    const repoID = req.params.id;

    try {
        const repository = await Repository.findOne({ _id: repoID, owner: userID });
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        repository.visibility = !repository.visibility;
        await repository.save();
        res.status(200).json({ message: "repository visibility toggled", repository });
    } catch (error) {
        console.error("Error toggling visibility:", error.message);
        res.status(500).json({ message: "server error" });
    }
};

export async function deleteRepositoryById(req, res) {
    const userID = req.user;
    const repoID = req.params.id;

    try {
        const repository = await Repository.findOne({ _id: repoID, owner: userID }).populate("issues");
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        const issueIds = (repository.issues || []).map((i) => i._id || i);
        if (issueIds.length > 0) {
            await Issue.deleteMany({ _id: { $in: issueIds } });
        }

        await Repository.deleteOne({ _id: repoID });
        res.status(200).json({ message: "repository deleted successfully" });
    } catch (error) {
        console.error("Error deleting repository:", error.message);
        res.status(500).json({ message: "server error" });
    }
};
