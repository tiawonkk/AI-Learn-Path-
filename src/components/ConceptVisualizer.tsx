'use client';

import { Sparkles } from 'lucide-react';
import { DataMlVisualizer } from '@/components/visualizers/DataMlVisualizers';
import { DlAgenticVisualizer } from '@/components/visualizers/DlAgenticVisualizers';
import { PythonVisualizer } from '@/components/visualizers/PythonVisualizers';
import type { DiagramId } from '@/types/curriculum';

interface ConceptVisualizerProps {
  diagramId: DiagramId;
}

export function ConceptVisualizer({ diagramId }: ConceptVisualizerProps) {
  return (
    <section
      aria-label="Interactive Concept Visualizer"
      className="rounded-2xl border border-border-soft bg-surface-subtle p-5"
    >
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
          <Sparkles className="h-4 w-4 text-brand" strokeWidth={2.2} />
          <span>Interactive Visual Lab</span>
        </div>
        <span className="rounded-full bg-surface px-2.5 py-0.5 font-mono text-[11px] font-medium text-text-muted">
          Try changing values
        </span>
      </div>

      {diagramId.startsWith('py-') ? (
        <PythonVisualizer diagramId={diagramId} />
      ) : diagramId.startsWith('np-') ||
        diagramId.startsWith('pd-') ||
        diagramId.startsWith('ml-') ? (
        <DataMlVisualizer diagramId={diagramId} />
      ) : (
        <DlAgenticVisualizer diagramId={diagramId} />
      )}
    </section>
  );
}
