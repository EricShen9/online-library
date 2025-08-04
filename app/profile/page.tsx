'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/firebase';
import { updateEmail, updatePassword, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email || '');
      } else {
        router.push('/signin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleEmailUpdate = async () => {
    if (!email || email === user.email) return;
    try {
      await updateEmail(user, email);
      setMessage('Email updated successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!password) return;
    try {
      await updatePassword(user, password);
      setMessage('Password updated successfully.');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>

      {message && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">✅ {message}</div>}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">🚫 {error}</div>}

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleEmailUpdate}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update Email
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handlePasswordUpdate}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}
