import fs from 'fs/promises';
import path from 'path';

export async function deleteFile(fileUrl: string | null) {
    if (!fileUrl) return;

    const relativePath = fileUrl.replace('/uploads/', '');
    const filePath = path.resolve(__dirname, '../../uploads', relativePath);

    try {
        await fs.unlink(filePath);
        console.log('Deleted file:', filePath);
    } catch (err) {
        console.warn('Failed to delete file:', filePath, err);
    }
}
