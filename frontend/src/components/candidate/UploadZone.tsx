// src/components/candidate/UploadZone.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { useToast } from '../../hooks/useToast';
import { candidateService } from '../../services/candidate.service';
import { validateResumeFile } from '../../utils/validators';
import { Button } from '../ui/Button';

interface UploadZoneProps {
  jobId: string;
  onSuccess?: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ jobId, onSuccess }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const toast = useToast();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (formData: FormData) => candidateService.uploadResume(formData),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Resume uploaded and AI scoring started!');
      setFile(null);
      onSuccess?.();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Upload failed');
    },
  });

  const handleFile = useCallback(
    (f: File) => {
      const validation = validateResumeFile(f);
      if (!validation.valid) {
        toast.error(validation.message ?? 'Invalid resume file');
        return;
      }
      setFile(f);
    },
    [toast],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleSubmit = () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('resume', file);
    fd.append('job_id', jobId);
    mutation.mutate(fd);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!file) document.getElementById('resume-input')?.click();
        }}
        className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-6 text-center
          ${dragOver ? 'border-accent-primary bg-accent-primary/08' : 'border-white/15 hover:border-accent-primary/50 hover:bg-white/02'}`}
      >
        <input
          id="resume-input"
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
        {file ? (
          <>
            <CheckCircle size={32} className="text-emerald-400" />
            <div>
              <p className="font-medium text-text-primary text-sm">{file.name}</p>
              <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="absolute top-3 right-3 text-text-muted hover:text-text-primary"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-accent-primary/15 flex items-center justify-center">
              <Upload size={22} className="text-accent-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary text-sm">Drop resume here</p>
              <p className="text-xs text-text-muted mt-0.5">PDF or DOCX · Max 5MB</p>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <FileText size={14} /> <span className="text-xs">or click to browse</span>
            </div>
          </>
        )}
      </div>
      {file && (
        <Button
          variant="primary"
          loading={mutation.isPending}
          onClick={handleSubmit}
          className="w-full"
        >
          {mutation.isPending ? 'Uploading & Scoring…' : 'Upload & Score with AI'}
        </Button>
      )}
    </div>
  );
};
