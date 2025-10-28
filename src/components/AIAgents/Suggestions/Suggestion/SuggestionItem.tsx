import { useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@zendeskgarden/react-buttons';
import { SM } from '@zendeskgarden/react-typography';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import EditSuggestion from './EditSuggestion';

type Props = {
  suggestion: any;
  index: number;
  onRemove: (index: number) => void;
  onEdit: (index: number, values: any) => void;
  showDelete?: boolean;
};

const SuggestionItem = ({ suggestion, index, onEdit, onRemove, showDelete = true }: Props) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const getSuggestionTitle = () => {
    const name = suggestion?.name;
    const description = suggestion?.description;

    if (name) {
      return name;
    }
    return `Suggestion ${index + 1}`;
  };

  const getSuggestionDescription = () => {
    return suggestion?.description || 'No description available';
  };

  if (isEditMode) {
    return (
      <EditSuggestion
        suggestion={suggestion}
        onCancel={() => setIsEditMode(false)}
        onSubmit={(values: any) => {
          onEdit(index, values);
          setIsEditMode(false);
        }}
      />
    );
  }

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>{getSuggestionTitle()}</Title>
          <Description>{getSuggestionDescription()}</Description>
          <ConversationCount>{suggestion?.numberOfConversations || 0} conversations</ConversationCount>
        </TitleSection>
        <Actions>
          <IconButton size="small" onClick={() => setIsEditMode(true)} aria-label="Edit suggestion">
            <PencilIcon />
          </IconButton>
          {showDelete && (
            <IconButton size="small" isDanger onClick={() => onRemove(index)} aria-label="Remove suggestion">
              <TrashIcon />
            </IconButton>
          )}
        </Actions>
      </Header>
    </Container>
  );
};

const Container = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 6px;
  background: ${({ theme }) => theme.palette.white};
  margin-bottom: 8px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const Title = styled(SM)`
  font-weight: ${(props) => props.theme.fontWeights.semibold};
`;

const Description = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[600]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const ConversationCount = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[500]};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${(props) => props.theme.fontWeights.medium};
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

export default SuggestionItem;
