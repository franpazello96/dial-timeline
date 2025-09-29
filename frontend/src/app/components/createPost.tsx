'use client'

import { useState } from 'react';
import { createPost } from '@/services/apiServics';

interface CreatePostProps {
  onPostCreated: () => void; 
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Por favor, escreva algo antes de publicar!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createPost({ content: content.trim() });
      
      setContent('');
      onPostCreated();
      
    } catch (error) {
      console.error('Erro ao criar post:', error);
      alert('Erro ao publicar post. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <>
      <div >
        <form onSubmit={handleSubmit}>
            <div className="bg-gray-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 p-4">
              <textarea 
                className="w-full text-gray-100 focus:ring-green-500 focus:outline-none resize-none h-20 md:h-24 text-sm md:text-base bg-transparent border-none"
                placeholder="O que você está pensando?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
              />

              <button 
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="bg-green-500 text-white px-4 py-2 md:px-4 
                md:py-2 rounded-lg font-bold hover:bg-green-600 transition-colors text-sm md:text-base
                w-full sm:w-auto whitespace-nowrap cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed"
              > 
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      </>
  );
}