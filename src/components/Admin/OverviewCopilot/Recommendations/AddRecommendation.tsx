import styled, { useTheme } from 'styled-components';
import { MD } from '@zendeskgarden/react-typography';
import RecommendationForm from './RecommendationForm';
import { Alert } from '@zendeskgarden/react-notifications';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';

type Props = {
  groups: any[];
  intents: any[];
  assignees: any[];
  onSubmit: (recommendation: any) => void;
  onCancel: () => void;
};

const AddRecomendation = ({ groups, intents, assignees, onSubmit, onCancel }: Props) => {
  const theme = useTheme();

  return (
    <Article>
      <header style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.palette.green[600] }}>
        <PlusIcon style={{ width: 16, height: '16' }} />
        <MD style={{ fontWeight: 'semibold' }}>Add Recommendation</MD>
      </header>
      {!intents.length ? (
        <Alert type="warning">
          <Alert.Title>No intents found</Alert.Title>
          We didn't find any intents in your account, make sure you have eneabled <b>"AI Copilot"</b> (Inteligent
          triage) in your Zendesk account.
        </Alert>
      ) : null}
      <RecommendationForm
        groups={groups}
        intents={intents}
        assignees={assignees}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
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

export default AddRecomendation;
