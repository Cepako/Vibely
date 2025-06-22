import { type ClassValue, clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString: string) {
    return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: pl,
    });
}

export const defaultDateFormat = 'dd.MM.yyyy HH:mm';
