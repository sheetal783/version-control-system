import fs from "fs";
import path from "path";
import { s3, S3_BUCKET } from "../config/aws-config.js";

const API_URL = process.env.API_URL || "http://localhost:5000";

export async function Push() {
  const repoPath = path.resolve(process.cwd(), ".apnagit");
  const commitsPath = path.join(repoPath, "commit");
  const remotePath = path.join(repoPath, "remote.json");

  // Read repo name from remote.json
  let repoName;
  if (fs.existsSync(remotePath)) {
    const remoteConfig = JSON.parse(fs.readFileSync(remotePath, "utf8"));
    repoName = remoteConfig.remote;
  }

  if (!repoName) {
    console.error(
      "❌ Error: No remote repository linked. Run \"node index.js remote <name>\" first."
    );
    return;
  }

  try {
    // 👉 if commits folder does not exist
    if (!fs.existsSync(commitsPath)) {
      console.log("⚠️ No commits found to push");
      return;
    }

    // 👉 read commit folders
    const commitDirs = await fs.promises.readdir(commitsPath);

    for (const commitId of commitDirs) {
      const commitPath = path.join(commitsPath, commitId);

      // 👉 check it's a directory
      const stat = await fs.promises.stat(commitPath);
      if (!stat.isDirectory()) continue;

      const files = await fs.promises.readdir(commitPath);
      const uploadedFiles = [];

      for (const file of files) {
        const filePath = path.join(commitPath, file);

        // 👉 ensure it's a file
        const fileStat = await fs.promises.stat(filePath);
        if (!fileStat.isFile()) continue;

        // 👉 read file content
        const fileContent = await fs.promises.readFile(filePath);

        // 👉 upload params
        const params = {
          Bucket: S3_BUCKET,
          Key: `commits/${commitId}/${file}`,
          Body: fileContent,
        };

        // ✅ upload to S3
        await s3.upload(params).promise();
        console.log(`⬆️ Uploaded: commits/${commitId}/${file}`);

        // Track non-metadata files
        if (file !== "commit.json") {
          uploadedFiles.push(file);
        }
      }

      // 👉 Also save commit data to MongoDB via Express API
      try {
        const commitJsonPath = path.join(commitPath, "commit.json");
        let message = "No message";
        let timestamp = new Date().toISOString();
        let author = "CLI User";

        if (fs.existsSync(commitJsonPath)) {
          const commitData = JSON.parse(
            await fs.promises.readFile(commitJsonPath, "utf8")
          );
          message = commitData.message || message;
          timestamp = commitData.timestamp || timestamp;
          author = commitData.author || author;
        }

        const response = await fetch(`${API_URL}/api/commits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commitId,
            repoName,
            message,
            author,
            timestamp,
            files: uploadedFiles,
          }),
        });

        if (response.ok) {
          console.log(`📦 Commit ${commitId.slice(0, 8)}... synced to database`);
        } else {
          console.warn(`⚠️ Failed to sync commit ${commitId.slice(0, 8)} to DB`);
        }
      } catch (dbErr) {
        // Don't fail the push if DB sync fails — S3 upload already succeeded
        console.warn(`⚠️ DB sync skipped for ${commitId.slice(0, 8)}: ${dbErr.message}`);
      }
    }

    console.log("✅ Push successful: All commits pushed to S3 🚀");
  } catch (err) {
    console.error("❌ Error during push:", err.message);
  }
}