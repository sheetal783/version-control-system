import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Repository from './Models/repoModel.js';

dotenv.config();

async function listRepos() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        const repos = await Repository.find({}, 'name');
        console.log('Repositories in DB:', repos.map(r => r.name));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listRepos();
