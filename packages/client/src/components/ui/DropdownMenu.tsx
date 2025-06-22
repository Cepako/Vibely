import React, {
    useState,
    useRef,
    type ReactNode,
    type MouseEvent,
} from 'react';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useHover,
    useDismiss,
    useRole,
    useInteractions,
    FloatingPortal,
    arrow,
    useClick,
    FloatingArrow,
    useListNavigation,
    FloatingFocusManager,
    safePolygon,
} from '@floating-ui/react';
import { cn } from '../../utils/utils';

export type TriggerType = 'click' | 'hover' | 'manual';

export type PlacementType =
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

export interface DropdownMenuItem {
    /** Unique identifier for the menu item */
    id: string;
    /** Label displayed in the menu */
    label: ReactNode;
    /** Optional icon displayed before the label */
    icon?: ReactNode;
    /** Click handler for the menu item */
    onClick?: (event: MouseEvent<HTMLDivElement>) => void;
    /** Whether the menu item is disabled */
    disabled?: boolean;
    /** Whether the menu item represents a dangerous action */
    danger?: boolean;
    /** Whether this item is a separator */
    separator?: boolean;
    /** Additional CSS classes for the menu item */
    className?: string;
    /** Keyboard shortcut hint */
    shortcut?: string;
}

interface DropdownMenuProps {
    /** Element that triggers the dropdown */
    trigger: ReactNode;
    /** Array of menu items to display */
    items: DropdownMenuItem[];
    /** Position of dropdown relative to trigger */
    placement?: PlacementType;
    /** Whether dropdown is currently open (controlled) */
    open?: boolean;
    /** Callback when dropdown open state changes */
    onOpenChange?: (open: boolean) => void;
    /** How the dropdown is triggered */
    triggerType?: TriggerType;
    /** Whether dropdown has an arrow pointing to trigger */
    arrow?: boolean;
    /** Additional CSS classes for dropdown container */
    className?: string;
    /** Whether dropdown is disabled */
    disabled?: boolean;
    /** Distance between dropdown and trigger */
    offset?: number;
    /** Delay before showing dropdown on hover (ms) */
    delay?: number;
    /** Delay before hiding dropdown on hover leave (ms) */
    closeDelay?: number;
    /** Callback when menu item is selected */
    onItemSelect?: (item: DropdownMenuItem) => void;
    /** Whether to close dropdown when item is clicked */
    closeOnItemClick?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
    trigger: triggerElement,
    items,
    placement = 'bottom-start',
    open: controlledOpen,
    onOpenChange,
    triggerType = 'click',
    arrow: showArrow = false,
    className = '',
    disabled = false,
    offset: offsetValue = 8,
    delay = 0,
    closeDelay = 150,
    onItemSelect,
    closeOnItemClick = true,
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const arrowRef = useRef<SVGSVGElement>(null);
    const listRef = useRef<Array<HTMLDivElement | null>>([]);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = onOpenChange ?? setUncontrolledOpen;

    // Filter out separator items for navigation
    const navigableItems = items.filter(
        (item) => !item.separator && !item.disabled
    );

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
        handleClose: safePolygon(),
    });

    const click = useClick(context, {
        enabled: triggerType === 'click',
    });

    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'menu' });

    const listNavigation = useListNavigation(context, {
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
        virtual: true,
        loop: true,
    });

    const { getReferenceProps, getFloatingProps, getItemProps } =
        useInteractions([hover, click, dismiss, role, listNavigation]);

    const handleItemClick = (
        item: DropdownMenuItem,
        event: React.MouseEvent<HTMLDivElement>
    ) => {
        if (item.disabled) return;

        // Call the item's onClick handler
        if (item.onClick) {
            item.onClick(event);
        }

        // Call the onItemSelect callback
        if (onItemSelect) {
            onItemSelect(item);
        }

        // Close dropdown if configured to do so
        if (closeOnItemClick) {
            setOpen(false);
        }
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
                    <FloatingFocusManager context={context} modal={false}>
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className={cn(
                                'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-lg',
                                className
                            )}
                            {...getFloatingProps()}
                        >
                            {items.map((item, index) => {
                                if (item.separator) {
                                    return (
                                        <div
                                            key={`separator-${index}`}
                                            className='my-1 h-px bg-gray-200'
                                        />
                                    );
                                }

                                const itemIndex = navigableItems.findIndex(
                                    (navItem) => navItem.id === item.id
                                );
                                const isActive = activeIndex === itemIndex;

                                return (
                                    <div
                                        key={item.id}
                                        ref={(node) => {
                                            listRef.current[itemIndex] = node;
                                        }}
                                        className={cn(
                                            'relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none',
                                            {
                                                'bg-gray-100 text-gray-900':
                                                    isActive,
                                                'text-gray-700':
                                                    !isActive &&
                                                    !item.disabled &&
                                                    !item.danger,
                                                'text-red-600':
                                                    item.danger &&
                                                    !item.disabled,
                                                'cursor-not-allowed text-gray-400':
                                                    item.disabled,
                                                'hover:bg-gray-100':
                                                    !item.disabled && !isActive,
                                                'hover:bg-red-50 hover:text-red-700':
                                                    item.danger &&
                                                    !item.disabled &&
                                                    !isActive,
                                            },
                                            item.className
                                        )}
                                        onClick={(event) =>
                                            handleItemClick(item, event)
                                        }
                                        {...getItemProps({
                                            onClick(
                                                event: React.MouseEvent<HTMLDivElement>
                                            ) {
                                                handleItemClick(item, event);
                                            },
                                        })}
                                    >
                                        {item.icon && (
                                            <span className='mr-2 flex h-4 w-4 items-center justify-center'>
                                                {item.icon}
                                            </span>
                                        )}
                                        <span className='flex-1'>
                                            {item.label}
                                        </span>
                                        {item.shortcut && (
                                            <span className='ml-2 text-xs text-gray-400'>
                                                {item.shortcut}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
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

export default DropdownMenu;
