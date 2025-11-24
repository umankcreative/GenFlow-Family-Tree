import React from 'react';
import { useFamilyStore } from '../store/familyStore';
import { X, Trash2, Heart, Baby } from 'lucide-react';
import { Gender } from '../types';

const EditorSidebar = () => {
  const selectedNodeId = useFamilyStore((state) => state.selectedNodeId);
  const nodes = useFamilyStore((state) => state.nodes);
  const updatePerson = useFamilyStore((state) => state.updatePerson);
  const deletePerson = useFamilyStore((state) => state.deletePerson);
  const selectNode = useFamilyStore((state) => state.selectNode);
  const addSpouse = useFamilyStore((state) => state.addSpouse);
  const addChild = useFamilyStore((state) => state.addChild);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNodeId || !selectedNode) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updatePerson(selectedNodeId, { [name]: value });
  };

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
        <h2 className="font-semibold text-slate-700">Edit Person</h2>
        <button onClick={() => selectNode(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
          <X size={20} className="text-slate-500" />
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={selectedNode.data.name}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Gender</label>
          <select
            name="gender"
            value={selectedNode.data.gender}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          >
            <option value={Gender.Male}>Male</option>
            <option value={Gender.Female}>Female</option>
            <option value={Gender.Other}>Other</option>
          </select>
        </div>

        {/* Actions Section */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Relations</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addSpouse(selectedNodeId)}
              className="flex flex-col items-center justify-center p-3 border border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg transition-colors gap-1"
            >
              <Heart size={18} />
              <span className="text-xs font-medium">Add Spouse</span>
            </button>
            <button
              onClick={() => addChild(selectedNodeId)}
              className="flex flex-col items-center justify-center p-3 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors gap-1"
            >
              <Baby size={18} />
              <span className="text-xs font-medium">Add Child</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-100 my-2"></div>

        {/* Birth Date */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Birth Date</label>
          <input
            type="date"
            name="birthDate"
            value={selectedNode.data.birthDate || ''}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          />
        </div>
        
        {/* Death Date */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Death Date (Optional)</label>
          <input
            type="date"
            name="deathDate"
            value={selectedNode.data.deathDate || ''}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-sm"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Biography</label>
          <textarea
            name="bio"
            rows={4}
            value={selectedNode.data.bio || ''}
            onChange={handleChange}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none text-sm resize-none"
            placeholder="Enter a short bio..."
          />
        </div>

      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
        <button
          onClick={() => deletePerson(selectedNodeId)}
          className="w-full flex items-center justify-center gap-2 p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors text-sm font-medium"
        >
          <Trash2 size={16} />
          Remove Person
        </button>
      </div>
    </div>
  );
};

export default EditorSidebar;