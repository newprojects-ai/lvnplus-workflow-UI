import { useCallback, useRef } from 'react';
import { WorkflowDefinition } from '../types';

interface UseCanvasInteractionsProps {
  workflow: WorkflowDefinition;
  onWorkflowChange: (workflow: WorkflowDefinition) => void;
  selectedElements: string[];
  setSelectedElements: (elements: string[]) => void;
  connectionMode: { active: boolean; fromStepId: string | null };
  setConnectionMode: (mode: { active: boolean; fromStepId: string | null }) => void;
  tempConnection: any;
  setTempConnection: (connection: any) => void;
  scale: number;
  offset: { x: number; y: number };
  setOffset: (offset: { x: number; y: number }) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  isReadOnly: boolean;
}

export const useCanvasInteractions = ({
  workflow,
  onWorkflowChange,
  selectedElements,
  setSelectedElements,
  connectionMode,
  setConnectionMode,
  tempConnection,
  setTempConnection,
  scale,
  offset,
  setOffset,
  canvasRef,
  isReadOnly
}: UseCanvasInteractionsProps) => {
  const isPanning = useRef(false);
  const lastPanPoint = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Start panning
    isPanning.current = true;
    lastPanPoint.current = { x: e.clientX, y: e.clientY };
    
    // Clear selection if clicking on empty space
    setSelectedElements([]);
  }, [setSelectedElements, canvasRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning.current) {
      const deltaX = e.clientX - lastPanPoint.current.x;
      const deltaY = e.clientY - lastPanPoint.current.y;
      
      setOffset({
        x: offset.x + deltaX,
        y: offset.y + deltaY
      });
      
      lastPanPoint.current = { x: e.clientX, y: e.clientY };
    }
  }, [offset, setOffset]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isReadOnly) return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        if (selectedElements.length > 0) {
          const updatedSteps = workflow.steps.filter(step => !selectedElements.includes(step.id));
          const updatedTransitions = workflow.transitions.filter(
            transition => !selectedElements.includes(transition.from) && !selectedElements.includes(transition.to)
          );
          
          onWorkflowChange({
            ...workflow,
            steps: updatedSteps,
            transitions: updatedTransitions
          });
          
          setSelectedElements([]);
        }
        break;
        
      case 'Escape':
        setSelectedElements([]);
        setConnectionMode({ active: false, fromStepId: null });
        setTempConnection(null);
        break;
        
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setSelectedElements(workflow.steps.map(step => step.id));
        }
        break;
    }
  }, [
    isReadOnly,
    selectedElements,
    workflow,
    onWorkflowChange,
    setSelectedElements,
    setConnectionMode,
    setTempConnection
  ]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(3, scale * scaleFactor));
      
      // Zoom towards mouse position
      const scaleChange = newScale / scale;
      const newOffset = {
        x: mouseX - (mouseX - offset.x) * scaleChange,
        y: mouseY - (mouseY - offset.y) * scaleChange
      };
      
      setOffset(newOffset);
      // Note: setScale would be called from parent component
    }
  }, [scale, offset, setOffset, canvasRef]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    handleWheel
  };
};