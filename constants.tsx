import React from 'react';

export const PLACEHOLDER_AVATAR = "https://picsum.photos/100/100";

export const NODE_WIDTH = 250;
export const NODE_HEIGHT = 120;

export const INITIAL_NODES = [
  {
    id: '1',
    type: 'person',
    position: { x: 0, y: 0 },
    data: { name: 'Grandfather', gender: 'MALE', birthDate: '1950-01-01' }
  },
  {
    id: '2',
    type: 'person',
    position: { x: 300, y: 0 },
    data: { name: 'Grandmother', gender: 'FEMALE', birthDate: '1952-05-12' }
  }
];
