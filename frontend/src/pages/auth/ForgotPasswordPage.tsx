// src/pages/auth/ForgotPasswordPage.tsx
import { Zap, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/auth.service';
import { isValidEmail } from '../../utils/validators';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error('Enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center shadow-glow">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-text-primary">RecruitAI</span>
        </div>
        <div className="bg-bg-secondary border border-white/08 rounded-2xl p-8 shadow-lg">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="font-display text-xl font-bold text-text-primary mb-2">
                Check your inbox
              </h2>
              <p className="text-sm text-text-muted mb-6">
                If <span className="text-text-primary">{email}</span> is registered, you&apos;ll
                receive a reset link within a few minutes.
              </p>
              <Link to="/login" className="text-accent-primary text-sm hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-text-primary mb-1">
                Forgot password?
              </h2>
              <p className="text-sm text-text-muted mb-6">
                Enter your email and we&apos;ll send a reset link.
              </p>
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="email"
                />
                <Button type="submit" loading={loading} className="w-full">
                  Send reset link
                </Button>
              </form>
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary mt-5 transition-colors"
              >
                <ArrowLeft size={13} /> Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
