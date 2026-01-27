import { useState, useRef, useEffect } from 'react';
import { uploadApi, MediaImage } from '../api/upload';
import { Upload, Image, X } from 'lucide-react';

interface MultiImagePickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
}

export default function MultiImagePicker({
  value,
  onChange,
  label = 'Images',
  max = 10,
}: MultiImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState<MediaImage[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedInLibrary, setSelectedInLibrary] = useState<string[]>([]);
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
      setSelectedInLibrary([...value]);
    }
  }, [showLibrary]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = max - value.length;
    if (remainingSlots <= 0) return;

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setIsUploading(true);
    try {
      if (filesToUpload.length === 1) {
        const response = await uploadApi.uploadFile(filesToUpload[0]);
        onChange([...value, response.url]);
      } else {
        const responses = await uploadApi.uploadMultiple(filesToUpload);
        onChange([...value, ...responses.map((r) => r.url)]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleLibrarySelection = (url: string) => {
    if (selectedInLibrary.includes(url)) {
      setSelectedInLibrary(selectedInLibrary.filter((u) => u !== url));
    } else {
      if (selectedInLibrary.length < max) {
        setSelectedInLibrary([...selectedInLibrary, url]);
      }
    }
  };

  const confirmLibrarySelection = () => {
    onChange(selectedInLibrary);
    setShowLibrary(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return;
    const newImages = [...value];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} ({value.length}/{max})
      </label>

      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div key={url + index} className="relative group">
            <img
              src={uploadApi.getFullUrl(url)}
              alt={`Image ${index + 1}`}
              className="h-24 w-24 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
            {value.length > 1 && (
              <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="px-2 py-0.5 bg-black bg-opacity-60 text-white text-xs rounded hover:bg-opacity-80"
                  >
                    ←
                  </button>
                )}
                {index < value.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="px-2 py-0.5 bg-black bg-opacity-60 text-white text-xs rounded hover:bg-opacity-80"
                  >
                    →
                  </button>
                )}
              </div>
            )}
            {index === 0 && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded">
                Main
              </span>
            )}
          </div>
        ))}

        {value.length < max && (
          <>
            <label className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleUpload}
                className="hidden"
                disabled={isUploading}
                multiple
              />
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="mt-1 text-xs text-gray-500">Upload</span>
                </>
              )}
            </label>

            <button
              type="button"
              onClick={() => setShowLibrary(true)}
              className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
            >
              <Image className="h-6 w-6 text-gray-400" />
              <span className="mt-1 text-xs text-gray-500">Library</span>
            </button>
          </>
        )}
      </div>

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Select from Media Library ({selectedInLibrary.length}/{max})
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
                  {libraryImages.map((image) => {
                    const isSelected = selectedInLibrary.includes(image.url);
                    const selectionIndex = selectedInLibrary.indexOf(image.url);

                    return (
                      <button
                        key={image.filename}
                        type="button"
                        onClick={() => toggleLibrarySelection(image.url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          isSelected
                            ? 'border-primary-500'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={uploadApi.getFullUrl(image.url)}
                          alt={image.filename}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                              {selectionIndex + 1}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t">
              <p className="text-sm text-gray-500">
                {selectedInLibrary.length} image{selectedInLibrary.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLibrary(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLibrarySelection}
                  className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
