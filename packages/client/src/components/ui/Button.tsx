export default function Button({
    children,
    className = '',
    type = 'button',
    onClick,
}: {
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
}) {
    return (
        <button
            type={type}
            className={`bg-primary-600 hover:bg-primary-700 cursor-pointer rounded p-2 text-white duration-200 ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
