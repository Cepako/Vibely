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
} from '@floating-ui/react';
import { cn } from '../../utils/utils';

export interface TooltipProps {
    /** Zawartość tooltip */
    content: ReactNode;
    /** Element nad którym wyświetla się tooltip */
    children: ReactNode;
    /** Pozycja tooltip względem elementu */
    placement?:
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
    /** Opóźnienie przed pokazaniem tooltip (ms) */
    delay?: number;
    /** Czy tooltip ma być widoczny */
    open?: boolean;
    /** Callback wywoływany przy zmianie stanu widoczności */
    onOpenChange?: (open: boolean) => void;
    /** Tryb aktywacji tooltip */
    trigger?: 'hover' | 'click' | 'focus' | 'manual';
    /** Czy tooltip ma strzałkę */
    arrow?: boolean;
    /** Maksymalna szerokość tooltip */
    maxWidth?: number;
    /** Dodatkowe klasy CSS */
    className?: string;
    /** Dodatkowe style */
    style?: CSSProperties;
    /** Czy tooltip ma być wyłączony */
    disabled?: boolean;
    /** Offset od elementu */
    offset?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    placement = 'top',
    delay = 0,
    open: controlledOpen,
    onOpenChange,
    trigger = 'hover',
    arrow: showArrow = true,
    maxWidth = 200,
    className = '',
    style = {},
    disabled = false,
    offset: offsetValue = 8,
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const arrowRef = useRef(null);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = onOpenChange ?? setUncontrolledOpen;

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
        enabled: trigger === 'hover',
        delay: {
            open: delay,
            close: 0,
        },
        restMs: 40,
    });

    const focus = useFocus(context, {
        enabled: trigger === 'focus',
    });

    const click = useClick(context, {
        enabled: trigger === 'click',
    });

    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'tooltip' });

    const { getReferenceProps, getFloatingProps } = useInteractions([
        hover,
        focus,
        click,
        dismiss,
        role,
    ]);

    const tooltipStyles: CSSProperties = {
        lineHeight: '1.4',
        maxWidth: `${maxWidth}px`,
        wordWrap: 'break-word',
        zIndex: 9999,
        ...style,
    };

    if (disabled || !content) {
        return <>{children}</>;
    }

    return (
        <>
            <span
                ref={refs.setReference}
                {...getReferenceProps()}
                style={{ display: 'inline-block' }}
            >
                {children}
            </span>
            {open && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        style={{
                            ...floatingStyles,
                            ...tooltipStyles,
                        }}
                        className={cn(
                            'rounded-md bg-black px-2 py-3 text-sm text-white opacity-90',
                            className
                        )}
                        {...getFloatingProps()}
                    >
                        {content}
                        {showArrow && (
                            <FloatingArrow
                                ref={arrowRef}
                                context={context}
                                width={16}
                                height={8}
                            />
                        )}
                    </div>
                </FloatingPortal>
            )}
        </>
    );
};

export default Tooltip;
