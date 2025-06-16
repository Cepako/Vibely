import { cn } from '../../utils/utils';

export default function Button({
    children,
    className = '',
    type = 'button',
    onClick,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type={type}
            className={cn(
                'bg-primary-600 hover:bg-primary-700 cursor-pointer rounded p-2 text-white duration-200',
                className
            )}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}
