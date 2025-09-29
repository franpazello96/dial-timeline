'use client'
import { useState, useEffect, useRef } from "react";
import { PencilIcon } from "lucide-react";
import { InputUpdateProfile, type InputUpdateProfileRef } from "./inputUpdateProfile";
import { ButtonUpdateProfile } from "./buttonUpdateProfile";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { getUserProfile, updateUserProfile, deleteUserProfile, type ProfileResponse, type UpdateProfileData, type DeleteProfileData } from "@/services/apiServics";
import { useAuth } from "@/contexts/AuthContext";

export function Profile(){
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileResponse['user'] | null>(null);
  const { logout } = useAuth();
  const inputUpdateProfileRef = useRef<InputUpdateProfileRef>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        if (response.success) {
          setProfileData(response.user);
        } else {
          console.log('Response.success é false');
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (updatedData: UpdateProfileData) => {
    if (!profileData) return;
    
    setIsSaving(true);
    try {
      const response = await updateUserProfile(updatedData);
      if (response.success) {
        setProfileData(response.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleButtonSave = () => {
    if (inputUpdateProfileRef.current) {
      inputUpdateProfileRef.current.triggerSave();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (password: string) => {
    setIsDeleting(true);
    
    try {
      const response = await deleteUserProfile({ password, confirmation: 'DELETE_MY_ACCOUNT' });
      if (response.success) {
        alert('Perfil deletado com sucesso!');
        logout(); 
      }
    } catch (error: any) {
      console.error('Erro ao deletar perfil:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao deletar perfil. Tente novamente.';
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <aside className="bg-gray-800 w-full lg:max-w-sm lg:min-w-80 rounded-lg overflow-hidden">
        <div className="flex items-center justify-center h-40">
          <span className="text-gray-400">Carregando perfil...</span>
        </div>
      </aside>
    );
  }

  if (!profileData) {
    return (
      <aside className="bg-gray-800 w-full lg:max-w-sm lg:min-w-80 rounded-lg overflow-hidden">
        <div className="flex items-center justify-center h-40">
          <span className="text-gray-400">Erro ao carregar perfil</span>
        </div>
      </aside>
    );
  }

  return(
    <>
      <aside className="bg-gray-800 w-full lg:max-w-sm lg:min-w-80 rounded-lg overflow-hidden">
        <div className="w-full h-16 md:h-20 bg-gradient-to-r from-green-500 to-blue-500"></div>
        
        <div className="flex flex-col items-center p-4">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-800 bg-gray-600 flex items-center justify-center -mt-12">
            {profileData.avatarUrl ? (
              <img 
                src={`https://github.com/${profileData.avatarUrl}.png`}
                alt="Foto do usuário" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {profileData.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
            {isEditing ? ( 
              <InputUpdateProfile 
                ref={inputUpdateProfileRef}
                profileData={profileData}
                onSave={handleSave}
              /> 
            ) : (
            <>
              <strong className="text-gray-100 mt-2 text-center">{profileData.name}</strong>
              <span className="text-gray-400 text-sm text-center">{profileData.email}</span>
              <span className="text-gray-500 text-xs text-center mt-1">
                Membro desde {new Date(profileData.created_at).toLocaleDateString('pt-BR')}
              </span>
            </>
            )}
        </div>
        <footer className="border-t border-gray-600 mt-4 pt-4 pb-4 px-4 md:px-10">
            {isEditing ? ( 
              <ButtonUpdateProfile 
                onSave={handleButtonSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
                isLoading={isSaving}
              /> 
            ):(
              <button
                type="button"
                onClick={() => setIsEditing(true)} 
                className="flex justify-center items-center gap-2 text-green-500 border border-green-500 
                rounded-lg h-8 w-full font-bold hover:bg-green-500 hover:text-white transition-colors text-sm">
                <PencilIcon size={14} /> Editar Perfil
              </button>
          )}
        </footer>
      </aside>
      
      {showDeleteModal && (
        <DeleteAccountModal
          isOpen={showDeleteModal}
          isLoading={isDeleting}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}