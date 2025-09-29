'use client'
import { LikeButton } from "./like";
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import type { PostProps } from "../page";

export function Post({ id, user, content, created_at, likes, isLiked }: PostProps) {
  const { user: currentUser } = useAuth();
  const publishedDate = new Date(created_at);
  const publishedDateFormatted = format(publishedDate, "dd LLL yyyy HH:mm", {
    locale: ptBR
  })
  const publishedDateRelativeToNow = formatDistanceToNow(publishedDate, {
    locale: ptBR,
    addSuffix: true
  })

  return (
      <>
      <article className="bg-gray-800 rounded-lg p-4 md:p-4 w-full">
        <header className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={`https://github.com/${user.avatarUrl}.png`}
                  alt={`Avatar de ${user.name}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="authorInfo min-w-0 flex-1">
              <strong className="block text-gray-100 text-sm md:text-base truncate">{user.name}</strong>
            </div>
          </div>
          <time title={publishedDateFormatted} dateTime={publishedDate.toISOString()}>
            {publishedDateRelativeToNow}
          </time>
        </header>
        <div className="mt-4 md:mt-6 text-gray-300">
          <p className="text-sm md:text-base">{content}</p>      
        </div>
        <div className="flex justify-end h-8">
          {currentUser && (
            <LikeButton postId={id} initialLikes={likes} initialIsLiked={isLiked || false} />
          )}
        </div>
      </article>
      </>
  );
}