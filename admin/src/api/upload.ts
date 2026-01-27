import client from './client';

interface UploadResponse {
  filename: string;
  url: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface MediaImage {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

export const uploadApi = {
  getAll: async (): Promise<MediaImage[]> => {
    const response = await client.get<MediaImage[]>('/upload');
    return response.data;
  },

  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadMultiple: async (files: File[]): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await client.post<UploadResponse[]>(
      '/upload/multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteFile: async (filename: string): Promise<void> => {
    await client.delete(`/upload/${filename}`);
  },

  getFullUrl: (url: string): string => {
    if (url.startsWith('http')) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return `${baseUrl}${url}`;
  },
};
