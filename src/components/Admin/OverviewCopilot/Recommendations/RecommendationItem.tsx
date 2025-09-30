import { useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@zendeskgarden/react-buttons';
import { SM } from '@zendeskgarden/react-typography';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import Collapsable from '@/components/ui/Collapsable';
import EditRecommendation from './EditRecommendation';
import { parseSuggestion } from '@/models/admin/inflatePayload';

type Props = {
  recommendation: any;
  onRemove: (id: string) => void;
  onEdit: (recommendation: any) => void;
};

const RecommendationItem = ({ recommendation, onEdit, onRemove }: Props) => {
  const [isEditMode, setIsEditMode] = useState(false);

  // Use parseSuggestion to generate the proper content
  const suggestion = parseSuggestion(recommendation);
  const { title, subtitle, body } = suggestion.content;

  if (isEditMode) {
    return (
      <EditRecommendation
        recommendation={recommendation}
        onCancel={() => setIsEditMode(false)}
        onSubmit={(values) => {
          onEdit(values);
          setIsEditMode(false);
        }}
      />
    );
  }

  return (
    <Collapsable
      headerContent={
        <HeaderContainer>
          <ContentContainer>
            <SM style={{ fontWeight: 'bold' }}>{title}</SM>
            <Subtitle>{subtitle}</Subtitle>
          </ContentContainer>
          <ButtonContainer>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditMode(true);
              }}
              aria-label="Edit recommendation"
            >
              <PencilIcon />
            </IconButton>
            <IconButton
              size="small"
              isDanger
              onClick={(e) => {
                e.stopPropagation();
                onRemove(recommendation.id);
              }}
              aria-label="Remove recommendation"
            >
              <TrashIcon />
            </IconButton>
          </ButtonContainer>
        </HeaderContainer>
      }
    >
      <Container dangerouslySetInnerHTML={{ __html: body }} />
    </Collapsable>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  margin-right: 12px;
`;

const ContentContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

const Subtitle = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[600]};
`;

const Container = styled.div`
  padding: 0 16px;
  font-size: 12px;
  line-height: 1.4;

  h6 {
    font-size: 14px;
    font-weight: 600;
    margin: 8px 0 4px 0;
  }

  em {
    font-weight: bold;
    font-style: normal;
  }
`;

export default RecommendationItem;
