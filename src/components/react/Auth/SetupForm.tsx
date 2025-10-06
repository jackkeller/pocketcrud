'use client';

import React, { FormEvent } from 'react';
import '../../styles/pocketcrud.css';

export interface SetupFormProps {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  isLoading?: boolean;
  error?: string;
  success?: string;
  title?: string;
  subtitle?: string;
  minPasswordLength?: number;
  loginLink?: string;
  loginText?: string;
  backLink?: string;
  backText?: string;
  onEmailChange?: (email: string) => void;
  onPasswordChange?: (password: string) => void;
  onPasswordConfirmChange?: (passwordConfirm: string) => void;
  onSubmit: (data: { email: string; password: string; passwordConfirm: string }) => void | Promise<void>;
  emailSlot?: React.ReactNode;
  passwordSlot?: React.ReactNode;
  passwordConfirmSlot?: React.ReactNode;
  submitButtonSlot?: React.ReactNode;
  loginLinkSlot?: React.ReactNode;
  backLinkSlot?: React.ReactNode;
  instructionsSlot?: React.ReactNode;
}

export const SetupForm: React.FC<SetupFormProps> = ({
  email = '',
  password = '',
  passwordConfirm = '',
  isLoading = false,
  error = '',
  success = '',
  title = 'Admin Setup',
  subtitle = 'Create an admin user to access the collection management interface',
  minPasswordLength = 10,
  loginLink = '/admin/login',
  loginText = 'Already have admin account? Sign in',
  backLink = '/',
  backText = '← Back to site',
  onEmailChange,
  onPasswordChange,
  onPasswordConfirmChange,
  onSubmit,
  emailSlot,
  passwordSlot,
  passwordConfirmSlot,
  submitButtonSlot,
  loginLinkSlot,
  backLinkSlot,
  instructionsSlot,
}) => {
  const [emailState, setEmailState] = React.useState(email);
  const [passwordState, setPasswordState] = React.useState(password);
  const [passwordConfirmState, setPasswordConfirmState] = React.useState(passwordConfirm);

  React.useEffect(() => {
    setEmailState(email);
  }, [email]);

  React.useEffect(() => {
    setPasswordState(password);
  }, [password]);

  React.useEffect(() => {
    setPasswordConfirmState(passwordConfirm);
  }, [passwordConfirm]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailState(value);
    onEmailChange?.(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordState(value);
    onPasswordChange?.(value);
  };

  const handlePasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordConfirmState(value);
    onPasswordConfirmChange?.(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit({
      email: emailState,
      password: passwordState,
      passwordConfirm: passwordConfirmState,
    });
  };

  return (
    <div className="pocketcrud-setup flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">{title}</h2>
          <p className="mt-2 text-center">{subtitle}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="pocketcrud-alert pocketcrud-alert-error" data-testid="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="pocketcrud-alert pocketcrud-alert-success" data-testid="success-message">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {emailSlot || (
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={emailState}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter admin email"
                  data-testid="email-input"
                />
              </div>
            )}

            {passwordSlot || (
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={passwordState}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder={`Enter password (min ${minPasswordLength} characters)`}
                  data-testid="password-input"
                />
              </div>
            )}

            {passwordConfirmSlot || (
              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={passwordConfirmState}
                  onChange={handlePasswordConfirmChange}
                  disabled={isLoading}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Confirm password"
                  data-testid="password-confirm-input"
                />
              </div>
            )}
          </div>

          <div>
            {submitButtonSlot || (
              <button
                type="submit"
                disabled={isLoading}
                className="pocketcrud-btn pocketcrud-btn-primary pc-btn-full"
                data-testid="setup-button"
              >
                {isLoading ? (
                  <span className="pc-loading">
                    <div className="pocketcrud-spinner"></div>
                    Creating Admin...
                  </span>
                ) : (
                  'Create Admin User'
                )}
              </button>
            )}
          </div>

          <div className="space-y-2 text-center">
            {loginLinkSlot || (
              <a href={loginLink} className="pc-link">
                {loginText}
              </a>
            )}
            <br />
            {backLinkSlot || (
              <a href={backLink} className="pc-link-secondary">
                {backText}
              </a>
            )}
          </div>
        </form>

        {instructionsSlot || (
          <div className="pocketcrud-alert pocketcrud-alert-warning pc-instructions">
            <h3 className="pc-instructions-title">Setup Instructions</h3>
            <div className="pc-instructions-body">
              <p>
                This will create a new admin user in your PocketBase instance. The admin user will have full access to
                the collection management interface.
              </p>
              <p className="mt-2">
                <strong>Note:</strong> You only need to do this once. After the admin user is created, you can log in
                normally.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupForm;
