import { cn } from '../../utils/utils';

interface IconProps {
    className?: string;
}

export default function VibelyIcon({ className = '' }: IconProps) {
    return (
        <img
            alt='vibely logo'
            src='icon2.png'
            className={cn('h-10 w-10', className)}
        />
    );
}
