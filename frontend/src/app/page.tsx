'use client'

import { useState, useEffect } from "react";
import { CreatePost } from "./components/createPost";
import { Post } from "./components/post";
import { Profile } from "./components/profile";
import { getPosts } from "@/services/apiServics";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

type Author = {
  name: string;
  avatarUrl?: string;
}

export type PostProps = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user: Author;
  likes: number;
  isLiked?: boolean;
};

export default function Timeline() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();

  console.log('User no Timeline:', user);

  const fetchPosts = async () => {
    setIsLoading(true);
    const posts = await getPosts();
    console.log('posts:', posts);
    setPosts(posts);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts();
  };

  return (
    <ProtectedRoute>
      <header className="bg-gray-800 flex justify-between py-2 mb-4">
        <h1 className="text-green-500 text-xl md:text-2xl px-4">Timeline Page</h1>
        <div className="flex justify-center items-center gap-2">
          <span className="text-white px-4 py-2 md:px-4">{user?.name || 'Usuário'}</span>
           <span className="text-white px-4 py-2 md:px-4 cursor-pointer" onClick={logout}>
            <LogOut size={20}/>
          </span>
        </div>
        
      </header>
      <div className="flex flex-col lg:flex-row justify-center gap-6 mx-auto mb-10 max-w-7xl px-4">
        <div className="w-full lg:w-auto lg:min-w-80">
          <Profile />
        </div>
        <div className="flex flex-col w-full lg:max-w-2xl gap-4">
          <CreatePost onPostCreated={handlePostCreated} />
          <main className="flex flex-col gap-4"> 
            {posts.map(post => {
              return (
                <Post 
                key={post.id}
                id={post.id}
                user={post.user}
                content={post.content}
                created_at={post.created_at}
                updated_at={post.updated_at}
                user_id={post.user_id}
                likes={post.likes}
                isLiked={post.isLiked}
                />
              )
            })}
          </main>
          
        </div>
      </div>
    </ProtectedRoute>
  );
}
