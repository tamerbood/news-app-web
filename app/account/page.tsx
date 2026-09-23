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

  // تغيير البريد الإلكتروني
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showEmailPassword, setShowEmailPassword] =
    useState(false);

  // تغيير كلمة المرور
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

  // حذف الحساب
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
                'تعذر تغيير البريد الإلكتروني.',
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
        'تم تغيير البريد الإلكتروني بنجاح.',
      );
    } catch (error) {
      setEmailError(
        error instanceof Error
          ? error.message
          : 'تعذر تغيير البريد الإلكتروني.',
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
        'كلمتا المرور الجديدتان غير متطابقتين.',
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
                'تعذر تغيير كلمة المرور.',
        );
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setPasswordMessage(
        'تم تغيير كلمة المرور بنجاح.',
      );
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : 'تعذر تغيير كلمة المرور.',
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
      'هل أنت متأكد من حذف حسابك نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.',
    );

    if (!confirmed) {
      return;
    }

    if (!deletePassword) {
      setDeleteError(
        'أدخل كلمة المرور لحذف حسابك.',
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
                'تعذر حذف الحساب.',
        );
      }

      localStorage.removeItem('user_token');
      localStorage.removeItem('user');

      window.location.href = '/';
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'تعذر حذف الحساب.',
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="mada-page min-h-screen bg-transparent">
        <div className="mada-account-shell">
          <div className="rounded-2xl bg-white p-8 text-center">
            جارٍ تحميل الحساب...
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="mada-page min-h-screen bg-transparent">
      <section className="mada-account-shell">

        {/* Header */}
        <div className="mada-account-header">
          <Link
            href="/"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            العودة إلى الأخبار ←
          </Link>

          <h1 className="mada-listing-title">
            حسابي
          </h1>

          <p className="mada-listing-subtitle">
            إدارة بيانات الحساب وإعدادات الأمان.
          </p>
        </div>

        {/* معلومات الحساب */}
        <section className="mada-account-card">
          <h2 className="text-xl font-bold text-gray-900">
            معلومات الحساب
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
                نوع الحساب
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {user.role}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                عضو منذ
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
        <section className="mada-account-card">
          <h2 className="text-xl font-bold text-gray-900">
            Favorites
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            عرض وإدارة الأخبار التي حفظتها.
          </p>

          <Link
            href="/favorites"
            className="mada-primary-button"
          >
            عرض المفضلة
          </Link>
        </section>

        {/* تغيير البريد الإلكتروني */}
        <section className="mada-account-card">
          <h2 className="text-xl font-bold text-gray-900">
            تغيير البريد الإلكتروني
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
                البريد الإلكتروني الجديد
              </label>

              <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(event) =>
                  setNewEmail(event.target.value)
                }
                required
                className="mada-form-input"
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
                  className="mada-form-input mada-form-input-password"
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
                    ? '🙈'
                    : '👁️'}
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
              className="mada-primary-button"
            >
              {emailLoading
                ? 'جارٍ التغيير...'
                : 'تغيير البريد الإلكتروني'}
            </button>
          </form>
        </section>

        {/* تغيير كلمة المرور */}
        <section className="mada-account-card">
          <h2 className="text-xl font-bold text-gray-900">
            تغيير كلمة المرور
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
                  className="mada-form-input mada-form-input-password"
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
                    ? '🙈'
                    : '👁️'}
                </button>
              </div>
            </div>

            {/* كلمة المرور الجديدة */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                كلمة المرور الجديدة
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
                  className="mada-form-input mada-form-input-password"
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
                    ? '🙈'
                    : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm كلمة المرور الجديدة */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm كلمة المرور الجديدة
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
                  className="mada-form-input mada-form-input-password"
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
                    ? '🙈'
                    : '👁️'}
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
              className="mada-primary-button"
            >
              {passwordLoading
                ? 'جارٍ التغيير...'
                : 'تغيير كلمة المرور'}
            </button>
          </form>
        </section>

        {/* Account */}
        <section className="mada-account-card">
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
                  ? '🙈'
                  : '👁️'}
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
                ? 'جارٍ الحذف...'
                : 'حذف حسابي'}
            </button>
          </div>
        </section>

      </section>
    </main>
  );
}