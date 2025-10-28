import { MD } from '@zendeskgarden/react-typography';
import styled, { useTheme } from 'styled-components';
import FeedbackRatingForm from './FeedbackRatingForm';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';

type Props = {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  feedbackRating: any;
};

const EditFeedbackRating = ({ onSubmit, onCancel, feedbackRating }: Props) => {
  const theme = useTheme();

  return (
    <Article>
      <header style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.palette.blue[600] }}>
        <PencilIcon style={{ width: 16, height: '16' }} />
        <MD style={{ fontWeight: 'semibold' }}>Edit Feedback Rating</MD>
      </header>
      <FeedbackRatingForm onCancel={onCancel} onSubmit={onSubmit} initialValues={feedbackRating} />
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

export default EditFeedbackRating;
