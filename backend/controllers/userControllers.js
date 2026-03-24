import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";

dotenv.config();

const uri = process.env.MONGODB_URL; // Using the same as index.js
const DB_NAME = process.env.MONGODB_DB_NAME || "gitHubClone";

let client;

async function connectClient() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
}

export async function getAllUsers(req, res) {
    try {
        await connectClient();
        const db = client.db(DB_NAME);
        const userCollection = db.collection("users");
        const users = await userCollection.find({}).toArray();
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error during user fetch:", error.message);
        res.status(500).send("server error");
    }
};

export const signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        await connectClient();
        const db = client.db(DB_NAME);
        const userCollection = db.collection("users");
        const user = await userCollection.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = {
            username,
            email,
            password: hashedPassword,
            repositories: [],
            followedUsers: [],
            starredRepos: [],

        }
        const result = await userCollection.insertOne(newUser);

        const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
        res.status(201).json({ message: "User created successfully", token });
    }
    catch (error) {
        console.error("Error during user signup:", error.message);
        res.status(500).send("server error");
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        await connectClient();
        const db = client.db(DB_NAME);
        const userCollection = db.collection("users");
        const user = await userCollection.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "invalid credentials" });
        }
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(400).json({ message: "invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
        res.status(200).json({ message: "User logged in successfully", token });
    }
    catch (error) {
        console.error("Error during user login:", error.message);
        res.status(500).send("server error");
    }
}

export async function getUserProfile(req, res) {
    const currentID = req.user || req.params.id;
 try {
        if (!ObjectId.isValid(currentID)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        await connectClient();
        const db = client.db(DB_NAME);
        const userCollection = db.collection("users");
       
        const user=await userCollection.findOne({ _id: new ObjectId(currentID) });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
          res.send(user);
    }
    catch (error) {
        console.error("Error during user login:", error.message);
        res.status(500).send("server error");
    }



  
}

export async function updateUserProfile(req, res) {
const currentID = req.user || req.params.id;
const { username, email, password } = req.body;
try {
     if (!ObjectId.isValid(currentID)) {
        return res.status(400).json({ message: "Invalid user id" });
     }
     await connectClient();
        const db = client.db(DB_NAME);
        const userCollection = db.collection("users");


    const updatedFields = {};
    if (username !== undefined) updatedFields.username = username;
    if (email !== undefined) updatedFields.email = email;
    if(password){
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    updatedFields.password=hashedPassword;
    }
     const result = await userCollection.findOneAndUpdate({ _id: new ObjectId(currentID) }, 
     { $set: updatedFields },
     { returnDocument: "after" }
    );
        const updatedUser = result?.value || result;
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "user profile updated", user: updatedUser });
}
catch (error) {
  console.error("Error during user profile update:", error.message);
        res.status(500).send("server error");
}
}

export async function deleteUserProfile(req, res) {
    const currentID = req.user || req.params.id;

    try {
        if (!ObjectId.isValid(currentID)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        await connectClient();
        const db = client.db(DB_NAME);
        const userCollection = db.collection("users");

        const result=await userCollection.deleteOne({ _id: new ObjectId(currentID) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User profile deleted successfully" });
    }catch (error) {
        console.error("Error during user profile deletion:", error.message);
        res.status(500).send("server error");
    }
}

export async function logout(req, res) {
    res.send("logout");
}

export async function followUser(req, res) {
    res.send("follow user");
}

export async function unfollowUser(req, res) {
    res.send("unfollow user");
}

export async function starRepo(req, res) {
    res.send("star repo");
}

export const unstarRepo = (req, res) => {
    res.send("unstar repo");
}