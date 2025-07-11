import { MD } from '@zendeskgarden/react-typography';
import styled, { useTheme } from 'styled-components';
import RecommendationForm from './RecommendationForm';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-stroke.svg?react';

type Props = {
  onSubmit: (recommendation: any) => void;
  onCancel: () => void;
  recommendation: any;
};

const EditRecommendation = ({ onSubmit, onCancel, recommendation }: Props) => {
  const theme = useTheme();

  return (
    <Article>
      <header style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.palette.blue[600] }}>
        <PencilIcon style={{ width: 16, height: '16' }} />
        <MD style={{ fontWeight: 'semibold' }}>Add Recommendation</MD>
      </header>
      <RecommendationForm onCancel={onCancel} onSubmit={onSubmit} initialValues={recommendation} />
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

export default EditRecommendation;
