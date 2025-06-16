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
import { IconX } from '@tabler/icons-react';
import { cn } from '../../utils/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ModalPlacement = 'center' | Placement;

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    size?: ModalSize;
    placement?: ModalPlacement;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    className?: string;
    overlayClassName?: string;
    trigger?: ReactElement<{ ref?: React.Ref<HTMLElement> }>;
}

export interface UseModalReturn {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
    size = 'md',
    placement = 'center',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
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

    const sizeClasses: Record<ModalSize, string> = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full mx-4',
    };

    const modalContent = (
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
                        'rounded-lg border border-gray-200 bg-white shadow-xl',
                        sizeClasses[size],
                        placement === 'center' ? 'max-h-[90vh] w-full' : '',
                        className
                    )}
                >
                    {(title || showCloseButton) && (
                        <div className='flex items-center justify-between border-b border-gray-200 p-4'>
                            {title && (
                                <h2 className='text-lg font-bold text-slate-700'>
                                    {title}
                                </h2>
                            )}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className='cursor-pointer rounded-md p-1 transition-colors hover:bg-gray-100'
                                    aria-label='Close modal'
                                    type='button'
                                >
                                    <IconX
                                        size={20}
                                        className='text-gray-500'
                                    />
                                </button>
                            )}
                        </div>
                    )}

                    <div className='max-h-[calc(90vh-8rem)] overflow-y-auto p-4'>
                        {children}
                    </div>
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
            {isOpen && createPortal(modalContent, document.body)}
        </>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = (initialState: boolean = false): UseModalReturn => {
    const [isOpen, setIsOpen] = useState<boolean>(initialState);

    const openModal = (): void => setIsOpen(true);
    const closeModal = (): void => setIsOpen(false);
    const toggleModal = (): void => setIsOpen((prev) => !prev);

    return {
        isOpen,
        openModal,
        closeModal,
        toggleModal,
    };
};
