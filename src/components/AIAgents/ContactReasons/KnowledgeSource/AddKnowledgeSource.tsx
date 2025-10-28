import { MD } from '@zendeskgarden/react-typography';
import styled, { useTheme } from 'styled-components';
import KnowledgeSourceForm from './KnowledgeSourceForm';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';

type Props = {
  onSubmit: (values: any) => void;
  onCancel: () => void;
};

const AddKnowledgeSource = ({ onSubmit, onCancel }: Props) => {
  const theme = useTheme();

  return (
    <Article>
      <header style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.palette.green[600] }}>
        <PlusIcon style={{ width: 16, height: '16' }} />
        <MD style={{ fontWeight: 'semibold' }}>Add New Knowledge Source</MD>
      </header>
      <KnowledgeSourceForm onCancel={onCancel} onSubmit={onSubmit} />
    </Article>
  );
};

const Article = styled.article`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.palette.green[600]};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  gap: 16px;
  background-color: ${({ theme }) => theme.palette.green[200]}99;
`;

export default AddKnowledgeSource;
