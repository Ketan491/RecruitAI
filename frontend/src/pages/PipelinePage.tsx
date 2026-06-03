// src/pages/PipelinePage.tsx
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '../components/ui/Badge';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { PageSpinner } from '../components/ui/Spinner';
import { candidateService } from '../services/candidate.service';
import { useCandidateStore } from '../store/candidateStore';
import { PIPELINE_STAGES, STAGE_COLORS } from '../utils/constants';
import { formatRelativeTime } from '../utils/formatters';

import type { CandidatePreview } from '../types/candidate.types';

// ── Sortable Card ─────────────────────────────────────────────────────────────
const SortableCard: React.FC<{ candidate: CandidatePreview; isDragging?: boolean }> = ({
  candidate,
  isDragging = false,
}) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, active } = useSortable({
    id: candidate.id,
    data: { candidate },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: active?.id === candidate.id ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !active && navigate(`/candidates/${candidate.id}`)}
      className={`bg-bg-secondary border rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:border-accent-primary/40 transition-all group select-none
        ${isDragging ? 'border-accent-primary shadow-glow rotate-1' : 'border-white/06'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors leading-tight pr-2">
          {candidate.name}
        </p>
        <ScoreBadge score={candidate.overall_score} size="sm" />
      </div>
      <p className="text-xs text-text-muted mb-2 truncate">{candidate.job_title}</p>
      <div className="flex items-center justify-between">
        <Badge label={candidate.source} size="sm" />
        <span className="text-[10px] text-text-muted">
          {formatRelativeTime(candidate.created_at)}
        </span>
      </div>
    </div>
  );
};

// ── Droppable Column ─────────────────────────────────────────────────────────
const PipelineColumn: React.FC<{
  stage: string;
  candidates: CandidatePreview[];
  isOver: boolean;
}> = ({ stage, candidates, isOver }) => {
  const stageColor = STAGE_COLORS[stage] ?? '#6366F1';
  const ids = candidates.map((c) => c.id);

  return (
    <div className="flex flex-col min-w-[230px] max-w-[230px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stageColor }} />
          <span className="text-xs font-semibold text-text-secondary">{stage}</span>
        </div>
        <span
          className="text-xs font-bold rounded-full px-2 py-0.5 shrink-0"
          style={{ backgroundColor: `${stageColor}22`, color: stageColor }}
        >
          {candidates.length}
        </span>
      </div>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          className={`flex flex-col gap-2 flex-1 min-h-[120px] rounded-xl p-2 transition-colors ${
            isOver ? 'bg-accent-primary/06 ring-1 ring-accent-primary/30' : 'bg-transparent'
          }`}
        >
          {candidates.map((c) => (
            <SortableCard key={c.id} candidate={c} />
          ))}
          {candidates.length === 0 && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/06 rounded-lg min-h-[80px]">
              <span className="text-xs text-text-muted">Drop here</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

// ── Main Pipeline Page ─────────────────────────────────────────────────────────
export const PipelinePage: React.FC = () => {
  const qc = useQueryClient();
  const { pipeline, setPipeline } = useCandidateStore();
  const [activeCandidate, setActiveCandidate] = useState<CandidatePreview | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => candidateService.getPipeline(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (data) setPipeline(data);
  }, [data, setPipeline]);

  const moveMutation = useMutation({
    mutationFn: candidateService.moveInPipeline,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pipeline'] }),
  });

  // Build lookup: candidateId → current stage
  const candidateStageMap = new Map<string, string>();
  pipeline.forEach((g) => g.candidates.forEach((c) => candidateStageMap.set(c.id, g.stage)));

  const getCandidateById = (id: string): CandidatePreview | undefined => {
    for (const g of pipeline) {
      const c = g.candidates.find((x) => x.id === id);
      if (c) return c;
    }
  };

  // Detect which column the drag is over by checking if item id is a stage name
  const getStageFromOver = (overId: string | null): string | null => {
    if (!overId) return null;
    if (PIPELINE_STAGES.includes(overId as (typeof PIPELINE_STAGES)[0])) return overId;
    return candidateStageMap.get(overId) ?? null;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveCandidate(getCandidateById(String(active.id)) ?? null);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverStage(getStageFromOver(over ? String(over.id) : null));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCandidate(null);
    setOverStage(null);
    if (!over) return;

    const candidateId = String(active.id);
    const fromStage = candidateStageMap.get(candidateId);
    const toStage = getStageFromOver(String(over.id));

    if (!fromStage || !toStage || fromStage === toStage) return;

    moveMutation.mutate({
      candidate_id: candidateId,
      from_stage: fromStage,
      to_stage: toStage,
      position: 0,
    });
  };

  if (isLoading) return <PageSpinner />;

  const stageMap = new Map(pipeline.map((g) => [g.stage, g]));
  const visibleStages = PIPELINE_STAGES.filter((s) => s !== 'Rejected');

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="mb-5">
          <p className="text-xs text-text-muted">
            {pipeline.reduce((a, g) => a + g.count, 0)} candidates · drag cards between columns to
            move stages
          </p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 flex-1">
          {visibleStages.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              candidates={stageMap.get(stage)?.candidates ?? []}
              isOver={overStage === stage}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeCandidate && <SortableCard candidate={activeCandidate} isDragging />}
      </DragOverlay>
    </DndContext>
  );
};
