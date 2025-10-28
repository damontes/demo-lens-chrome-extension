import { useState } from 'react';
import styled from 'styled-components';
import { IconButton } from '@zendeskgarden/react-buttons';
import { SM } from '@zendeskgarden/react-typography';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import EditFeedbackRating from './EditFeedbackRating';

type Props = {
  feedbackRating: any;
  index: number;
  onRemove: (index: number) => void;
  onEdit: (index: number, values: any) => void;
  showDelete?: boolean;
};

const FeedbackRatingItem = ({ feedbackRating, index, onEdit, onRemove, showDelete = true }: Props) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const getFeedbackTitle = () => {
    const rating = feedbackRating?.feedback_last_rating;
    const count = feedbackRating?.bsat_response_count;

    if (rating && count) {
      return `${rating} Star Rating (${count} responses)`;
    } else if (rating) {
      return `${rating} Star Rating`;
    }
    return `Rating ${index + 1}`;
  };

  if (isEditMode) {
    return (
      <EditFeedbackRating
        feedbackRating={feedbackRating}
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
          <Title>{getFeedbackTitle()}</Title>
        </TitleSection>
        <Actions>
          <IconButton size="small" onClick={() => setIsEditMode(true)} aria-label="Edit feedback rating">
            <PencilIcon />
          </IconButton>
          {showDelete && (
            <IconButton size="small" isDanger onClick={() => onRemove(index)} aria-label="Remove feedback rating">
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
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const Title = styled(SM)`
  font-weight: ${(props) => props.theme.fontWeights.semibold};
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
`;

export default FeedbackRatingItem;
