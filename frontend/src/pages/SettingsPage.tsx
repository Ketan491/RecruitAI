// src/pages/SettingsPage.tsx
import React, { useState } from 'react';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../store/authStore';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const toast = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [company, setCompany] = useState(user?.company_name ?? '');

  const handleSave = () => {
    // TODO: call API
    toast.success('Settings saved');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-bg-secondary border border-white/06 rounded-2xl p-6 mb-6">
        <h2 className="font-display text-base font-semibold text-text-primary mb-5">Profile</h2>
        <div className="flex flex-col gap-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={user?.email ?? ''} disabled />
          <Input
            label="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <Input label="Role" value={user?.role ?? ''} disabled />
        </div>
        <div className="flex justify-end mt-5">
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-bg-secondary border border-white/06 rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-text-primary mb-3">Danger Zone</h2>
        <p className="text-sm text-text-muted mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <Button variant="danger">Delete Account</Button>
      </div>
    </div>
  );
};
