// src/pages/JobsPage.tsx
import { Plus, Briefcase, MapPin, Clock, Users } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageSpinner } from '../components/ui/Spinner';
import { useJobs, useDeleteJob, useCreateJob } from '../hooks/useJobs';
import { formatRelativeTime } from '../utils/formatters';

import type { Job, JobFormData } from '../types/job.types';

const defaultForm: JobFormData = {
  title: '',
  department: '',
  location: '',
  employment_type: 'Full-time',
  description: '',
  required_skills: [],
  required_experience_years: 2,
  status: 'Draft',
};

export const JobsPage: React.FC = () => {
  const { data, isLoading } = useJobs();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<JobFormData>(defaultForm);
  const [skillInput, setSkillInput] = useState('');

  const jobs: Job[] = data?.items ?? [];

  const handle =
    (field: keyof JobFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.required_skills.includes(s)) {
      setForm((f) => ({ ...f, required_skills: [...f.required_skills, s] }));
    }
    setSkillInput('');
  };

  const removeSkill = (s: string) =>
    setForm((f) => ({ ...f, required_skills: f.required_skills.filter((x) => x !== s) }));

  const handleCreate = async () => {
    await createJob.mutateAsync(form);
    setCreateOpen(false);
    setForm(defaultForm);
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-text-muted">{jobs.length} open positions</p>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={13} />}
          onClick={() => setCreateOpen(true)}
        >
          New Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={40} />}
          title="No jobs yet"
          description="Create your first job posting to start collecting applications."
          action={{ label: 'Create Job', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-bg-secondary border border-white/06 rounded-xl p-5 hover:border-accent-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/15 flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-accent-primary" />
                </div>
                <Badge label={job.status} />
              </div>
              <h3 className="font-display font-semibold text-text-primary mb-1 group-hover:text-accent-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-xs text-text-muted mb-3">{job.department}</p>
              <div className="flex flex-wrap gap-3 text-xs text-text-muted mb-4">
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {job.employment_type}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {job.applicant_count} applicants
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {job.required_skills.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary border border-accent-primary/20"
                  >
                    {s}
                  </span>
                ))}
                {job.required_skills.length > 4 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/06 text-text-muted">
                    +{job.required_skills.length - 4}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted border-t border-white/06 pt-3">
                <span>{formatRelativeTime(job.created_at)}</span>
                <Button variant="ghost" size="sm" onClick={() => deleteJob.mutate(job.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Job"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={createJob.isPending} onClick={handleCreate}>
              Create
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Job Title"
            placeholder="e.g. Senior React Engineer"
            value={form.title}
            onChange={handle('title')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department"
              placeholder="Engineering"
              value={form.department}
              onChange={handle('department')}
            />
            <Input
              label="Location"
              placeholder="Remote / Pune"
              value={form.location}
              onChange={handle('location')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Employment Type</label>
              <select
                className="h-9 px-3 rounded-md bg-bg-tertiary border border-white/10 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
                value={form.employment_type}
                onChange={handle('employment_type')}
              >
                {['Full-time', 'Part-time', 'Contract', 'Internship'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <Input
              label="Min. Experience (years)"
              type="number"
              min={0}
              value={form.required_experience_years}
              onChange={(e) =>
                setForm((f) => ({ ...f, required_experience_years: Number(e.target.value) }))
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Job Description</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 rounded-md bg-bg-tertiary border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary resize-none"
              placeholder="Describe the role, responsibilities, and expectations…"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-secondary">Required Skills</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill…"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button variant="secondary" onClick={addSkill}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.required_skills.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-accent-primary/12 text-accent-primary border border-accent-primary/25"
                >
                  {s}
                  <button onClick={() => removeSkill(s)} className="hover:text-red-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
