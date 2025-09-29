import { Heart } from "lucide-react";
import { useState } from "react";

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  initialIsLiked: boolean;
}

export function LikeButton({ postId, initialLikes, initialIsLiked }: LikeButtonProps){
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  console.log(`LikeButton ${postId}:`, { initialLikes, initialIsLiked, likes, isLiked });

  const handleLike = async () => {
    if (isLoading) return;
    
    console.log('Clique no like:', { postId, isLiked, likes });
    
    setIsLoading(true);
    
    const previousLikes = likes;
    const previousIsLiked = isLiked;
    const newIsLiked = !isLiked;
    const newLikes = isLiked ? likes - 1 : likes + 1;
    
    console.log('Estado otimista:', { newIsLiked, newLikes });
    
    setIsLiked(newIsLiked);
    setLikes(newLikes);
    
    try {
      const { likePost } = await import('@/services/apiServics');
      const response = await likePost(postId);
      
      console.log('Resposta do like:', response);
      
      if (typeof response.likes === 'number') {
        setLikes(response.likes);
      }
      
      if (typeof response.isLiked === 'boolean') {
        setIsLiked(response.isLiked);
      } else {
        console.log('Campo isLiked não encontrado na resposta, mantendo estado local');
      }
    } catch (error) {
      console.error('Erro ao curtir post:', error);

      setLikes(previousLikes);
      setIsLiked(previousIsLiked);
    } finally {
      setIsLoading(false);
    }
  };

  return(
      <button 
        type="button"
        aria-label="Curtir post"
        onClick={handleLike}
        disabled={isLoading}
        className={`mt-4 md:mt-6 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 ${
          isLiked 
            ? 'text-green-500 hover:text-green-600' 
            : 'text-gray-400 hover:text-green-500'
        }`} >
        <Heart 
          className={isLiked ? 'fill-current' : ''} 
          size={18} 
          fill={isLiked ? 'currentColor' : 'none'}
        />
        <span className="text-sm">{likes}</span>
      </button>
  )
}