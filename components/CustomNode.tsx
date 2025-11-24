import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { PersonData, Gender } from '../types';
import { User, Calendar } from 'lucide-react';
import { PLACEHOLDER_AVATAR } from '../constants';

const CustomNode = ({ data, selected }: NodeProps<any>) => {
  const personData = data as PersonData;

  const borderColor = selected ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200';
  const bgColor = selected ? 'bg-white' : 'bg-slate-50';

  return (
    <div className={`w-[250px] shadow-lg rounded-xl overflow-hidden border transition-all duration-200 ${borderColor} ${bgColor} relative group`}>
      {/* Hierarchy Handles (Vertical) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="top"
        className="!bg-slate-400 !w-3 !h-3 hover:!w-4 hover:!h-4 transition-all" 
      />
      
      {/* Spouse Handles (Horizontal) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left"
        className="!bg-pink-400 !w-3 !h-3 !-ml-1.5 hover:!w-4 hover:!h-4 transition-all" 
      />

      <div className="flex p-3 gap-3 items-center">
        <div className="flex-shrink-0">
          <img 
            src={personData.photoUrl || PLACEHOLDER_AVATAR} 
            alt={personData.name} 
            className="w-12 h-12 rounded-full object-cover border border-slate-200"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 truncate">{personData.name}</h3>
          <div className="flex items-center text-xs text-slate-500 mt-1">
            <User size={12} className="mr-1" />
            <span className="capitalize mr-2">{personData.gender.toLowerCase()}</span>
          </div>
          {personData.birthDate && (
             <div className="flex items-center text-xs text-slate-400 mt-0.5">
             <Calendar size={12} className="mr-1" />
             <span>{personData.birthDate}</span>
           </div>
          )}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        id="right"
        className="!bg-pink-400 !w-3 !h-3 !-mr-1.5 hover:!w-4 hover:!h-4 transition-all" 
      />

      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="bottom"
        className="!bg-brand-500 !w-3 !h-3 hover:!w-4 hover:!h-4 transition-all" 
      />
    </div>
  );
};

export default memo(CustomNode);