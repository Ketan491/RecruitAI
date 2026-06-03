// src/pages/auth/ResetPasswordPage.tsx
import { Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/auth.service';
import { isValidPassword } from '../../utils/validators';

export const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { valid, message } = isValidPassword(password);
    if (!valid) {
      toast.error(message ?? 'Password does not meet requirements');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => {
        void navigate('/login');
      }, 2000);
    } catch {
      toast.error('Reset link is invalid or expired. Please request a new one.');
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
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="font-display text-xl font-bold text-text-primary mb-2">
                Password reset!
              </h2>
              <p className="text-sm text-text-muted">Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-text-primary mb-1">
                Set new password
              </h2>
              <p className="text-sm text-text-muted mb-6">
                Must be 8+ characters with an uppercase letter and number.
              </p>
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <Input
                  label="New password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <Button type="submit" loading={loading} className="w-full">
                  Reset password
                </Button>
              </form>
              <Link
                to="/login"
                className="block text-center text-xs text-text-muted hover:text-text-primary mt-5 transition-colors"
              >
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
