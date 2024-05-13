import type {MutableRefObject} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/core';
import type { BlockType } from '@/app/app_types/types';

export interface TreeItem {
  id: UniqueIdentifier;
  blockType: BlockType;
  children: TreeItem[];
  collapsed?: boolean;
  isDisabled?: boolean;
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
