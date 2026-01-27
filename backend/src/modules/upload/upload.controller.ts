import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Logger,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { SpacesService } from './spaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

interface UploadDesignDto {
  base64: string;
  placement: string;
  productId?: string;
  sessionId: string;
}

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(
    private uploadService: UploadService,
    private spacesService: SpacesService,
    private prisma: PrismaService,
  ) {}

  // Public endpoint - no auth required (for frontend customizer)
  // Now fetches from DO Spaces library folder
  @Get('public')
  async getPublicImages() {
    this.logger.log('[getPublicImages] Fetching library images from DO Spaces');
    try {
      const images = await this.spacesService.listLibraryImages();
      this.logger.log(`[getPublicImages] Found ${images.length} images`);
      return images;
    } catch (error) {
      this.logger.error(`[getPublicImages] Error: ${error.message}`);
      return [];
    }
  }

  // Protected endpoint - requires auth (for admin)
  // Now fetches from DO Spaces library folder
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllImages() {
    return this.spacesService.listLibraryImages();
  }

  // Upload to DO Spaces library folder (admin)
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.logger.log(`[uploadFile] Uploading to DO Spaces library: ${file.originalname}`);

    const result = await this.spacesService.uploadLibraryImage(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return {
      filename: result.filename,
      url: result.url,
      originalName: file.originalname,
      size: result.size,
      mimetype: file.mimetype,
    };
  }

  // Upload multiple files to DO Spaces library folder (admin)
  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const result = await this.spacesService.uploadLibraryImage(
          file.buffer,
          file.originalname,
          file.mimetype,
        );
        return {
          filename: result.filename,
          url: result.url,
          originalName: file.originalname,
          size: result.size,
          mimetype: file.mimetype,
        };
      }),
    );

    return results;
  }

  // Delete from DO Spaces library folder (admin)
  @Delete(':filename')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('filename') filename: string) {
    this.logger.log(`[deleteFile] Deleting from DO Spaces library: ${filename}`);
    await this.spacesService.deleteLibraryImage(filename);
    return { message: 'File deleted successfully' };
  }

  /**
   * Public endpoint to upload design images to DigitalOcean Spaces
   * Used by the frontend customizer to upload user artwork
   */
  @Post('design')
  async uploadDesignImage(@Body() body: UploadDesignDto) {
    this.logger.log(`[uploadDesignImage] Received request for placement: ${body.placement}, sessionId: ${body.sessionId}`);

    if (!body.base64 || !body.placement || !body.sessionId) {
      throw new BadRequestException('Missing required fields: base64, placement, sessionId');
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const folder = `designs/${body.sessionId}`;
      const filename = `${body.placement}-${timestamp}.png`;

      this.logger.log(`[uploadDesignImage] Uploading to Spaces: ${folder}/${filename}`);

      // Upload to DigitalOcean Spaces
      const url = await this.spacesService.uploadBase64Image(body.base64, folder, filename);

      this.logger.log(`[uploadDesignImage] Upload successful, URL: ${url}`);

      // Create DesignImage record in database
      const designImage = await this.prisma.designImage.create({
        data: {
          url,
          placement: body.placement,
          sessionId: body.sessionId,
          productId: body.productId || null,
          metadata: {
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      this.logger.log(`[uploadDesignImage] Created DesignImage record: ${designImage.id}`);

      return {
        id: designImage.id,
        url: designImage.url,
        placement: designImage.placement,
      };
    } catch (error) {
      this.logger.error(`[uploadDesignImage] Failed to upload design image: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload design image: ${error.message}`);
    }
  }

  /**
   * Get design images by session ID
   */
  @Get('design/session/:sessionId')
  async getDesignImagesBySession(@Param('sessionId') sessionId: string) {
    this.logger.log(`[getDesignImagesBySession] Fetching images for session: ${sessionId}`);

    const images = await this.prisma.designImage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    return images;
  }

  /**
   * Proxy endpoint to serve images from DigitalOcean Spaces
   * This is needed because the bucket has ACLs disabled and files are private
   * URL format: /upload/spaces/wearyourartmedia/designs/sessionId/filename.png
   */
  @Get('spaces/*')
  async proxySpacesImage(@Param() params: { '0': string }, @Res() res: Response) {
    const key = params['0'];
    this.logger.log(`[proxySpacesImage] Proxying image: ${key}`);

    if (!key) {
      throw new BadRequestException('No image path provided');
    }

    try {
      const { buffer, contentType } = await this.spacesService.getImage(key);

      // Set caching headers (cache for 1 year since images are immutable)
      res.set({
        'Content-Type': contentType,
        'Content-Length': buffer.length,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      });

      res.send(buffer);
    } catch (error) {
      this.logger.error(`[proxySpacesImage] Failed to fetch image: ${error.message}`);
      throw new NotFoundException('Image not found');
    }
  }
}
