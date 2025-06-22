import React, {
    useState,
    useRef,
    type ReactNode,
    type CSSProperties,
} from 'react';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useHover,
    useFocus,
    useDismiss,
    useRole,
    useInteractions,
    FloatingPortal,
    arrow,
    useClick,
    FloatingArrow,
    FloatingFocusManager,
} from '@floating-ui/react';
import { cn } from '../../utils/utils';
import { IconX } from '@tabler/icons-react';

type PopoverTriggerType = 'click' | 'hover' | 'focus' | 'manual';

type PopoverPlacement =
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end';

interface PopoverProps {
    /** Element that triggers the popover */
    trigger: ReactNode;
    /** Content displayed inside the popover */
    content: ReactNode;
    /** Optional title displayed in popover header */
    title?: ReactNode;
    /** Position of popover relative to trigger */
    placement?: PopoverPlacement;
    /** Whether popover is currently open (controlled) */
    open?: boolean;
    /** Callback when popover open state changes */
    onOpenChange?: (open: boolean) => void;
    /** How the popover is triggered */
    triggerType?: PopoverTriggerType;
    /** Whether popover has an arrow pointing to trigger */
    arrow?: boolean;
    /** Maximum width of popover content */
    maxWidth?: number;
    /** Additional CSS classes for popover container */
    className?: string;
    /** Additional inline styles */
    style?: CSSProperties;
    /** Whether popover is disabled */
    disabled?: boolean;
    /** Distance between popover and trigger */
    offset?: number;
    /** Delay before showing popover on hover (ms) */
    delay?: number;
    /** Delay before hiding popover on hover leave (ms) */
    closeDelay?: number;
    /** Whether popover should be modal (trap focus) */
    modal?: boolean;
    /** Whether to show close button in header */
    showCloseButton?: boolean;
    /** Callback when popover is closed */
    onClose?: () => void;
    /** Whether popover can be closed by clicking outside */
    dismissible?: boolean;
    /** Whether popover can be closed by pressing Escape */
    escapeDismiss?: boolean;
    /** Custom close button element */
    closeButton?: ReactNode;
    /** Additional props for the popover container */
    containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

const Popover: React.FC<PopoverProps> = ({
    trigger: triggerElement,
    content,
    title,
    placement = 'bottom',
    open: controlledOpen,
    onOpenChange,
    triggerType = 'click',
    arrow: showArrow = true,
    maxWidth = 300,
    className = '',
    style = {},
    disabled = false,
    offset: offsetValue = 8,
    delay = 0,
    closeDelay = 150,
    modal = false,
    showCloseButton = false,
    onClose,
    dismissible = true,
    escapeDismiss = true,
    closeButton,
    containerProps = {},
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(false);
    const arrowRef = useRef<SVGSVGElement>(null);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = onOpenChange ?? setUncontrolledOpen;

    const handleClose = (): void => {
        setOpen(false);
        if (onClose) {
            onClose();
        }
    };

    const { refs, floatingStyles, context } = useFloating({
        open: open && !disabled,
        onOpenChange: setOpen,
        placement,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(offsetValue),
            flip({
                fallbackAxisSideDirection: 'start',
                padding: 8,
            }),
            shift({ padding: 8 }),
            showArrow &&
                arrow({
                    element: arrowRef,
                }),
        ].filter(Boolean),
    });

    const hover = useHover(context, {
        enabled: triggerType === 'hover',
        delay: {
            open: delay,
            close: closeDelay,
        },
    });

    const focus = useFocus(context, {
        enabled: triggerType === 'focus',
    });

    const click = useClick(context, {
        enabled: triggerType === 'click',
    });

    const dismiss = useDismiss(context, {
        enabled: dismissible,
        escapeKey: escapeDismiss,
    });

    const role = useRole(context, { role: 'dialog' });

    const { getReferenceProps, getFloatingProps } = useInteractions([
        hover,
        focus,
        click,
        dismiss,
        role,
    ]);

    const popoverStyles: React.CSSProperties = {
        maxWidth: `${maxWidth}px`,
        zIndex: 9999,
        ...style,
    };

    if (disabled) {
        return <>{triggerElement}</>;
    }

    return (
        <>
            <div
                ref={refs.setReference}
                {...getReferenceProps()}
                style={{ display: 'inline-block' }}
            >
                {triggerElement}
            </div>
            {open && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={modal}>
                        <div
                            ref={refs.setFloating}
                            style={{
                                ...floatingStyles,
                                ...popoverStyles,
                            }}
                            className={cn(
                                'z-50 rounded-lg border bg-white shadow-lg',
                                className
                            )}
                            {...getFloatingProps()}
                            {...containerProps}
                        >
                            {(title || showCloseButton) && (
                                <div className='flex items-center justify-between border-b p-4 pb-3'>
                                    {title && (
                                        <h3 className='text-lg font-semibold text-gray-900'>
                                            {title}
                                        </h3>
                                    )}
                                    {showCloseButton && (
                                        <button
                                            onClick={handleClose}
                                            className='text-gray-400 transition-colors hover:text-gray-600'
                                            aria-label='Close popover'
                                            type='button'
                                        >
                                            {closeButton || <IconX />}
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className='p-4'>{content}</div>
                            {showArrow && (
                                <FloatingArrow
                                    ref={arrowRef}
                                    context={context}
                                    className='fill-white stroke-gray-200'
                                    width={16}
                                    height={8}
                                />
                            )}
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </>
    );
};

export default Popover;
