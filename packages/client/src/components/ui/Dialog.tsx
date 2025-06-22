import React, {
    useState,
    useEffect,
    type ReactElement,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useClick,
    useDismiss,
    useRole,
    useInteractions,
    FloatingFocusManager,
    FloatingOverlay,
    type Placement,
} from '@floating-ui/react';
import { cn } from '../../utils/utils';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type DialogPlacement = 'center' | Placement;

export interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    size?: DialogSize;
    placement?: DialogPlacement;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    className?: string;
    overlayClassName?: string;
    trigger?: ReactElement<{ ref?: React.Ref<HTMLElement> }>;
}

export interface UseDialogReturn {
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
    toggleDialog: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    children,
    size = 'md',
    placement = 'center',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className = '',
    overlayClassName = '',
    trigger = null,
}) => {
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const actualPlacement: Placement =
        placement === 'center' ? 'bottom' : placement;

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: onClose,
        placement: actualPlacement,
        middleware: [offset(10), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    const click = useClick(context, {
        enabled: !!trigger,
    });

    const dismiss = useDismiss(context, {
        enabled: closeOnEscape,
        escapeKey: closeOnEscape,
        outsidePress: closeOnOverlayClick,
    });

    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([
        click,
        dismiss,
        role,
    ]);

    const sizeClasses: Record<DialogSize, string> = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full mx-4',
    };

    const DialogContent = (
        <FloatingOverlay
            className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${overlayClassName}`}
            lockScroll
        >
            <FloatingFocusManager context={context}>
                <div
                    ref={refs.setFloating}
                    style={
                        placement === 'center'
                            ? {
                                  position: 'fixed',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  zIndex: 1000,
                              }
                            : floatingStyles
                    }
                    {...getFloatingProps()}
                    className={cn(
                        'border-0 outline-none focus:border-0 focus:ring-0 focus:outline-none',
                        sizeClasses[size],
                        placement === 'center' ? 'max-h-[90vh] w-full' : '',
                        className
                    )}
                >
                    {children}
                </div>
            </FloatingFocusManager>
        </FloatingOverlay>
    );

    const triggerElement = trigger
        ? React.cloneElement(trigger, {
              ...getReferenceProps(),
              ref: refs.setReference,
          } as React.ComponentPropsWithRef<any>)
        : null;

    if (!mounted) return triggerElement;

    return (
        <>
            {triggerElement}
            {isOpen && createPortal(DialogContent, document.body)}
        </>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDialog = (initialState: boolean = false): UseDialogReturn => {
    const [isOpen, setIsOpen] = useState<boolean>(initialState);

    const openDialog = (): void => setIsOpen(true);
    const closeDialog = (): void => setIsOpen(false);
    const toggleDialog = (): void => setIsOpen((prev) => !prev);

    return {
        isOpen,
        openDialog,
        closeDialog,
        toggleDialog,
    };
};
