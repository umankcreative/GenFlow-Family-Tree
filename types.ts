import { Node, Edge } from '@xyflow/react';

export enum Gender {
  Male = 'MALE',
  Female = 'FEMALE',
  Other = 'OTHER'
}

export interface PersonData {
  name: string;
  birthDate?: string;
  deathDate?: string;
  gender: Gender;
  bio?: string;
  photoUrl?: string;
}

// React Flow Node type extension
export type FamilyNode = Node<PersonData, 'person'>;

export interface FamilyEdgeData extends Record<string, unknown> {
  isSpouse?: boolean;
  label?: string;
}

export type FamilyEdge = Edge<FamilyEdgeData>;

export interface AISuggestionResponse {
  nodes: {
    id: string;
    label: string; // Map to name
    gender: string;
    birthDate?: string;
    bio?: string;
  }[];
  edges: {
    source: string;
    target: string;
    label?: string; // e.g. "Son", "Daughter"
  }[];
}