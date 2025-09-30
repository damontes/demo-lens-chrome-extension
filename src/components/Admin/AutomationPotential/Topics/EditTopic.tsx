import React from 'react';
import styled, { useTheme } from 'styled-components';
import { MD } from '@zendeskgarden/react-typography';
import TopicForm from './TopicForm';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';
import { AutomationTopic } from '@/models/admin/templates';

interface EditTopicProps {
  topic: AutomationTopic;
  onSubmit: (topic: AutomationTopic) => void;
  onCancel: () => void;
}

const EditTopic: React.FC<EditTopicProps> = ({ topic, onSubmit, onCancel }) => {
  const theme = useTheme();

  return (
    <Article>
      <header style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.palette.blue[600] }}>
        <PencilIcon style={{ width: 16, height: '16' }} />
        <MD style={{ fontWeight: 'semibold' }}>Edit Topic</MD>
      </header>
      <TopicForm onSubmit={onSubmit} onCancel={onCancel} initialTopic={topic} isEditing={true} />
    </Article>
  );
};

const Article = styled.article`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.palette.blue[600]};
  border-radius: 8px;
  padding: 16px;
  gap: 16px;
  background-color: ${({ theme }) => theme.palette.blue[200]}99;
`;

export default EditTopic;
