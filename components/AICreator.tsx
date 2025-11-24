import React, { useState } from 'react';
import { generateTreeFromText } from '../services/geminiService';
import { useFamilyStore } from '../store/familyStore';
import { Wand2, Loader2, X } from 'lucide-react';
import { Gender, FamilyNode, FamilyEdge } from '../types';
import { MarkerType } from '@xyflow/react';

interface AICreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const AICreator: React.FC<AICreatorProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setGraph = useFamilyStore(state => state.setGraph);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await generateTreeFromText(input);
      
      // Convert AI response to React Flow format
      const newNodes: FamilyNode[] = data.nodes.map(n => ({
        id: n.id,
        type: 'person',
        position: { x: 0, y: 0 }, // Position will be fixed by autoLayout
        data: {
          name: n.label,
          gender: n.gender as Gender,
          birthDate: n.birthDate,
          bio: n.bio
        }
      }));

      const newEdges: FamilyEdge[] = data.edges.map((e, idx) => ({
        id: `e-${idx}-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        sourceHandle: 'bottom', // Default for AI: Hierarchy flow
        targetHandle: 'top'
      }));

      setGraph(newNodes, newEdges);
      onClose();
      setInput('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate tree. Please check API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 bg-brand-50 border-b border-brand-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-brand-700">
            <Wand2 size={20} />
            <h2 className="font-semibold">AI Family Generator</h2>
          </div>
          <button onClick={onClose} className="text-brand-400 hover:text-brand-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Describe your family history, and we'll build the tree automatically using Gemini AI.
          </p>
          
          <textarea
            className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm"
            placeholder="Example: I have a father named John (born 1960) and a mother named Jane. I have a sister named Emily who has a son named Tom..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />

          {error && (
            <div className="mt-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              Generate Tree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICreator;