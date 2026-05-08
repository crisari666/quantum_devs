import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { extname, join } from 'path';
import type { FileFilterCallback } from 'multer';
import { diskStorage } from 'multer';

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

export const PROJECT_IMAGES_DIR = join(process.cwd(), 'uploads', 'projects');

function safeImageExt(originalname: string): string {
  const raw = extname(originalname).toLowerCase();
  return ALLOWED_EXT.has(raw) ? raw : '.jpg';
}

export function isAllowedImageMime(mimetype: string): boolean {
  return /^(image\/(jpeg|png|gif|webp))$/i.test(mimetype);
}

export const projectImagesMulterOptions = {
  storage: diskStorage({
    destination: PROJECT_IMAGES_DIR,
    filename: (_req, file, cb) => {
      cb(null, `${randomUUID()}${safeImageExt(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    cb(null, isAllowedImageMime(file.mimetype));
  },
};
