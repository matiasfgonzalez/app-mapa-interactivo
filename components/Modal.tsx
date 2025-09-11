import { X } from "lucide-react";
import { ReactNode, useEffect, useCallback } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: Readonly<ModalProps>) {
  // Manejo de tecla Escape
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  // Efecto para manejar la tecla Escape y bloquear scroll
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleEscape]);

  // Manejo de clic en el overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // Configuración de tamaños
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Overlay con animación */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Container del modal */}
      <div
        className={`
          relative w-full ${sizeClasses[size]} transform
          bg-white rounded-2xl shadow-2xl
          transition-all duration-300 ease-out
          animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4
          border border-gray-200/50
        `}
      >
        {/* Header del modal */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 pb-2">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900 leading-6"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100
                  transition-all duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                "
                aria-label="Cerrar modal"
                type="button"
              >
                <X size={20} className="transition-transform hover:scale-110" />
              </button>
            )}
          </div>
        )}

        {/* Contenido del modal */}
        <div className={`${title || showCloseButton ? "px-6 pb-6" : "p-6"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
