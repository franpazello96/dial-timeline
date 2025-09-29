'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ProfileResponse } from "@/services/apiServics";

interface InputUpdateProfileProps {
  profileData: ProfileResponse['user'];
  onSave: (data: { name: string; email: string; avatarUrl: string | null }) => void;
}

export interface InputUpdateProfileRef {
  triggerSave: () => void;
}

export const InputUpdateProfile = forwardRef<InputUpdateProfileRef, InputUpdateProfileProps>(
  ({ profileData, onSave }, ref) => {
    const [name, setName] = useState(profileData.name);
    const [email, setEmail] = useState(profileData.email);
    const [avatarUrl, setAvatar] = useState(profileData.avatarUrl);

    useEffect(() => {
      setName(profileData.name);
      setEmail(profileData.email);
      setAvatar(profileData.avatarUrl);
    }, [profileData]);

    const handleSave = () => {
      onSave({ name, email, avatarUrl });
    };
    
    useImperativeHandle(ref, () => ({
      triggerSave: handleSave
    }));

  return (
       <>
        <label className="mt-2 text-gray-400 text-sm" htmlFor="name">Nome</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="mt-2 w-full py-1 rounded-md text-center bg-gray-700 text-white 
                      focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <label className="mt-1 text-gray-400 text-sm" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mt-1 w-full py-1 rounded-md text-center bg-gray-700 text-white 
                      focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <label className="mt-2 text-gray-400 text-sm" htmlFor="avatarUrl">GitHub User</label>
        <input
          id="avatarUrl"
          type="text"
          value={avatarUrl || ''}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="GitHub username"
          className="mt-2 w-full py-1 rounded-md text-center bg-gray-700 text-white 
                      focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </>
  );
});
