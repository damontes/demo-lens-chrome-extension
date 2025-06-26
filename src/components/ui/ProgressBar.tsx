import { Progress, Spinner } from '@zendeskgarden/react-loaders';
import { MD, SM } from '@zendeskgarden/react-typography';
import styled, { useTheme } from 'styled-components';
import CheckIcon from '@zendeskgarden/svg-icons/src/16/check-lg-stroke.svg?react';

const ProgressBar = ({ progress, label, spinner = false, ...props }: any) => {
  const theme = useTheme();
  return (
    <Container {...props}>
      <Header>
        <Label tag="span">
          {spinner && progress < 100 ? <Spinner size="small" /> : null}
          {spinner && progress >= 100 ? (
            <CheckIcon style={{ width: '14px', height: '14px', color: theme.palette.green[600] }} />
          ) : null}
          {label}
        </Label>
        <ProgressLabel tag="span">{progress}%</ProgressLabel>
      </Header>
      <Progress value={progress} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled(MD)`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;
const ProgressLabel = styled(SM)`
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
`;

export default ProgressBar;
