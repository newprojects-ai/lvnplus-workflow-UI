import { useState, useCallback } from 'react';
import { WorkflowTransition } from '../types';

interface ConnectionMode {
  active: boolean;
  fromStepId: string | null;
}

interface TempConnection extends Partial<WorkflowTransition> {
  from: string;
  to?: string;
}

export const useCanvasState = () => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>({ active: false, fromStepId: null });
  const [tempConnection, setTempConnection] = useState<TempConnection | null>(null);

  const resetSelection = useCallback(() => {
    setSelectedElements([]);
  }, []);

  const addToSelection = useCallback((elementId: string) => {
    setSelectedElements(prev => [...prev, elementId]);
  }, []);

  const removeFromSelection = useCallback((elementId: string) => {
    setSelectedElements(prev => prev.filter(id => id !== elementId));
  }, []);

  const toggleSelection = useCallback((elementId: string) => {
    setSelectedElements(prev => 
      prev.includes(elementId) 
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
    );
  }, []);

  return {
    scale,
    setScale,
    offset,
    setOffset,
    selectedElements,
    setSelectedElements,
    resetSelection,
    addToSelection,
    removeFromSelection,
    toggleSelection,
    connectionMode,
    setConnectionMode,
    tempConnection,
    setTempConnection
  };
};