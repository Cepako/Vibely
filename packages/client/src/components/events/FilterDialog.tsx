import { useEffect, useState } from 'react';
import { IconX, IconCheck, IconSearch } from '@tabler/icons-react';
import { Dialog } from '../ui/Dialog';
import type { EventCategory } from '../../types/events';

interface FilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    categories: EventCategory[];
    selectedCategories: number[];
    onCategoriesChange: (categoryIds: number[]) => void;
    onClearAll: () => void;
}

export default function FilterDialog({
    isOpen,
    onClose,
    categories,
    selectedCategories,
    onCategoriesChange,
    onClearAll,
}: FilterDialogProps) {
    const [tempSelectedCategories, setTempSelectedCategories] =
        useState<number[]>(selectedCategories);
    const [categorySearch, setCategorySearch] = useState('');

    const toggleCategory = (categoryId: number) => {
        if (tempSelectedCategories.includes(categoryId)) {
            setTempSelectedCategories(
                tempSelectedCategories.filter((id) => id !== categoryId)
            );
        } else {
            setTempSelectedCategories([...tempSelectedCategories, categoryId]);
        }
    };

    const handleApply = () => {
        onCategoriesChange(tempSelectedCategories);
        onClose();
    };

    const handleClearAll = () => {
        setTempSelectedCategories([]);
        onCategoriesChange([]);
        onClearAll();
        onClose();
    };

    const handleCancel = () => {
        setTempSelectedCategories(selectedCategories);
        setCategorySearch('');
        onClose();
    };

    const filteredCategories = categories.filter(
        (category) =>
            category.name
                .toLowerCase()
                .includes(categorySearch.toLowerCase()) ||
            category.description
                ?.toLowerCase()
                .includes(categorySearch.toLowerCase())
    );

    useEffect(() => {
        setTempSelectedCategories(selectedCategories);
    }, [selectedCategories]);

    return (
        <Dialog isOpen={isOpen} onClose={handleCancel} size='md'>
            <div className='flex max-h-[80vh] w-full max-w-md flex-col rounded-lg bg-white'>
                <div className='flex items-center justify-between border-b border-slate-200 p-6'>
                    <h2 className='text-xl font-semibold text-slate-900'>
                        Filter Events
                    </h2>
                    <button
                        onClick={handleCancel}
                        className='cursor-pointer text-slate-400 hover:text-slate-600'
                    >
                        <IconX size={24} />
                    </button>
                </div>

                <div className='flex-1 overflow-y-auto p-6'>
                    <div className='space-y-4'>
                        <div>
                            <div className='mb-3 flex items-center justify-between'>
                                <h3 className='text-sm font-medium text-slate-700'>
                                    Categories
                                </h3>
                                {tempSelectedCategories.length > 0 && (
                                    <span className='text-xs text-slate-500'>
                                        {tempSelectedCategories.length} selected
                                    </span>
                                )}
                            </div>

                            <div className='relative mb-3'>
                                <IconSearch
                                    size={16}
                                    className='absolute top-1/2 left-3 -translate-y-1/2 transform text-slate-400'
                                />
                                <input
                                    type='text'
                                    placeholder='Search categories...'
                                    value={categorySearch}
                                    onChange={(e) =>
                                        setCategorySearch(e.target.value)
                                    }
                                    className='focus:ring-primary-500 w-full rounded-lg border border-slate-300 py-2 pr-4 pl-9 text-sm focus:ring-1 focus:outline-none'
                                />
                                {categorySearch && (
                                    <button
                                        onClick={() => setCategorySearch('')}
                                        className='absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600'
                                    >
                                        <IconX size={16} />
                                    </button>
                                )}
                            </div>

                            <div className='max-h-60 space-y-2 overflow-y-auto'>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map((category) => (
                                        <div
                                            key={category.id}
                                            className='flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50'
                                            onClick={() =>
                                                toggleCategory(category.id)
                                            }
                                        >
                                            <div
                                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border ${
                                                    tempSelectedCategories.includes(
                                                        category.id
                                                    )
                                                        ? 'bg-primary-500 border-primary-500 text-white'
                                                        : 'border-slate-300'
                                                }`}
                                            >
                                                {tempSelectedCategories.includes(
                                                    category.id
                                                ) && <IconCheck size={14} />}
                                            </div>
                                            <div className='min-w-0 flex-1'>
                                                <div className='font-medium text-slate-900'>
                                                    {category.name}
                                                </div>
                                                {category.description && (
                                                    <div className='mt-1 text-sm text-slate-500'>
                                                        {category.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='py-8 text-center text-slate-500'>
                                        <div className='text-sm'>
                                            No categories found
                                        </div>
                                        <div className='mt-1 text-xs'>
                                            Try adjusting your search terms
                                        </div>
                                    </div>
                                )}
                            </div>

                            {categorySearch && (
                                <div className='mt-2 text-xs text-slate-500'>
                                    Showing {filteredCategories.length} of{' '}
                                    {categories.length} categories
                                </div>
                            )}
                        </div>

                        {/* Future filter sections can be added here */}
                        {/* Date Range, Location, etc. */}
                    </div>
                </div>

                <div className='flex items-center justify-between border-t border-slate-200 bg-slate-50 p-6'>
                    <button
                        onClick={handleClearAll}
                        className='cursor-pointer text-sm text-slate-600 hover:text-slate-800'
                    >
                        Clear All
                    </button>
                    <div className='flex gap-3'>
                        <button
                            onClick={handleCancel}
                            className='cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className='bg-primary-500 border-primary-500 hover:bg-primary-600 cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium text-white'
                        >
                            Apply Filters
                            {tempSelectedCategories.length > 0 && (
                                <span className='ml-1'>
                                    ({tempSelectedCategories.length})
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
