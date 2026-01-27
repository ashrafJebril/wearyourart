import { Injectable, BadRequestException } from '@nestjs/common';
import { unlink, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class UploadService {
  private uploadsDir = join(process.cwd(), 'uploads');

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  async getAllImages(): Promise<
    {
      filename: string;
      url: string;
      size: number;
      createdAt: Date;
    }[]
  > {
    console.log('[UploadService] getAllImages called');
    console.log('[UploadService] uploadsDir:', this.uploadsDir);
    console.log('[UploadService] Directory exists:', existsSync(this.uploadsDir));

    if (!existsSync(this.uploadsDir)) {
      console.log('[UploadService] Directory does not exist, returning empty array');
      return [];
    }

    const files = await readdir(this.uploadsDir);
    console.log('[UploadService] Files found in directory:', files);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const imageFiles = files.filter((file: string) =>
      imageExtensions.some((ext) => file.toLowerCase().endsWith(ext)),
    );

    const imagesWithStats = await Promise.all(
      imageFiles.map(async (filename: string) => {
        const filepath = join(this.uploadsDir, filename);
        const fileStat = await stat(filepath);
        return {
          filename,
          url: this.getFileUrl(filename),
          size: fileStat.size,
          createdAt: fileStat.birthtime,
        };
      }),
    );

    // Sort by creation date, newest first
    return imagesWithStats.sort(
      (a: { createdAt: Date }, b: { createdAt: Date }) =>
        b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async deleteFile(filename: string): Promise<void> {
    const filepath = join(this.uploadsDir, filename);

    if (!existsSync(filepath)) {
      throw new BadRequestException('File not found');
    }

    await unlink(filepath);
  }

  validateFile(file: Express.Multer.File): boolean {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only images are allowed.',
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    return true;
  }
}
