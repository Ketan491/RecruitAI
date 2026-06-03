// src/pages/CandidatesPage.tsx
import { Plus, Download, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';

import { CandidateFiltersBar } from '../components/candidate/CandidateFilters';
import { CandidateRow } from '../components/candidate/CandidateRow';
import { UploadZone } from '../components/candidate/UploadZone';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { CandidateRowSkeleton } from '../components/ui/Skeleton';
import { useCandidates } from '../hooks/useCandidates';
import { useCandidateStore } from '../store/candidateStore';

export const CandidatesPage: React.FC = () => {
  const { filters, page, total, selectedIds, toggleSelect, selectAll, clearSelection, setPage } =
    useCandidateStore();
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data, isLoading } = useCandidates(filters, page);
  const candidates = data?.items ?? [];

  const columns = ['', 'Candidate', 'Job', 'Stage', 'Score', 'Source', 'Applied', ''];

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/06">
        <div>
          <p className="text-xs text-text-muted">
            {total.toLocaleString()} total candidates
            {selectedIds.length > 0 && ` · ${selectedIds.length} selected`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button variant="secondary" size="sm" icon={<Download size={13} />}>
                Export CSV
              </Button>
              <Button variant="danger" size="sm" icon={<Trash2 size={13} />}>
                Delete
              </Button>
            </>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={13} />}
            onClick={() => setUploadOpen(true)}
          >
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Filters */}
      <CandidateFiltersBar />

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-bg-secondary/90 backdrop-blur z-10">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide whitespace-nowrap border-b border-white/06"
                >
                  {i === 0 ? (
                    <input
                      type="checkbox"
                      title="Select all candidates"
                      aria-label="Select all candidates"
                      checked={selectedIds.length === candidates.length && candidates.length > 0}
                      onChange={() => (selectedIds.length ? clearSelection() : selectAll())}
                      className="w-4 h-4 rounded border-white/20 bg-bg-tertiary"
                    />
                  ) : (
                    col
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8}>
                    <CandidateRowSkeleton />
                  </td>
                </tr>
              ))
            ) : candidates.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={<Users size={40} />}
                    title="No candidates yet"
                    description="Upload a resume to get started with AI-powered scoring."
                    action={{ label: 'Upload Resume', onClick: () => setUploadOpen(true) }}
                  />
                </td>
              </tr>
            ) : (
              candidates.map((c) => (
                <CandidateRow
                  key={c.id}
                  candidate={c}
                  selected={selectedIds.includes(c.id)}
                  onSelect={toggleSelect}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 25 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/06">
          <span className="text-xs text-text-muted">
            Page {page} of {Math.ceil(total / 25)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!data?.has_more}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Resume" size="sm">
        <UploadZone jobId="" onSuccess={() => setUploadOpen(false)} />
      </Modal>
    </div>
  );
};
