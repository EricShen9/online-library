'use client';

import { useState, useEffect } from "react";
import { auth } from '@/lib/firebase/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // redirect after signup
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    }
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="max-w-[400px] m-0 m-auto text-center mt-20 bg-white p-4 border rounded-lg border-gray-200">
      <h1 className="block my-3">Sign Up</h1>
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="block p-1 my-3 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          className="block p-1 my-3 w-full"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          required
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="block p-1 my-3 w-full"
        />
        <button type="submit" className="width-full border rounded-lg  bg-blue-700 hover:bg-blue-400 text-white p-2 m-1"> Sign Up </button>
        {error && (
          <div className = "block m-2 rounded border bg-red-100 border-red-400 text-red-600 px-4 py-2"> 🚫 {error} </div>
        )}
      </form>
      <p className="mx-1 my-2 block">Already have an account? <button onClick={() => router.push('/login')}
          className="text-blue-700 hover:text-blue-400 hover:underline">
          Login
        </button>
      </p>
    </div>
  );
}
