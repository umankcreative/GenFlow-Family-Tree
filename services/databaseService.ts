import { supabase } from './supabaseClient';
import { FamilyNode, FamilyEdge } from '../types';

export interface StoredFamilyTree {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface StoredPerson {
  id: string;
  family_tree_id: string;
  name: string;
  gender: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

export interface StoredRelationship {
  id: string;
  family_tree_id: string;
  source_person_id: string;
  target_person_id: string;
  relationship_type: string;
  created_at: string;
}

export interface StoredPosition {
  id: string;
  family_tree_id: string;
  person_id: string;
  x: number;
  y: number;
}

export const databaseService = {
  // Family Trees
  async createFamilyTree(name: string) {
    const { data, error } = await supabase
      .from('family_trees')
      .insert([{ name }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getFamilyTrees() {
    const { data, error } = await supabase
      .from('family_trees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getFamilyTree(id: string) {
    const { data, error } = await supabase
      .from('family_trees')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateFamilyTree(id: string, updates: Partial<StoredFamilyTree>) {
    const { data, error } = await supabase
      .from('family_trees')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteFamilyTree(id: string) {
    const { error } = await supabase
      .from('family_trees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // People
  async addPerson(familyTreeId: string, name: string, gender: string) {
    const { data, error } = await supabase
      .from('people')
      .insert([{ family_tree_id: familyTreeId, name, gender }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getPeople(familyTreeId: string) {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('family_tree_id', familyTreeId);

    if (error) throw error;
    return data;
  },

  async updatePerson(personId: string, updates: Partial<StoredPerson>) {
    const { data, error } = await supabase
      .from('people')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', personId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deletePerson(personId: string) {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', personId);

    if (error) throw error;
  },

  // Relationships
  async addRelationship(
    familyTreeId: string,
    sourcePerson: string,
    targetPerson: string,
    type: string
  ) {
    const { data, error } = await supabase
      .from('relationships')
      .insert([{
        family_tree_id: familyTreeId,
        source_person_id: sourcePerson,
        target_person_id: targetPerson,
        relationship_type: type,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getRelationships(familyTreeId: string) {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('family_tree_id', familyTreeId);

    if (error) throw error;
    return data;
  },

  async deleteRelationship(relationshipId: string) {
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', relationshipId);

    if (error) throw error;
  },

  // Positions
  async savePosition(familyTreeId: string, personId: string, x: number, y: number) {
    const { data, error } = await supabase
      .from('positions')
      .upsert([{
        family_tree_id: familyTreeId,
        person_id: personId,
        x,
        y,
      }], { onConflict: 'family_tree_id,person_id' })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getPositions(familyTreeId: string) {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('family_tree_id', familyTreeId);

    if (error) throw error;
    return data;
  },

  async saveAllPositions(familyTreeId: string, nodes: FamilyNode[]) {
    const positions = nodes.map((node) => ({
      family_tree_id: familyTreeId,
      person_id: node.id,
      x: node.position.x,
      y: node.position.y,
    }));

    const { error } = await supabase
      .from('positions')
      .upsert(positions, { onConflict: 'family_tree_id,person_id' });

    if (error) throw error;
  },
};
