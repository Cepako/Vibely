import { IconLock, IconUsers, IconWorld } from '@tabler/icons-react';
import type { PrivacyLevel } from '../../types/post';

export default function PrivacyIcon({ level }: { level: PrivacyLevel }) {
    const iconProps = { size: 16, className: 'text-slate-500' };

    switch (level) {
        case 'public':
            return <IconWorld {...iconProps} />;
        case 'friends':
            return <IconUsers {...iconProps} />;
        case 'private':
            return <IconLock {...iconProps} />;
    }
}
