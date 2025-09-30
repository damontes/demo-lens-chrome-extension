import styled, { useTheme } from 'styled-components';
import { MD } from '@zendeskgarden/react-typography';
import IntentSuggestionForm from './IntentSuggestionForm';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';

type Props = {
  onSubmit: (suggestion: any) => void;
  onCancel: () => void;
};

const AddIntentSuggestion = ({ onSubmit, onCancel }: Props) => {
  const theme = useTheme();

  return (
    <Article>
      <header style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.palette.green[600] }}>
        <PlusIcon style={{ width: 16, height: '16' }} />
        <MD style={{ fontWeight: 'semibold' }}>Add Intent Suggestion</MD>
      </header>
      <IntentSuggestionForm onCancel={onCancel} onSubmit={onSubmit} />
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

export default AddIntentSuggestion;
