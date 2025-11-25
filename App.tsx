import React, { useCallback, useState } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  ReactFlowProvider,
  Panel
} from '@xyflow/react';

import { useFamilyStore } from './store/familyStore';
import CustomNode from './components/CustomNode';
import EditorSidebar from './components/EditorSidebar';
import AICreator from './components/AICreator';
import { Plus, Network, Wand2 } from 'lucide-react';

const nodeTypes = {
  person: CustomNode,
};

function FamilyTreeFlow() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    selectNode,
    addPerson,
    autoLayout
  } = useFamilyStore();

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    event.stopPropagation();
    selectNode(node.id);
  }, [selectNode]);

  return (
    <div className="w-full h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-1.5 rounded-lg">
            <Network className="text-white" size={20} />
          </div>
          <h1 className="font-bold text-slate-800 text-lg">GenFlow</h1>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 ml-2">Beta</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-md transition-colors"
          >
            <Wand2 size={16} />
            AI Assistant
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          fitView
          className="bg-slate-50"
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls showInteractive={false} className="!bg-white !shadow-lg !border-slate-200 !rounded-lg overflow-hidden" />
          <MiniMap 
            nodeColor="#cbd5e1" 
            maskColor="rgba(241, 245, 249, 0.7)"
            className="!bg-white !shadow-lg !border !border-slate-200 !rounded-lg !bottom-4 !left-4" 
            zoomable 
            pannable 
          />
          
          {/* Top Center Controls */}
          <Panel position="top-center" className="bg-white p-1.5 rounded-lg shadow-md border border-slate-200 flex gap-2">
             <button 
              onClick={addPerson}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Add Member
            </button>
            <div className="w-px bg-slate-200 mx-1"></div>
            <button 
              onClick={autoLayout}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Network size={16} />
              Auto Layout
            </button>
          </Panel>
        </ReactFlow>

        <EditorSidebar />
        <AICreator isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FamilyTreeFlow />
    </ReactFlowProvider>
  );
}