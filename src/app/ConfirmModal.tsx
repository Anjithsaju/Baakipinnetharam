import React from "react";

type ConfirmModalProps = {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center px-5 justify-center bg-black/60 bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
        <p className="text-lg font-medium mb-6 text-black">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            Close
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={onConfirm}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
