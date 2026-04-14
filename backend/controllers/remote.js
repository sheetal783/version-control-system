import fs from 'fs/promises';
import path from 'path';

export async function setRemote(repoName) {
    if (!process.cwd().endsWith('backend')) {
        console.error("❌ Error: ApnaGit commands must be run from inside the 'backend' folder.");
        return;
    }

    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const remoteFilePath = path.join(repoPath, 'remote.json');

    try {
        // Ensure .apnagit directory exists
        await fs.mkdir(repoPath, { recursive: true });

        const config = { remote: repoName };
        await fs.writeFile(remoteFilePath, JSON.stringify(config, null, 2));
        
        console.log(`✅ Remote repository set to: ${repoName}`);
        console.log(`📝 Config saved to: .apnagit/remote.json`);
    } catch (error) {
        console.error("❌ Error setting remote repository:", error.message);
    }
}
