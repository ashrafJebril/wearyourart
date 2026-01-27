import { useState, useRef, useEffect } from 'react';
import { uploadApi, MediaImage } from '../api/upload';
import { Upload, Image, X, Check } from 'lucide-react';

interface ImagePickerProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export default function ImagePicker({ value, onChange, label = 'Image' }: ImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState<MediaImage[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLibraryImages = async () => {
    setIsLoadingLibrary(true);
    try {
      const images = await uploadApi.getAll();
      setLibraryImages(images);
    } catch (error) {
      console.error('Error fetching library images:', error);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (showLibrary) {
      fetchLibraryImages();
    }
  }, [showLibrary]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await uploadApi.uploadFile(file);
      onChange(response.url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectFromLibrary = (url: string) => {
    onChange(url);
    setShowLibrary(false);
  };

  const removeImage = () => {
    onChange(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={uploadApi.getFullUrl(value)}
            alt="Selected"
            className="h-32 w-32 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <label className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Upload</span>
              </>
            )}
          </label>

          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
          >
            <Image className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">Library</span>
          </button>
        </div>
      )}

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Select from Media Library
              </h3>
              <button
                onClick={() => setShowLibrary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingLibrary ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : libraryImages.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No images in library
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload some images first to select from the library.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {libraryImages.map((image) => (
                    <button
                      key={image.filename}
                      type="button"
                      onClick={() => handleSelectFromLibrary(image.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        value === image.url
                          ? 'border-primary-500'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={uploadApi.getFullUrl(image.url)}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                      {value === image.url && (
                        <div className="absolute inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center">
                          <div className="bg-primary-500 text-white rounded-full p-1">
                            <Check size={16} />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
