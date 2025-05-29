import { useState } from 'react';
import styled from 'styled-components';
import RecommendationItemPreview from './RecommendationItemPreview';
import { Button } from '@zendeskgarden/react-buttons';
import EditRecommendation from './EditRecommendation';

type Props = {
  groups: any[];
  intents: any[];
  assignees: any[];
  recommendation: any;
  onRemove: (id: string) => void;
  onEdit: (recommendation: any) => void;
};

const RecommendationItem = ({ recommendation, onEdit, onRemove, groups, intents, assignees }: Props) => {
  const [isEditMode, setIsEditMode] = useState(false);

  if (isEditMode) {
    return (
      <EditRecommendation
        groups={groups}
        intents={intents}
        assignees={assignees}
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
    <Article>
      <RecommendationItemPreview recommendation={recommendation} />
      <Footer>
        <Button type="button" size="medium" onClick={() => setIsEditMode(true)}>
          Edit
        </Button>
        <Button type="button" isDanger size="medium" onClick={() => onRemove(recommendation.id)}>
          Remove
        </Button>
      </Footer>
    </Article>
  );
};

const Article = styled.article`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: 8px;
  padding: 16px;
  gap: 16px;
`;

const Footer = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid ${({ theme }) => theme.palette.grey[200]};
  padding-top: 16px;
`;

export default RecommendationItem;
