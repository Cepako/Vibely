import { cn } from '../../utils/utils';

export default function Input({
    type = 'text',
    name,
    placeholder = '',
    className = '',
    ...props
}: {
    type?: string;
    name: string;
    placeholder?: string;
    className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            className={cn(
                'outline-primary-400 rounded border border-slate-300 p-2 placeholder:text-slate-400 focus:outline-1',
                className
            )}
            {...props}
        />
    );
}
