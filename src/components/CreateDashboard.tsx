import { MD, LG } from '@zendeskgarden/react-typography';
import { useState } from 'react';
import styled from 'styled-components';
import { Stepper } from '@zendeskgarden/react-accordions';
import AnalyzeDashboardStep from './AnalyzeDashboardStep';
import CreateDashboardStep from './CreateDashboardStep';
import { getAppState, setAppState } from '../lib/chromeExtension';

const allSteps = [
  {
    id: 'step-1',
    content: (props: any) => <AnalyzeDashboardStep {...props} />,
  },
  {
    id: 'step-2',
    content: (props: any) => <CreateDashboardStep {...props} />,
  },
];

type Props = {
  onClose: () => void;
  handleSubmit: ({ name }: { name: string }) => void;
};

const CreateDashboard = ({ onClose, handleSubmit }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentDashboard, setCurrentDashboard] = useState(null);

  const ContentStep = allSteps[currentStep].content;

  const onNext = () => {
    setCurrentStep(Math.min(currentStep + 1, allSteps.length - 1));
  };

  const onBack = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const handleCurrentDashboard = async (dashboard: any) => {
    setCurrentDashboard(dashboard);
  };

  return (
    <Container>
      <Header>
        <Title>Create dashboard</Title>
        <Description>
          Enter a name for your dashboard. We'll analyze the current Zendesk tab you're viewing.
        </Description>
      </Header>

      <Stepper activeIndex={currentStep} isHorizontal>
        <Stepper.Step key="step-1">
          <Stepper.Label>Analyze</Stepper.Label>
        </Stepper.Step>
        <Stepper.Step key="step-2">
          <Stepper.Label>Create</Stepper.Label>
        </Stepper.Step>
      </Stepper>

      <ContentStep
        handleCurrentDashboard={handleCurrentDashboard}
        currentDashboard={currentDashboard}
        onNext={onNext}
        onBack={onBack}
        onClose={onClose}
        handleSubmit={handleSubmit}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Title = styled(LG)`
  margin: 0;
  font-weight: bold;
`;

const Description = styled(MD)`
  margin: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
`;

export default CreateDashboard;
