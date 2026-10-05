import React, { useEffect, useRef } from 'react';

interface PopoverMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  className?: string;
  width?: string;
  align?: 'left' | 'right';
}

export const PopoverMenu: React.FC<PopoverMenuProps> = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  className = '',
  width = 'w-64',
  align = 'left',
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div
      ref={popoverRef}
      className={`absolute bottom-full mb-2 ${alignClass} ${width} bg-white border border-neutral-300 rounded-sm shadow-sm z-50 p-1.5 text-xs text-neutral-800 animate-in fade-in zoom-in-95 duration-100 ${className}`}
      role="menu"
    >
      {children}
    </div>
  );
};
