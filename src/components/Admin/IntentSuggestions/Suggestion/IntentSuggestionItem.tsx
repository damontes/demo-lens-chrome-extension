import { useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@zendeskgarden/react-buttons';
import { SM, LG } from '@zendeskgarden/react-typography';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import { Tag } from '@zendeskgarden/react-tags';
import Collapsable from '@/components/ui/Collapsable';
import EditIntentSuggestion from './EditIntentSuggestion';
import { INTENT_SUGGESTIONS_CATEGORIES } from '@/constants';

type Props = {
  suggestion: any;
  onRemove: (id: string) => void;
  onEdit: (suggestion: any) => void;
};

const IntentSuggestionItem = ({ suggestion, onEdit, onRemove }: Props) => {
  const [isEditMode, setIsEditMode] = useState(false);

  // Get category labels from constants
  const parentCategoryInfo = INTENT_SUGGESTIONS_CATEGORIES.find((cat) => cat.tag === suggestion.parentCategory);
  const childCategoryInfo = parentCategoryInfo?.children.find((child: any) => child.tag === suggestion.childCategory);

  const parentCategoryLabel = parentCategoryInfo?.label || suggestion.parentCategory;
  const childCategoryLabel = childCategoryInfo?.label || suggestion.childCategory;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return '#1f73b7';
      case 'IN_REVIEW':
        return '#ed8f00';
      case 'APPROVED':
        return '#228f67';
      case 'REJECTED':
        return '#d93f4c';
      default:
        return '#68737d';
    }
  };

  if (isEditMode) {
    return (
      <EditIntentSuggestion
        suggestion={suggestion}
        onCancel={() => setIsEditMode(false)}
        onSubmit={(values: any) => {
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
            <TitleRow>
              <SM style={{ fontWeight: 'bold' }}>{suggestion.label}</SM>
              <TagContainer>
                <Tag hue="#e0e0e0">
                  <span>{parentCategoryLabel}</span>
                </Tag>
                <Tag hue="#e0e0e0">
                  <span>{childCategoryLabel}</span>
                </Tag>
              </TagContainer>
            </TitleRow>
            <Subtitle>{suggestion.description}</Subtitle>
          </ContentContainer>
          <ButtonContainer>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditMode(true);
              }}
            >
              <PencilIcon />
            </IconButton>
            <IconButton
              size="small"
              isDanger
              onClick={(e) => {
                e.stopPropagation();
                onRemove(suggestion.id);
              }}
            >
              <TrashIcon />
            </IconButton>
          </ButtonContainer>
        </HeaderContainer>
      }
    >
      <ContentBody>
        <DetailsGrid>
          <DetailItem>
            <DetailLabel>Timeframe</DetailLabel>
            <DetailValue>{suggestion.timeframe} days</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Min Coverage Count</DetailLabel>
            <DetailValue>{suggestion.minCoverageCount} tickets</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Min Coverage Percentage</DetailLabel>
            <DetailValue>{(suggestion.minCoveragePercentage * 100).toFixed(1)}%</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Categories</DetailLabel>
            <DetailValue>
              {parentCategoryLabel} → {childCategoryLabel}
            </DetailValue>
          </DetailItem>
        </DetailsGrid>
      </ContentBody>
    </Collapsable>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const TagContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Subtitle = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[600]};
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const ContentBody = styled.div`
  padding: 16px;
  background-color: ${({ theme }) => theme.palette.grey[100]};
  border-radius: 4px;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled(SM)`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.palette.grey[700]};
  margin: 0;
`;

const DetailValue = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[800]};
  margin: 0;
`;

export default IntentSuggestionItem;
