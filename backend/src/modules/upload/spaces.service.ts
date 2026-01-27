import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export interface ScreenshotUrls {
  front: string;
  back: string;
  left: string;
  right: string;
}

@Injectable()
export class SpacesService {
  private readonly logger = new Logger(SpacesService.name);
  private s3Client: S3Client;
  private bucket: string;
  private cdnUrl: string;
  private baseFolder: string;
  private backendUrl: string;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.DO_SPACES_ENDPOINT,
      region: 'fra1',
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY || '',
        secretAccessKey: process.env.DO_SPACES_SECRET || '',
      },
      forcePathStyle: false,
    });

    this.bucket = process.env.DO_SPACES_BUCKET || 'wearyourart2';
    this.cdnUrl =
      process.env.DO_SPACES_CDN_URL ||
      'https://wearyourart2.fra1.cdn.digitaloceanspaces.com';
    this.baseFolder = process.env.DO_SPACES_BASE_FOLDER || 'wearyourartmedia';
    // Backend URL for proxy - defaults to localhost for development
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  }

  /**
   * Upload a base64 encoded image to DigitalOcean Spaces
   */
  async uploadBase64Image(
    base64Data: string,
    folder: string,
    filename: string,
  ): Promise<string> {
    try {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Content, 'base64');

      // Determine content type from the data URL or default to PNG
      const contentType = base64Data.includes('data:image/jpeg')
        ? 'image/jpeg'
        : 'image/png';

      // Construct the key (path) for the file - include base folder
      const key = `${this.baseFolder}/${folder}/${filename}`;

      // Upload to S3/Spaces
      // Note: ACL is not used - bucket must have "File Listing" set to "Public" in DO Spaces settings
      // or configure CORS/CDN settings for public access
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'max-age=31536000', // Cache for 1 year
      });

      this.logger.log(`Uploading to: ${this.bucket}/${key}`);
      await this.s3Client.send(command);
      this.logger.log(`Upload successful: ${key}`);

      // Return the proxy URL (backend serves the image since Spaces has ACLs disabled)
      const url = `${this.backendUrl}/upload/spaces/${key}`;
      this.logger.log(`Uploaded image, proxy URL: ${url}`);

      return url;
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error.message}`, error.stack);
      throw new Error(`Failed to upload image to Spaces: ${error.message}`);
    }
  }

  /**
   * Upload all 4 screenshots for an order
   */
  async uploadOrderScreenshots(
    orderNumber: string,
    itemIndex: number,
    screenshots: { front: string; back: string; left: string; right: string },
  ): Promise<ScreenshotUrls> {
    const folder = `orders/${orderNumber}/item-${itemIndex}`;
    const timestamp = Date.now();

    const [frontUrl, backUrl, leftUrl, rightUrl] = await Promise.all([
      this.uploadBase64Image(
        screenshots.front,
        folder,
        `front-${timestamp}.png`,
      ),
      this.uploadBase64Image(
        screenshots.back,
        folder,
        `back-${timestamp}.png`,
      ),
      this.uploadBase64Image(
        screenshots.left,
        folder,
        `left-${timestamp}.png`,
      ),
      this.uploadBase64Image(
        screenshots.right,
        folder,
        `right-${timestamp}.png`,
      ),
    ]);

    return {
      front: frontUrl,
      back: backUrl,
      left: leftUrl,
      right: rightUrl,
    };
  }

  /**
   * Upload a single design image (user's uploaded artwork)
   */
  async uploadDesignImage(
    orderNumber: string,
    itemIndex: number,
    placement: string,
    base64Data: string,
  ): Promise<string> {
    const folder = `orders/${orderNumber}/item-${itemIndex}/designs`;
    const timestamp = Date.now();
    const filename = `${placement}-design-${timestamp}.png`;

    return this.uploadBase64Image(base64Data, folder, filename);
  }

  /**
   * Get an image from DigitalOcean Spaces (for proxy endpoint)
   * Returns the image buffer and content type
   */
  async getImage(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      this.logger.log(`Fetching image from Spaces: ${key}`);

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      // Convert stream to buffer
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      const buffer = Buffer.concat(chunks);
      const contentType = response.ContentType || 'image/png';

      this.logger.log(`Successfully fetched image: ${key} (${buffer.length} bytes)`);

      return { buffer, contentType };
    } catch (error) {
      this.logger.error(`Failed to fetch image ${key}: ${error.message}`, error.stack);
      throw new Error(`Failed to fetch image: ${error.message}`);
    }
  }

  /**
   * Get the base folder used for all uploads
   */
  getBaseFolder(): string {
    return this.baseFolder;
  }

  /**
   * Upload a library image (admin uploads) to the library folder
   */
  async uploadLibraryImage(
    buffer: Buffer,
    originalFilename: string,
    contentType: string,
  ): Promise<{ filename: string; url: string; size: number }> {
    try {
      const timestamp = Date.now();
      const extension = originalFilename.split('.').pop() || 'png';
      const filename = `${timestamp}-${originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const key = `${this.baseFolder}/library/${filename}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'max-age=31536000',
      });

      this.logger.log(`Uploading library image to: ${this.bucket}/${key}`);
      await this.s3Client.send(command);
      this.logger.log(`Library image upload successful: ${key}`);

      const url = `${this.backendUrl}/upload/spaces/${key}`;

      return {
        filename,
        url,
        size: buffer.length,
      };
    } catch (error) {
      this.logger.error(`Failed to upload library image: ${error.message}`, error.stack);
      throw new Error(`Failed to upload library image: ${error.message}`);
    }
  }

  /**
   * List all images in the library folder
   */
  async listLibraryImages(): Promise<
    { filename: string; url: string; size: number; lastModified: Date }[]
  > {
    try {
      const prefix = `${this.baseFolder}/library/`;

      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      this.logger.log(`Listing library images with prefix: ${prefix}`);
      const response = await this.s3Client.send(command);

      if (!response.Contents) {
        return [];
      }

      const images = response.Contents.filter(
        (obj) => obj.Key && obj.Key !== prefix,
      ).map((obj) => {
        const filename = obj.Key!.replace(prefix, '');
        return {
          filename,
          url: `${this.backendUrl}/upload/spaces/${obj.Key}`,
          size: obj.Size || 0,
          lastModified: obj.LastModified || new Date(),
        };
      });

      // Sort by last modified, newest first
      images.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

      this.logger.log(`Found ${images.length} library images`);
      return images;
    } catch (error) {
      this.logger.error(`Failed to list library images: ${error.message}`, error.stack);
      throw new Error(`Failed to list library images: ${error.message}`);
    }
  }

  /**
   * Delete a library image
   */
  async deleteLibraryImage(filename: string): Promise<void> {
    try {
      const key = `${this.baseFolder}/library/${filename}`;

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      this.logger.log(`Deleting library image: ${key}`);
      await this.s3Client.send(command);
      this.logger.log(`Library image deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete library image: ${error.message}`, error.stack);
      throw new Error(`Failed to delete library image: ${error.message}`);
    }
  }
}
