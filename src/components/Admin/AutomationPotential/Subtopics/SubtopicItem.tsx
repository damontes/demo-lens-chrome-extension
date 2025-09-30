import React, { useState } from 'react';
import { Button } from '@zendeskgarden/react-buttons';
import { MD, SM } from '@zendeskgarden/react-typography';
import { useTheme } from 'styled-components';
import styled from 'styled-components';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import type { AutomationSubtopic } from '@/models/admin/templates';
import SubtopicForm from './SubtopicForm';

interface SubtopicItemProps {
  subtopic: AutomationSubtopic;
  index: number;
  onUpdate: (index: number, updatedSubtopic: AutomationSubtopic) => void;
  onDelete: (index: number) => void;
}

const SubtopicCard = styled.div`
  border: 1px solid ${(p) => p.theme.palette.grey[300]};
  border-radius: ${(p) => p.theme.borderRadii.md};
  padding: ${(p) => p.theme.space.md};
  margin-bottom: ${(p) => p.theme.space.sm};
  background-color: ${(p) => p.theme.palette.grey[50]};
`;

const SubtopicItem: React.FC<SubtopicItemProps> = ({ subtopic, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const theme = useTheme();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = (updatedSubtopic: AutomationSubtopic) => {
    onUpdate(index, updatedSubtopic);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return <SubtopicForm isEditing={true} initialData={subtopic} onUpdate={handleUpdate} onCancel={handleCancel} />;
  }

  return (
    <SubtopicCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <MD style={{ fontWeight: theme.fontWeights.semibold, marginBottom: theme.space.xs }}>{subtopic.name}</MD>
          <SM style={{ color: theme.palette.grey[600] }}>{subtopic.summary}</SM>
        </div>

        <div style={{ display: 'flex', gap: theme.space.xs }}>
          <Button size="small" isBasic isPill onClick={handleEdit}>
            <PencilIcon />
          </Button>
          <Button size="small" isDanger isBasic isPill onClick={() => onDelete(index)}>
            <TrashIcon />
          </Button>
        </div>
      </div>
    </SubtopicCard>
  );
};

export default SubtopicItem;
