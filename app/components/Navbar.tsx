'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const categories = [
  'World',
  'Politics',
  'Business',
  'Technology',
  'Science',
  'Health',
  'Sports',
  'Entertainment',
];

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token =
      localStorage.getItem('user_token');

    const userData =
      localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);

        setLoggedIn(true);
        setEmail(user.email ?? '');
      } catch {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');

    setLoggedIn(false);
    setEmail('');

    window.location.href = '/';
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-bold text-gray-900"
        >
          News App
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-black"
          >
            Home
          </Link>

{loggedIn && (
  <>
    <Link
      href="/favorites"
      className="text-sm font-medium text-gray-700 hover:text-black"
    >
      Favorites
    </Link>

    <Link
      href="/account"
      className="text-sm font-medium text-gray-700 hover:text-black"
    >
      Account
    </Link>
  </>
)}

          <div className="group relative">
            <button
              type="button"
              className="relative z-10 py-2 text-sm font-medium text-gray-700 hover:text-black"
            >
              Categories
            </button>

            <div className="invisible absolute right-0 top-full z-50 w-48 pt-1 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-lg border bg-white p-2 shadow-lg">
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/categories?category=${encodeURIComponent(category)}`}
                    className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </div>

{loggedIn ? (
  <>
    <span className="text-sm font-medium text-gray-600">
      {email}
    </span>

    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      Logout
    </button>
  </>
) : (
  <>
    <Link
      href="/login"
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
    >
      Login
    </Link>

    <Link
      href="/register"
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Register
    </Link>
  </>
)}

          <Link
            href="/admin/login"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </nav>
  );
}