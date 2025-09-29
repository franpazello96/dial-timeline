import type { PostProps } from '@/app/page';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
      
      if (!isAuthPage) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function getPosts(): Promise<PostProps[]> {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    console.log('Posts recebidos:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return [];
  }
}


export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
}

export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
}

export async function likePost(postId: string): Promise<{ likes: number; isLiked: boolean }> {
  const response = await axios.post(`${API_URL}/posts/${postId}/like`);
  return response.data;
}

export interface ProfileResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    created_at: string;
  };
}

export async function getUserProfile(): Promise<ProfileResponse> {
  const response = await axios.get(`${API_URL}/profile`);
  return response.data;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
}

export async function updateUserProfile(profileData: UpdateProfileData): Promise<ProfileResponse> {
  const response = await axios.put(`${API_URL}/profile`, profileData);
  return response.data;
}

export interface DeleteProfileData {
  password: string;
  confirmation: string;
}

export async function deleteUserProfile(data: DeleteProfileData): Promise<{ success: boolean; message: string }> {
  const response = await axios.delete(`${API_URL}/profile`, { data });
  return response.data;
}

export interface CreatePostData {
  content: string;
}

export async function createPost(postData: CreatePostData): Promise<PostProps> {
  const response = await axios.post(`${API_URL}/posts`, postData);
  return response.data;
}
