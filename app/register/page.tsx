'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.',
      );
      setLoading(false);
      return;
    }

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          'NEXT_PUBLIC_API_URL is not configured.',
        );
      }

      const response = await fetch(
        `${apiUrl}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ??
                'Registration failed.',
        );
      }

      localStorage.setItem(
        'user_token',
        data.token,
      );

      localStorage.setItem(
        'user',
        JSON.stringify(data.user),
      );

      window.location.href = '/';
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Registration failed.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mada-page min-h-screen bg-transparent px-6 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-500">
            Mada Alalam
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create an account to save your favorite
            articles.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              placeholder="Repeat your password"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Creating account...'
              : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}