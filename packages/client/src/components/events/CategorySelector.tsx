import { IconTag } from '@tabler/icons-react';
import type { EventCategory } from '../../types/events';

interface CategorySelectorProps {
    categories: EventCategory[];
    selectedCategoryId: number | undefined;
    onCategoryChange: (categoryId: number | undefined) => void;
    disabled?: boolean;
    className?: string;
    showDescription?: boolean;
    required?: boolean;
    label?: string;
}

export function CategorySelector({
    categories,
    selectedCategoryId,
    onCategoryChange,
    disabled = false,
    className = '',
    showDescription = false,
    required = false,
    label = 'Category',
}: CategorySelectorProps) {
    const selectedCategory = categories.find(
        (c) => c.id === selectedCategoryId
    );

    return (
        <div className={className}>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
                <div className='flex items-center gap-2'>
                    <IconTag size={16} />
                    {label}
                    {required && <span className='text-red-500'>*</span>}
                </div>
            </label>
            <select
                value={selectedCategoryId || ''}
                onChange={(e) =>
                    onCategoryChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                    )
                }
                className='focus:ring-primary-500 focus:border-primary-500 focus:ring-0.5 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none disabled:cursor-not-allowed disabled:bg-slate-50'
                disabled={disabled}
                required={required}
            >
                <option value=''>
                    {required ? 'Select a category' : 'No category'}
                </option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
            {showDescription && selectedCategory?.description && (
                <p className='mt-1 text-xs text-slate-500'>
                    {selectedCategory.description}
                </p>
            )}
        </div>
    );
}

export default CategorySelector;
