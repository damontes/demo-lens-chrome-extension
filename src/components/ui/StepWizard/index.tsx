import { Stepper } from '@zendeskgarden/react-accordions';
import { LG, MD } from '@zendeskgarden/react-typography';
import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { StepWizardProvider, useStepWizardStore } from './StepWizardProvider';

type Props = {
  title: string;
  description: string;
  steps: Step[];
  onClose?: () => void;
  handleSubmit?: (id: string, payload: any) => void;
};

type Step = {
  id: string;
  title: string;
  content: (props: any) => ReactElement;
};

const StepWizard = ({ title, description, steps, ...rest }: Props) => {
  const currentStep = useStepWizardStore((state) => state.step);
  const ContentStep = steps[currentStep].content;

  return (
    <Container>
      <Header>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Header>

      <Stepper activeIndex={currentStep} isHorizontal>
        {steps.map((step) => (
          <Stepper.Step key={step.id}>
            <Stepper.Label>{step.title}</Stepper.Label>
          </Stepper.Step>
        ))}
      </Stepper>

      <ContentStep {...rest} />
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

const withStepWizardProvider = <T extends object>(Component: React.ComponentType<T>) => {
  return (props: T) => {
    const { steps = [] } = props as any;
    return (
      <StepWizardProvider totalSteps={steps.length}>
        <Component {...props} />
      </StepWizardProvider>
    );
  };
};

export default withStepWizardProvider(StepWizard);
