import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export type FileInput = {
    buffer: Buffer;
    filename: string;
    mimetype: string;
};

export async function handleFileUpload(
    file: FileInput | null,
    options?: {
        allowedTypes?: string[];
        maxSizeInMB?: number;
        subFolder?: string;
        oldFileUrl?: string | null;
    }
): Promise<string | null> {
    if (!file) return null;

    const {
        allowedTypes = ['image/', 'video/'],
        maxSizeInMB = 50,
        subFolder = '',
        oldFileUrl,
    } = options || {};

    const uploadDir = path.resolve(__dirname, '../../uploads', subFolder);

    if (!allowedTypes.some((type) => file.mimetype.startsWith(type))) {
        throw new Error('Invalid file type');
    }

    if (file.buffer.length > maxSizeInMB * 1024 * 1024) {
        throw new Error(`File too large. Max size is ${maxSizeInMB}MB`);
    }

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (oldFileUrl) {
        const filename = oldFileUrl.replace('/uploads/', '');
        const oldFilePath = path.join(
            path.resolve(__dirname, '../../uploads'),
            filename
        );
        if (fs.existsSync(oldFilePath)) {
            await fs.promises.unlink(oldFilePath).catch(console.warn);
        }
    }

    const ext = path.extname(file.filename);
    const uniqueName = `${Date.now()}-${randomUUID()}${ext}`;
    const finalPath = path.join(uploadDir, uniqueName);

    await fs.promises.writeFile(finalPath, file.buffer);

    return `/uploads/${subFolder ? `${subFolder}/` : ''}${uniqueName}`;
}
