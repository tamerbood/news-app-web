'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Change Email
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showEmailPassword, setShowEmailPassword] =
    useState(false);

  // Change Password
  const [currentPassword, setCurrentPassword] =
    useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [passwordLoading, setPasswordLoading] =
    useState(false);
  const [passwordMessage, setPasswordMessage] =
    useState('');
  const [passwordError, setPasswordError] =
    useState('');

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // Delete Account
  const [deletePassword, setDeletePassword] =
    useState('');
  const [deleteLoading, setDeleteLoading] =
    useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeletePassword, setShowDeletePassword] =
    useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const token =
          localStorage.getItem('user_token');

        if (!token) {
          window.location.href = '/login';
          return;
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error(
            'NEXT_PUBLIC_API_URL is not configured.',
          );
        }

const response = await fetch(
  `${apiUrl}/auth/me`,
  {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);

const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem('user_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }

        setUser(data);

        localStorage.setItem(
          'user',
          JSON.stringify(data),
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleChangeEmail(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setEmailLoading(true);
    setEmailMessage('');
    setEmailError('');

    try {
      const token =
        localStorage.getItem('user_token');

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          'NEXT_PUBLIC_API_URL is not configured.',
        );
      }

      const response = await fetch(
        `${apiUrl}/auth/me/email`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newEmail,
            currentPassword: emailPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ??
                'Failed to change email.',
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

      setUser(data.user);
      setNewEmail('');
      setEmailPassword('');
      setShowEmailPassword(false);

      setEmailMessage(
        'Email changed successfully.',
      );
    } catch (error) {
      setEmailError(
        error instanceof Error
          ? error.message
          : 'Failed to change email.',
      );
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordLoading(true);
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError(
        'New passwords do not match.',
      );
      setPasswordLoading(false);
      return;
    }

    try {
      const token =
        localStorage.getItem('user_token');

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          'NEXT_PUBLIC_API_URL is not configured.',
        );
      }

      const response = await fetch(
        `${apiUrl}/auth/me/password`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ??
                'Failed to change password.',
        );
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setPasswordMessage(
        'Password changed successfully.',
      );
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : 'Failed to change password.',
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');

    window.location.href = '/';
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
    );

    if (!confirmed) {
      return;
    }

    if (!deletePassword) {
      setDeleteError(
        'Enter your password to delete your account.',
      );
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      const token =
        localStorage.getItem('user_token');

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          'NEXT_PUBLIC_API_URL is not configured.',
        );
      }

      const response = await fetch(
        `${apiUrl}/auth/me`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ??
                'Failed to delete account.',
        );
      }

      localStorage.removeItem('user_token');
      localStorage.removeItem('user');

      window.location.href = '/';
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Failed to delete account.',
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-2xl bg-white p-8 text-center">
            Loading account...
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="mx-auto max-w-4xl px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            â† Back to News
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            My Account
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your account and security settings.
          </p>
        </div>

        {/* Account Information */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Account Information
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Account Type
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {user.role}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Member Since
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {new Date(
                  user.createdAt,
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>

        {/* Favorites */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Favorites
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            View and manage your saved articles.
          </p>

          <Link
            href="/favorites"
            className="mt-5 inline-block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            View My Favorites
          </Link>
        </section>

        {/* Change Email */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Change Email
          </h2>

          <form
            onSubmit={handleChangeEmail}
            className="mt-5 space-y-4"
          >
            <div>
              <label
                htmlFor="newEmail"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                New Email
              </label>

              <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(event) =>
                  setNewEmail(event.target.value)
                }
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="emailPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>

              <div className="relative">
                <input
                  id="emailPassword"
                  type={
                    showEmailPassword
                      ? 'text'
                      : 'password'
                  }
                  value={emailPassword}
                  onChange={(event) =>
                    setEmailPassword(
                      event.target.value,
                    )
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-black"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowEmailPassword(
                      (current) => !current,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  aria-label={
                    showEmailPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showEmailPassword
                    ? 'ðŸ™ˆ'
                    : 'ðŸ‘ï¸'}
                </button>
              </div>
            </div>

            {emailMessage && (
              <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                {emailMessage}
              </div>
            )}

            {emailError && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {emailError}
              </div>
            )}

            <button
              type="submit"
              disabled={emailLoading}
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {emailLoading
                ? 'Changing...'
                : 'Change Email'}
            </button>
          </form>
        </section>

        {/* Change Password */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Change Password
          </h2>

          <form
            onSubmit={handleChangePassword}
            className="mt-5 space-y-4"
          >

            {/* Current Password */}
            <div>
              <label
                htmlFor="changeCurrentPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>

              <div className="relative">
                <input
                  id="changeCurrentPassword"
                  type={
                    showCurrentPassword
                      ? 'text'
                      : 'password'
                  }
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value,
                    )
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-black"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      (current) => !current,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  aria-label={
                    showCurrentPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showCurrentPassword
                    ? 'ðŸ™ˆ'
                    : 'ðŸ‘ï¸'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={
                    showNewPassword
                      ? 'text'
                      : 'password'
                  }
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value,
                    )
                  }
                  minLength={6}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-black"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      (current) => !current,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  aria-label={
                    showNewPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showNewPassword
                    ? 'ðŸ™ˆ'
                    : 'ðŸ‘ï¸'}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  minLength={6}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-black"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword
                    ? 'ðŸ™ˆ'
                    : 'ðŸ‘ï¸'}
                </button>
              </div>
            </div>

            {passwordMessage && (
              <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {passwordLoading
                ? 'Changing...'
                : 'Change Password'}
            </button>
          </form>
        </section>

        {/* Account */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Account
          </h2>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </section>

        {/* Danger Zone */}
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-bold text-red-700">
            Danger Zone
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-600">
            Deleting your account is permanent. Your
            account and saved favorites will be deleted.
          </p>

          <div className="mt-5 max-w-md">
            <label
              htmlFor="deletePassword"
              className="mb-2 block text-sm font-medium text-red-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="deletePassword"
                type={
                  showDeletePassword
                    ? 'text'
                    : 'password'
                }
                value={deletePassword}
                onChange={(event) =>
                  setDeletePassword(
                    event.target.value,
                  )
                }
                placeholder="Enter your password"
                className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 pr-12 outline-none focus:border-red-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowDeletePassword(
                    (current) => !current,
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                aria-label={
                  showDeletePassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showDeletePassword
                  ? 'ðŸ™ˆ'
                  : 'ðŸ‘ï¸'}
              </button>
            </div>

            {deleteError && (
              <div className="mt-4 rounded-xl bg-white p-4 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteLoading
                ? 'Deleting...'
                : 'Delete My Account'}
            </button>
          </div>
        </section>

      </section>
    </main>
  );
}