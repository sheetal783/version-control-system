import fs from 'fs';
import path from 'path';
const { s3, S3_BUCKET } = await import('../config/aws-config.js');

async function Pull() {
    const repoPath = path.resolve(process.cwd(), '.apnagit');
    const commitsPath = path.join(repoPath, 'commit');

    try {
        const data = await s3.listObjectsV2({ Bucket: S3_BUCKET, Prefix: 'commits/' }).promise();
        const objects = data.Contents || [];

        for (const obj of objects) {
            const key = obj.Key;
            const commitDir = path.join(commitsPath, path.dirname(key).split('/').pop());
            await fs.promises.mkdir(commitDir, { recursive: true });
            const params = { Bucket: S3_BUCKET, Key: key };
            const fileContent = await s3.getObject(params).promise();
            await fs.promises.writeFile(path.join(repoPath, key.replace(/^commits\//, 'commit/')), fileContent.Body);
        }
    }

    catch (err) {
        console.error('unable to pull changes:', err);

    }

}

export { Pull };
