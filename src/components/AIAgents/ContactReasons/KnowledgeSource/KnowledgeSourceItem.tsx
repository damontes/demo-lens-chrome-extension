import { useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@zendeskgarden/react-buttons';
import { SM } from '@zendeskgarden/react-typography';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import EditKnowledgeSource from './EditKnowledgeSource';

type Props = {
  knowledgeSource: any;
  index: number;
  onRemove: (index: number) => void;
  onEdit: (index: number, values: any) => void;
  showDelete?: boolean;
};

const KnowledgeSourceItem = ({ knowledgeSource, index, onEdit, onRemove, showDelete = true }: Props) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const getKnowledgeSourceTitle = () => {
    const articleName = knowledgeSource?.article_name;

    if (articleName) {
      return articleName;
    }
    return `Knowledge Source ${index + 1}`;
  };

  const getKnowledgeSourceDescription = () => {
    const kbName = knowledgeSource?.kb_name;
    const kbSourceType = knowledgeSource?.kb_source_type;

    const parts = [];
    if (kbName) parts.push(`KB: ${kbName}`);
    if (kbSourceType) parts.push(`Type: ${kbSourceType}`);

    return parts.join(' • ');
  };

  const getMetrics = () => {
    const totalConversations = knowledgeSource?.total_conversations_count || 0;
    const usageRate = knowledgeSource?.usage_rate ? (knowledgeSource.usage_rate * 100).toFixed(1) : '0';
    const automationRate = knowledgeSource?.automated_resolutions_rate
      ? (knowledgeSource.automated_resolutions_rate * 100).toFixed(1)
      : '0';

    return `${totalConversations} conversations • ${usageRate}% usage • ${automationRate}% automated`;
  };

  if (isEditMode) {
    return (
      <EditKnowledgeSource
        knowledgeSource={knowledgeSource}
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
          <Title>{getKnowledgeSourceTitle()}</Title>
          <Description>{getKnowledgeSourceDescription()}</Description>
          <Metrics>{getMetrics()}</Metrics>
        </TitleSection>
        <Actions>
          <IconButton size="small" onClick={() => setIsEditMode(true)} aria-label="Edit knowledge source">
            <PencilIcon />
          </IconButton>
          {showDelete && (
            <IconButton size="small" isDanger onClick={() => onRemove(index)} aria-label="Remove knowledge source">
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

const Metrics = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[500]};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${(props) => props.theme.fontWeights.medium};
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

export default KnowledgeSourceItem;
