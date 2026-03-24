// import fs from 'fs';
// import path from 'path';
// import { s3, S3_BUCKET } from '../config/aws-config.js';

// export async function Push() {
//     const repoPath = path.resolve(process.cwd(), '.apnagit');
//     const commitsPath = path.join(repoPath, 'commit');

//     try {
//         const commitDirs = await fs.promises.readdir(commitsPath);

//         for (const commitId of commitDirs) {
//             const commitPath = path.join(commitsPath, commitId);
//             const files = await fs.promises.readdir(commitPath);

//             for (const file of files) {
//                 const filePath = path.join(commitPath, file);
//                 const fileContent = await fs.promises.readFile(filePath);

//                 const params = {
//                     Bucket: S3_BUCKET,
//                     Key: `commits/${commitId}/${file}`,
//                     Body: fileContent
//                 };

//                 await s3.upload(params).promise();
//             }
//         }

//         console.log('✅ Push successful: All commits pushed to S3');

//     } catch (err) {
//         console.error('❌ Error during push:', err);
//     }
// }


import fs from "fs";
import path from "path";
import { s3, S3_BUCKET } from "../config/aws-config.js";

export async function Push() {
  const repoPath = path.resolve(process.cwd(), ".apnagit");
  const commitsPath = path.join(repoPath, "commit");

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

        // ✅ CORRECT upload call (no const error)
        await s3.upload(params).promise();

        console.log(`⬆️ Uploaded: commits/${commitId}/${file}`);
      }
    }

    console.log("✅ Push successful: All commits pushed to S3 🚀");
  } catch (err) {
    console.error("❌ Error during push:", err.message);
  }
}