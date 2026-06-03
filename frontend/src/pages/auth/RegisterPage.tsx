// src/pages/auth/RegisterPage.tsx
import { Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/auth.service';
import { isValidEmail } from '../../utils/validators';

interface FormErrors {
  name?: string;
  email?: string;
  company_name?: string;
  password?: string;
}

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', company_name: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handle = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    // Clear error for field on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // FIX 3: Add proper validation to register form
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!isValidEmail(form.email)) e.email = 'Invalid email address';
    if (!form.company_name.trim()) e.company_name = 'Company name is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: unknown) {
      // FIX 3b: Show specific server error message if available
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. This email may already be in use.';
      toast.error(msg);
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

        <div className="bg-bg-secondary border border-white/10 rounded-2xl p-8 shadow-lg">
          <h2 className="font-display text-xl font-bold text-text-primary mb-1">Create account</h2>
          <p className="text-sm text-text-muted mb-6">Start your free 14-day trial</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="Full name"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handle('name')}
              error={errors.name}
              autoFocus
              autoComplete="name"
            />
            <Input
              label="Work email"
              type="email"
              placeholder="jane@company.com"
              value={form.email}
              onChange={handle('email')}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Company name"
              placeholder="Acme Corp"
              value={form.company_name}
              onChange={handle('company_name')}
              error={errors.company_name}
              autoComplete="organization"
            />
            <Input
              label="Password"
              type="password"
              placeholder="8+ characters"
              value={form.password}
              onChange={handle('password')}
              error={errors.password}
              autoComplete="new-password"
            />
            <Button type="submit" loading={loading} className="w-full mt-1">
              Create account
            </Button>
          </form>

          <p className="text-center text-xs text-text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
