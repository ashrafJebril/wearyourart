import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { subcategoriesApi } from '../api/subcategories';
import { categoriesApi } from '../api/categories';
import { Category } from '../types';
import { ArrowLeft } from 'lucide-react';
import ImagePicker from '../components/ImagePicker';

interface SubcategoryFormData {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  categoryId: string;
}

export default function SubcategoryForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [image, setImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubcategoryFormData>({
    defaultValues: {
      categoryId: searchParams.get('categoryId') || '',
    },
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchSubcategory();
    } else {
      setIsFetching(false);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategory = async () => {
    try {
      const subcategory = await subcategoriesApi.getOne(id!);
      reset({
        name: subcategory.name,
        nameAr: subcategory.nameAr || '',
        description: subcategory.description || '',
        descriptionAr: subcategory.descriptionAr || '',
        categoryId: subcategory.categoryId,
      });
      setImage(subcategory.image || null);
    } catch (error) {
      console.error('Error fetching subcategory:', error);
      setError('Failed to load subcategory');
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: SubcategoryFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...data,
        image: image || undefined,
      };

      if (isEdit) {
        await subcategoriesApi.update(id!, payload);
      } else {
        await subcategoriesApi.create(payload);
      }

      navigate('/subcategories');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save subcategory');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/subcategories')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Subcategories
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Subcategory' : 'New Subcategory'}
        </h1>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <ImagePicker
            value={image}
            onChange={setImage}
            label="Subcategory Image"
          />

          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category *
            </label>
            <select
              id="categoryId"
              {...register('categoryId', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* English Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name (English) *
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Arabic Name */}
          <div>
            <label
              htmlFor="nameAr"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name (Arabic) - الاسم بالعربية
            </label>
            <input
              id="nameAr"
              type="text"
              dir="rtl"
              {...register('nameAr')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            />
          </div>

          {/* English Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (English)
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Arabic Description */}
          <div>
            <label
              htmlFor="descriptionAr"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (Arabic) - الوصف بالعربية
            </label>
            <textarea
              id="descriptionAr"
              rows={3}
              dir="rtl"
              {...register('descriptionAr')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              style={{ fontFamily: 'Cairo, sans-serif' }}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/subcategories')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isLoading
                ? 'Saving...'
                : isEdit
                ? 'Update Subcategory'
                : 'Create Subcategory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
