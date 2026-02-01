import { useState, useRef, useEffect } from 'react';
import { uploadApi, MediaImage } from '../api/upload';
import { ProductColor, ColorImages } from '../types';
import { Upload, Image, X } from 'lucide-react';

interface ColorImagePickerProps {
  colors: ProductColor[];
  colorImages: ColorImages;
  onChange: (colorImages: ColorImages) => void;
  max?: number;
}

export default function ColorImagePicker({
  colors,
  colorImages,
  onChange,
  max = 10,
}: ColorImagePickerProps) {
  const [activeColorHex, setActiveColorHex] = useState<string | null>(
    colors.length > 0 ? colors[0].hex : null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState<MediaImage[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedInLibrary, setSelectedInLibrary] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update active color when colors change
  useEffect(() => {
    if (colors.length > 0 && (!activeColorHex || !colors.find(c => c.hex === activeColorHex))) {
      setActiveColorHex(colors[0].hex);
    } else if (colors.length === 0) {
      setActiveColorHex(null);
    }
  }, [colors]);

  const currentImages = activeColorHex ? (colorImages[activeColorHex] || []) : [];

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
      setSelectedInLibrary([...currentImages]);
    }
  }, [showLibrary]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeColorHex) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = max - currentImages.length;
    if (remainingSlots <= 0) return;

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setIsUploading(true);
    try {
      let newUrls: string[] = [];
      if (filesToUpload.length === 1) {
        const response = await uploadApi.uploadFile(filesToUpload[0]);
        newUrls = [response.url];
      } else {
        const responses = await uploadApi.uploadMultiple(filesToUpload);
        newUrls = responses.map((r) => r.url);
      }

      onChange({
        ...colorImages,
        [activeColorHex]: [...currentImages, ...newUrls],
      });
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
    if (!activeColorHex) return;
    onChange({
      ...colorImages,
      [activeColorHex]: selectedInLibrary,
    });
    setShowLibrary(false);
  };

  const removeImage = (index: number) => {
    if (!activeColorHex) return;
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    onChange({
      ...colorImages,
      [activeColorHex]: newImages,
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (!activeColorHex) return;
    if (toIndex < 0 || toIndex >= currentImages.length) return;
    const newImages = [...currentImages];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange({
      ...colorImages,
      [activeColorHex]: newImages,
    });
  };

  if (colors.length === 0) {
    return null;
  }

  const activeColor = colors.find(c => c.hex === activeColorHex);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Images for Each Color
      </label>
      <p className="text-sm text-gray-500 mb-3">
        Upload images specific to each color. When a customer selects a color, these images will be shown.
      </p>

      {/* Color Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {colors.map((color) => {
          const imageCount = colorImages[color.hex]?.length || 0;
          const isActive = activeColorHex === color.hex;

          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => setActiveColorHex(color.hex)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                isActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="w-5 h-5 rounded-full border border-gray-300"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-sm font-medium">{color.name}</span>
              {imageCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                  {imageCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Color Images Section */}
      {activeColor && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: activeColor.hex }}
            />
            <span className="font-medium text-gray-900">{activeColor.name}</span>
            <span className="text-sm text-gray-500">
              ({currentImages.length}/{max} images)
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {currentImages.map((url, index) => (
              <div key={url + index} className="relative group">
                <img
                  src={uploadApi.getFullUrl(url)}
                  alt={`${activeColor.name} image ${index + 1}`}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                {currentImages.length > 1 && (
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
                    {index < currentImages.length - 1 && (
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
              </div>
            ))}

            {currentImages.length < max && (
              <>
                <label className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors bg-white">
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
                  className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors bg-white"
                >
                  <Image className="h-6 w-6 text-gray-400" />
                  <span className="mt-1 text-xs text-gray-500">Library</span>
                </button>
              </>
            )}
          </div>

          {currentImages.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No images for this color. Default product images will be used.
            </p>
          )}
        </div>
      )}

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select images for
                </h3>
                <div
                  className="w-5 h-5 rounded-full border border-gray-300"
                  style={{ backgroundColor: activeColor?.hex }}
                />
                <span className="font-semibold text-gray-900">
                  {activeColor?.name}
                </span>
                <span className="text-gray-500">
                  ({selectedInLibrary.length}/{max})
                </span>
              </div>
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
