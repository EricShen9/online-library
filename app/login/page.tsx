'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const redirected = searchParams.get('redirected');
    if (redirected === 'loggedout') {
      setShowWarning(true);
    }
  }, [searchParams]);

  const errorMessages: Record<string, string> = {
    "auth/invalid-credential": "Your credentials are invalid. Please check and try again.",
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Signed in from:", window.location.href);
      router.push("/dashboard");
    } catch (err: any) {
      setError(errorMessages[err.code] || "Something went wrong. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email above to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("A password reset link has been sent to your email.");
    } catch (err: any) {
      setError(errorMessages[err.code] || "Unable to send reset email.");
    }
  };

  return (
    <div className="w-100 m-auto text-center mt-20 bg-white p-4 border rounded-lg border-gray-200">
      {showWarning && (
        <div className="mb-4 rounded bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2">
          ⚠️ You must log in to view this page.
        </div>
      )}

      <h1 className="block my-3">Log In</h1>
      <form onSubmit={handleSignIn}>
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
        <button type="submit" className="w-full border rounded-lg bg-blue-700 hover:bg-blue-400 text-white p-2 m-1">Log In</button>
        {error && (
          <div className="block m-2 rounded border bg-red-100 border-red-400 text-red-600 px-4 py-2">
            🚫 {error}
          </div>
        )}
      </form>
      <p className="mx-1 mt-2 block">
        Don't have an account?{' '}
        <button
          onClick={() => router.push('/signup')}
          className="text-blue-700 hover:text-blue-400 hover:underline"
        >
          Signup
        </button>{' '}
        <button
          type="button"
          onClick={handleResetPassword}
          className="text-blue-700 hover:text-blue-400 hover:underline block justify-self-center"
        >
          Forgot your password?
        </button>
      </p>
    </div>
  );
}
