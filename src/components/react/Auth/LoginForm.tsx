'use client';

import React, { FormEvent } from 'react';
import '../../styles/pocketcrud.css';

export interface LoginFormProps {
  email?: string;
  password?: string;
  isLoading?: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
  onEmailChange?: (email: string) => void;
  onPasswordChange?: (password: string) => void;
  onSubmit: (data: { email: string; password: string }) => void | Promise<void>;
  emailSlot?: React.ReactNode;
  passwordSlot?: React.ReactNode;
  submitButtonSlot?: React.ReactNode;
  backLinkSlot?: React.ReactNode;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email = '',
  password = '',
  isLoading = false,
  error = '',
  title = 'Admin Login',
  subtitle = 'Access the collection management interface',
  backLink = '/',
  backText = '← Back to site',
  onEmailChange,
  onPasswordChange,
  onSubmit,
  emailSlot,
  passwordSlot,
  submitButtonSlot,
  backLinkSlot,
}) => {
  const [emailState, setEmailState] = React.useState(email);
  const [passwordState, setPasswordState] = React.useState(password);

  React.useEffect(() => {
    setEmailState(email);
  }, [email]);

  React.useEffect(() => {
    setPasswordState(password);
  }, [password]);

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit({ email: emailState, password: passwordState });
  };

  return (
    <div className="pocketcrud-login flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">{title}</h2>
          <p className="mt-2 text-center">{subtitle}</p>
        </div>

        <form className="pc-form" onSubmit={handleSubmit}>
          {error && (
            <div className="pocketcrud-alert pocketcrud-alert-error" data-testid="error-message">
              {error}
            </div>
          )}

          <div className="pc-input-group">
            {emailSlot || (
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={emailState}
                onChange={handleEmailChange}
                disabled={isLoading}
                placeholder="Email address"
                className="pocketcrud-input"
                data-testid="email-input"
              />
            )}
            {passwordSlot || (
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={passwordState}
                onChange={handlePasswordChange}
                disabled={isLoading}
                placeholder="Password"
                className="pocketcrud-input"
                data-testid="password-input"
              />
            )}
          </div>

          <div>
            {submitButtonSlot || (
              <button
                type="submit"
                disabled={isLoading}
                className="pocketcrud-btn pocketcrud-btn-primary pc-btn-full"
                data-testid="login-button"
              >
                {isLoading ? (
                  <span className="pc-loading">
                    <div className="pocketcrud-spinner"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            )}
          </div>

          <div className="pc-links">
            {backLinkSlot || (
              <a href={backLink} className="pc-link">
                {backText}
              </a>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
