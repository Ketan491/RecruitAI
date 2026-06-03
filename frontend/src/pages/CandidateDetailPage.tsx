// src/pages/CandidateDetailPage.tsx
import { ArrowLeft, Calendar, Download, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { PageSpinner } from '../components/ui/Spinner';
import { useRescore } from '../hooks/useAI';
import { useCandidate } from '../hooks/useCandidates';
import { reportService } from '../services/report.service';
import { SCORE_COLOR } from '../utils/constants';
import { formatDate, formatRelativeTime } from '../utils/formatters';

type Tab = 'overview' | 'resume' | 'notes' | 'interviews' | 'timeline';

export const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const candidateId = id ?? '';
  const { data: candidate, isLoading } = useCandidate(candidateId);
  const rescore = useRescore(candidateId);

  if (isLoading) return <PageSpinner />;
  if (!candidate) return <div className="p-6 text-text-secondary">Candidate not found.</div>;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'AI Overview' },
    { key: 'resume', label: 'Resume' },
    { key: 'notes', label: `Notes (${candidate.notes.length})` },
    { key: 'interviews', label: `Interviews (${candidate.interviews.length})` },
    { key: 'timeline', label: 'Timeline' },
  ];

  const ai = candidate.ai_score;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={13} />}
            loading={rescore.isPending}
            onClick={() => rescore.mutate()}
          >
            Re-score
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={13} />}
            onClick={() => reportService.downloadCandidateReport(candidateId)}
          >
            Report
          </Button>
          <Button variant="secondary" size="sm" icon={<Calendar size={13} />}>
            Schedule
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-bg-secondary border border-white/06 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-secondary/20 flex items-center justify-center text-2xl font-bold text-accent-secondary font-display shrink-0">
              {candidate.name[0]}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-text-primary">
                {candidate.name}
              </h1>
              <p className="text-text-secondary text-sm mt-0.5">{candidate.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge label={candidate.stage} type="stage" />
                <Badge label={candidate.source} />
                <Badge label={candidate.status} type="status" />
                <span className="text-xs text-text-muted">{formatDate(candidate.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="text-center shrink-0">
            <ScoreBadge score={candidate.overall_score} size="lg" />
            <p className="text-[10px] text-text-muted mt-1">AI Score</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/06 mb-6 flex gap-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && ai && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Breakdown */}
          <div className="bg-bg-secondary border border-white/06 rounded-xl p-5">
            <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
              Score Breakdown
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Skill Match (40pts)', score: ai.breakdown.skill_match.score, max: 40 },
                { label: 'Experience (30pts)', score: ai.breakdown.experience.score, max: 30 },
                { label: 'Education (15pts)', score: ai.breakdown.education.score, max: 15 },
                {
                  label: 'Communication (15pts)',
                  score: ai.breakdown.communication.score,
                  max: 15,
                },
              ].map(({ label, score, max }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-secondary">{label}</span>
                    <span className="font-mono text-text-primary">
                      {score}/{max}
                    </span>
                  </div>
                  <ProgressBar
                    value={(score / max) * 100}
                    color={SCORE_COLOR((score / max) * 100)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary + Strengths/Weaknesses */}
          <div className="flex flex-col gap-4">
            <div className="bg-bg-secondary border border-white/06 rounded-xl p-5">
              <h3 className="font-display text-sm font-semibold text-text-primary mb-2">
                AI Summary
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{ai.summary}</p>
            </div>
            <div className="bg-bg-secondary border border-white/06 rounded-xl p-5">
              <h3 className="font-display text-sm font-semibold text-text-primary mb-3">
                Strengths
              </h3>
              <ul className="flex flex-col gap-1.5">
                {ai.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      ✓
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
              <h3 className="font-display text-sm font-semibold text-text-primary mb-3 mt-4">
                Weaknesses
              </h3>
              <ul className="flex flex-col gap-1.5">
                {ai.weaknesses.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      –
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interview Questions */}
          <div className="lg:col-span-2 bg-bg-secondary border border-white/06 rounded-xl p-5">
            <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
              Interview Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['technical', 'behavioral', 'culture_fit'] as const).map((type) => (
                <div key={type}>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2 capitalize">
                    {type.replace('_', ' ')}
                  </p>
                  <ol className="flex flex-col gap-2">
                    {ai.interview_questions[type].map((q, i) => (
                      <li key={i} className="flex gap-2 text-xs text-text-secondary">
                        <span className="text-accent-primary font-mono shrink-0">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="bg-bg-secondary border border-white/06 rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-text-primary mb-4">Notes</h3>
          {candidate.notes.length === 0 ? (
            <p className="text-sm text-text-muted">No notes yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {candidate.notes.map((note) => (
                <div key={note.id} className="border border-white/06 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">
                      {note.author_name}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatRelativeTime(note.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="bg-bg-secondary border border-white/06 rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-text-primary mb-4">Timeline</h3>
          <div className="flex flex-col gap-3">
            {candidate.timeline.map((entry, i) => (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-accent-primary shrink-0 mt-1.5" />
                  {i < candidate.timeline.length - 1 && (
                    <div className="w-px flex-1 bg-white/08 my-1" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-sm text-text-secondary">
                    <span className="text-text-primary font-medium">{entry.actor_name}</span>{' '}
                    {entry.action}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {formatRelativeTime(entry.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
