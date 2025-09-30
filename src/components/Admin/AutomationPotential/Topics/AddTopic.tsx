import React from 'react';
import styled, { useTheme } from 'styled-components';
import { MD } from '@zendeskgarden/react-typography';
import TopicForm from './TopicForm';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';
import { AutomationTopic } from '@/models/admin/templates';

interface AddTopicProps {
  onSubmit: (topic: AutomationTopic) => void;
  onCancel: () => void;
}

const AddTopic: React.FC<AddTopicProps> = ({ onSubmit, onCancel }) => {
  const theme = useTheme();

  return (
    <Article>
      <header style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.palette.green[600] }}>
        <PlusIcon style={{ width: 16, height: '16' }} />
        <MD style={{ fontWeight: 'semibold' }}>Add Topic</MD>
      </header>
      <TopicForm onSubmit={onSubmit} onCancel={onCancel} isEditing={false} />
    </Article>
  );
};

const Article = styled.article`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.palette.green[600]};
  border-radius: 8px;
  padding: 16px;
  gap: 16px;
  background-color: ${({ theme }) => theme.palette.green[200]}99;
`;

export default AddTopic;
