import { useEffect, useMemo, useState } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { Dialog, useDialog } from '../ui/Dialog';
import { useInterests } from '../hooks/useInterests';
import Tooltip from '../ui/Tooltip';

export type InterestOption = {
    id: number;
    name: string;
    description?: string;
};

interface InterestsDialogSelectorProps {
    selectedIds?: number[];
    onChange: (ids: number[]) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export function InterestsDialogSelector({
    selectedIds = [],
    onChange,
    placeholder = 'Select interests',
    disabled = false,
    className = '',
}: InterestsDialogSelectorProps) {
    const { isOpen, openDialog, closeDialog } = useDialog(false);
    const { data: options = [], isLoading } = useInterests();
    const [local, setLocal] = useState<number[]>(selectedIds);
    const [query, setQuery] = useState('');

    useEffect(() => setLocal(selectedIds), [selectedIds]);

    const filtered = useMemo(() => {
        if (!query) return options;
        const q = query.toLowerCase();
        return options.filter((o: any) =>
            (o.name || '').toLowerCase().includes(q)
        );
    }, [options, query]);

    const toggle = (id: number) => {
        if (disabled) return;
        const exists = local.includes(id);
        const next = exists ? local.filter((s) => s !== id) : [...local, id];
        setLocal(next);
        onChange(next);
    };

    const handleDone = () => {
        onChange(local);
        closeDialog();
    };

    return (
        <div className={className}>
            <div
                role='button'
                tabIndex={0}
                onClick={() => !disabled && openDialog()}
                onKeyDown={(e) => {
                    if (!disabled && (e.key === 'Enter' || e.key === ' '))
                        openDialog();
                }}
                className='focus:ring-primary-500 cursor-pointer rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-50'
            >
                <div className='flex items-center gap-3'>
                    <div className='flex max-h-[100px] flex-1 flex-wrap gap-2 overflow-auto'>
                        {local.length === 0 ? (
                            <span className='text-sm text-slate-400'>
                                {placeholder}
                            </span>
                        ) : (
                            local.map((id) => {
                                const it = options.find(
                                    (o: any) => o.id === id
                                );
                                return (
                                    <span
                                        key={id}
                                        className='bg-primary-100 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm'
                                    >
                                        <span>{it ? it.name : id}</span>
                                        <Tooltip
                                            content={
                                                <span>Remove interests</span>
                                            }
                                        >
                                            <IconX
                                                size={15}
                                                className='cursor-pointer duration-150 hover:text-rose-500'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggle(id);
                                                }}
                                            />
                                        </Tooltip>
                                    </span>
                                );
                            })
                        )}
                    </div>

                    <div className='text-sm text-slate-500'>
                        {isLoading ? 'Loading...' : `${local.length}`}
                    </div>
                </div>
            </div>
            {local.length > 0 && (
                <div
                    className='mt-1 cursor-pointer text-slate-600 hover:underline'
                    onClick={() => {
                        setLocal([]);
                        onChange([]);
                    }}
                >
                    Clear All
                </div>
            )}

            <Dialog
                isOpen={isOpen}
                onClose={closeDialog}
                size='md'
                placement='center'
            >
                <div className='p-4'>
                    <div className='relative mb-3 flex items-center gap-2'>
                        <IconSearch
                            size={16}
                            className='absolute top-1/2 left-3 -translate-y-1/2 text-slate-400'
                        />

                        <input
                            className='focus:ring-primary-500 w-full rounded border-[1px] border-slate-400 px-3 py-2 pl-8 outline-none focus:ring-[1px] focus:outline-none'
                            placeholder='Search interests'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className='max-h-72 overflow-auto'>
                        {isLoading && (
                            <div className='p-2 text-sm text-slate-500'>
                                Loading...
                            </div>
                        )}
                        {!isLoading && filtered.length === 0 && (
                            <div className='p-2 text-sm text-slate-500'>
                                No results
                            </div>
                        )}

                        {!isLoading &&
                            filtered.map((opt: any) => {
                                const checked = local.includes(opt.id);
                                return (
                                    <label
                                        key={opt.id}
                                        className='flex cursor-pointer items-start gap-3 rounded px-2 py-2 hover:bg-slate-50'
                                    >
                                        <input
                                            type='checkbox'
                                            checked={checked}
                                            onChange={() => toggle(opt.id)}
                                            className='mt-1'
                                        />
                                        <div>
                                            <div className='text-sm font-medium'>
                                                {opt.name}
                                            </div>
                                            {opt.description && (
                                                <div className='text-xs text-slate-400'>
                                                    {opt.description}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                    </div>

                    <div className='mt-4 flex items-center justify-between'>
                        {local.length > 0 && (
                            <div
                                className='cursor-pointer text-slate-600 hover:underline'
                                onClick={() => {
                                    setLocal([]);
                                    onChange([]);
                                }}
                            >
                                Clear All
                            </div>
                        )}

                        <div className='ml-auto flex justify-end gap-3'>
                            <button
                                type='button'
                                className='cursor-pointer rounded px-3 py-1 text-sm text-slate-600 duration-150 hover:bg-slate-50'
                                onClick={closeDialog}
                            >
                                Cancel
                            </button>
                            <button
                                type='button'
                                className='bg-primary-600 hover:bg-primary-700 cursor-pointer rounded px-3 py-1 text-sm text-white duration-150'
                                onClick={handleDone}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

export default InterestsDialogSelector;
