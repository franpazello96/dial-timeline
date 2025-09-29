import { X } from "lucide-react";
import { useState } from "react";

interface ButtonUpdateProfileProps {
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export function ButtonUpdateProfile({ onSave, onCancel, onDelete, isLoading = false }: ButtonUpdateProfileProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3"> 
          <div className="flex flex-row items-center gap-3">
      <button
        type="button"
        aria-label="Salvar perfil"
        onClick={onSave}
        disabled={isLoading}
        className="flex items-center gap-2 text-green-500 border border-green-500 rounded-lg h-8 px-4 font-semibold 
        hover:bg-green-500 hover:text-white transition-colors text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? 'Salvando...' : 'Salvar'}
      </button>
      
      <button 
        type="button" 
        aria-label="Cancelar edição" 
        onClick={onCancel}
        disabled={isLoading}
        className="flex items-center gap-2 text-gray-400 border border-gray-400 rounded-lg h-8 px-4 font-semibold 
         transition-colors text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
        <X />
      </button>
    </div>
      <button
        type="button"
        aria-label="Deletar perfil"
        onClick={handleDeleteClick}
        disabled={isLoading}
        className={`flex items-center gap-1 transition-colors text-sm cursor-pointer disabled:opacity-50 ${
          showDeleteConfirm 
            ? 'text-red-500 hover:text-red-600 font-semibold' 
            : 'text-gray-400 hover:text-red-500'
        }`}>
        {showDeleteConfirm ? 'Confirmar exclusão?' : 'Deletar perfil'}
      </button>

    </div>
  );
}
