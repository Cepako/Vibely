export type EventStatus = 'upcoming' | 'ongoing' | 'ended';

export interface EventStatusInfo {
    status: EventStatus;
    label: string;
    isActionable: boolean;
    color: string;
    bgColor: string;
}

export function getEventStatus(
    startTime: string,
    endTime: string
): EventStatusInfo {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now > end) {
        return {
            status: 'ended',
            label: 'Event Ended',
            isActionable: false,
            color: 'text-slate-500',
            bgColor: 'bg-slate-100',
        };
    }

    if (now >= start && now <= end) {
        return {
            status: 'ongoing',
            label: 'Event Started',
            isActionable: false,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100',
        };
    }

    return {
        status: 'upcoming',
        label: 'Upcoming',
        isActionable: true,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
    };
}

export function formatTimeUntilEvent(startTime: string): string {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return 'Event has started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return `${days} day${days === 1 ? '' : 's'}, ${hours} hour${hours === 1 ? '' : 's'}`;
    } else if (hours > 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}, ${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else {
        return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
}
