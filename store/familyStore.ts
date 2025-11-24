import { create } from 'zustand';
import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from '@xyflow/react';
import dagre from 'dagre';
import { FamilyNode, FamilyEdge, PersonData, Gender } from '../types';
import { INITIAL_NODES, NODE_WIDTH, NODE_HEIGHT } from '../constants';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FamilyState {
  nodes: FamilyNode[];
  edges: FamilyEdge[];
  selectedNodeId: string | null;

  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addPerson: () => void;
  addSpouse: (nodeId: string) => void;
  addChild: (nodeId: string) => void;
  updatePerson: (id: string, data: Partial<PersonData>) => void;
  deletePerson: (id: string) => void;
  selectNode: (id: string | null) => void;
  setGraph: (nodes: FamilyNode[], edges: FamilyEdge[]) => void;
  autoLayout: () => void;
}

const getLayoutedElements = (nodes: FamilyNode[], edges: FamilyEdge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    // Exclude spouse edges from the hierarchical layout to prevent cycles and strict ranking.
    // We rely on shared children to keep parents somewhat close, or manual adjustment.
    if (edge.data?.isSpouse) return;
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    // If a node was part of the graph (connected via non-spouse edges), use its position.
    // If it was isolated (only spouse connected), Dagre still assigns a position, often (0,0) or stacked.
    // We accept the Dagre position for now; user can move it.
    const nodeWithPosition = dagreGraph.node(node.id);
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      nodes: INITIAL_NODES as FamilyNode[],
      edges: [],
      selectedNodeId: null,

      onNodesChange: (changes) =>
        set({
          nodes: applyNodeChanges(changes, get().nodes) as FamilyNode[],
        }),

      onEdgesChange: (changes) =>
        set({
          edges: applyEdgeChanges(changes, get().edges),
        }),

      onConnect: (connection) =>
        set({
          // Preserve the sourceHandle and targetHandle from the connection object
          edges: addEdge({ 
            ...connection, 
            type: 'smoothstep', 
            markerEnd: { type: MarkerType.ArrowClosed } 
          }, get().edges),
        }),

      addPerson: () => {
        const id = crypto.randomUUID();
        const newNode: FamilyNode = {
          id,
          type: 'person',
          position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 },
          data: {
            name: 'New Member',
            gender: Gender.Other,
          },
        };
        set({ nodes: [...get().nodes, newNode], selectedNodeId: id });
      },

      addSpouse: (nodeId) => {
        const { nodes, edges } = get();
        const sourceNode = nodes.find((n) => n.id === nodeId);
        if (!sourceNode) return;

        const id = crypto.randomUUID();
        // Guess opposite gender for convenience
        const targetGender = sourceNode.data.gender === Gender.Male ? Gender.Female : 
                           sourceNode.data.gender === Gender.Female ? Gender.Male : Gender.Other;

        const newNode: FamilyNode = {
          id,
          type: 'person',
          // Place next to the spouse
          position: { x: sourceNode.position.x + 300, y: sourceNode.position.y },
          data: {
            name: 'Spouse',
            gender: targetGender,
          },
        };

        const newEdge: FamilyEdge = {
          id: `e-${sourceNode.id}-${id}`,
          source: sourceNode.id,
          target: id,
          type: 'straight',
          animated: false,
          style: { stroke: '#db2777', strokeWidth: 2, strokeDasharray: '5,5' },
          data: { isSpouse: true, label: 'Married' },
          label: 'Married',
          labelStyle: { fill: '#db2777', fontWeight: 700, fontSize: 12 },
          labelBgStyle: { fill: '#fce7f3' },
          sourceHandle: 'right', // Connect from right side
          targetHandle: 'left'   // Connect to left side
        };

        set({
          nodes: [...nodes, newNode],
          edges: [...edges, newEdge],
          selectedNodeId: id,
        });
      },

      addChild: (nodeId) => {
        const { nodes, edges } = get();
        const parentNode = nodes.find((n) => n.id === nodeId);
        if (!parentNode) return;

        const childId = crypto.randomUUID();
        const childNode: FamilyNode = {
          id: childId,
          type: 'person',
          // Place below parent
          position: { x: parentNode.position.x, y: parentNode.position.y + 200 },
          data: {
            name: 'Child',
            gender: Gender.Other,
          },
        };

        const newEdges: FamilyEdge[] = [];

        // 1. Edge from selected parent (Bottom to Top)
        newEdges.push({
          id: `e-${parentNode.id}-${childId}`,
          source: parentNode.id,
          target: childId,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          sourceHandle: 'bottom',
          targetHandle: 'top'
        });

        // 2. Check for spouse logic
        // If the selected node is connected to someone via a 'spouse' edge, 
        // link that spouse to the child as well.
        const spouseEdge = edges.find(
          (e) => (e.source === nodeId || e.target === nodeId) && e.data?.isSpouse
        );

        if (spouseEdge) {
          const spouseId = spouseEdge.source === nodeId ? spouseEdge.target : spouseEdge.source;
          newEdges.push({
            id: `e-${spouseId}-${childId}`,
            source: spouseId,
            target: childId,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            sourceHandle: 'bottom',
            targetHandle: 'top'
          });
        }

        set({
          nodes: [...nodes, childNode],
          edges: [...edges, ...newEdges],
          selectedNodeId: childId,
        });
      },

      updatePerson: (id, newData) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
          ),
        });
      },

      deletePerson: (id) => {
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: null,
        });
      },

      selectNode: (id) => set({ selectedNodeId: id }),

      setGraph: (nodes, edges) => {
        const { nodes: layoutNodes, edges: layoutEdges } = getLayoutedElements(nodes, edges);
        set({ nodes: layoutNodes, edges: layoutEdges });
      },

      autoLayout: () => {
        const { nodes, edges } = get();
        const { nodes: layoutNodes, edges: layoutEdges } = getLayoutedElements(nodes, edges);
        set({ nodes: layoutNodes, edges: layoutEdges });
      },
    }),
    {
      name: 'family-tree-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);