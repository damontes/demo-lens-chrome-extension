import { Field, Select, Toggle } from '@zendeskgarden/react-forms';
import { MD, SM } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { useForm, FormProvider } from 'react-hook-form';
import BuildingIcon from '@zendeskgarden/svg-icons/src/16/building-stroke.svg?react';
import GearIcon from '@zendeskgarden/svg-icons/src/16/gear-stroke.svg?react';
import { VERTICALS, TEMPLATE_TYPES } from '@/constants';
import { getAIAgentsTemplatesByIndustry } from '@/models/aiagents/templates';
import { useTemplateForm } from '@/hooks/useTemplate';
import TemplateSelector from '../Template/TemplateSelector';
import KPIsForm from './KPIs/KPIsForm';
import ContactReasonsForm from './ContactReasons/ContactReasonsForm';
import SuggestionsForm from './Suggestions/SuggestionsForm';
import Collapsable from '../ui/Collapsable';

type Props = {
  footer: JSX.Element;
  onSubmit: (values: any) => void;
  initialValues?: any;
};

const DEFAULT_INITIAL_VALUES = {
  industry: 'finance',
  templateId: '', // Template reference for the dashboard
  advancedMode: false, // Toggle for advanced configuration editing
};

const AIAgentsForm = ({ footer, onSubmit, initialValues = DEFAULT_INITIAL_VALUES }: Props) => {
  const methods = useForm({
    defaultValues: initialValues,
  });

  const { handleSubmit, watch, setValue } = methods;

  const watchedValues = watch();
  const { selectedTemplate, currentIndustry, handleIndustryChange, handleTemplateSelect, validateAndProcessTemplate } =
    useTemplateForm(TEMPLATE_TYPES.AI_AGENTS, watchedValues, setValue, initialValues);

  const onSubmitWithValidation = (values: any) => {
    const result = validateAndProcessTemplate(values);

    if (!result.isValid) {
      alert(result.error);
      return;
    }

    const cleanPayload = {
      templateId: result.templateId,
    };

    onSubmit(cleanPayload);
  };

  return (
    <FormProvider {...methods}>
      <FormWrapper>
        <FormContent>
          <form onSubmit={handleSubmit(onSubmitWithValidation)}>
            <Section>
              <SectionHeader>
                <BuildingIcon />
                <SectionTitle>Industry Selection</SectionTitle>
              </SectionHeader>
              <Field>
                <Field.Label>Industry</Field.Label>
                <Select value={currentIndustry} onChange={(e) => handleIndustryChange(e.target.value)}>
                  {Object.values(VERTICALS).map((vertical) => (
                    <option key={vertical.value} value={vertical.value}>
                      {vertical.label}
                    </option>
                  ))}
                </Select>
                <Field.Hint>
                  Select the industry that best matches your organization for optimized AI agents analytics.
                </Field.Hint>
              </Field>
            </Section>

            <Section>
              <TemplateSelector
                templateType={TEMPLATE_TYPES.AI_AGENTS}
                selectedIndustry={currentIndustry}
                selectedTemplate={watchedValues.templateId}
                onTemplateSelect={handleTemplateSelect}
                currentTemplate={selectedTemplate}
                getTemplatesByIndustry={getAIAgentsTemplatesByIndustry}
              />
            </Section>

            <Section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GearIcon />
                <SectionTitle>Advanced Settings</SectionTitle>
              </div>
              <ToggleContainer>
                <ToggleContent>
                  <p>Enable advanced mode to modify the template configuration.</p>
                </ToggleContent>
                <Field>
                  <Toggle
                    checked={watchedValues.advancedMode || false}
                    onChange={(e) => setValue('advancedMode', e.target.checked)}
                  >
                    <Field.Label hidden>Advanced mode</Field.Label>
                  </Toggle>
                </Field>
              </ToggleContainer>
            </Section>

            {watchedValues.advancedMode && selectedTemplate && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Collapsable
                  headerContent={
                    <div>
                      <SectionTitle>KPIs Configuration</SectionTitle>
                      <SectionDescription>Performance metrics and analytics configuration</SectionDescription>
                    </div>
                  }
                >
                  <div style={{ padding: '12px 16px' }}>
                    <KPIsForm key={`kpis-${selectedTemplate.id}`} />
                  </div>
                </Collapsable>

                <Collapsable
                  headerContent={
                    <div>
                      <SectionTitle>Contact Reasons</SectionTitle>
                      <SectionDescription>Use cases and knowledge sources configuration</SectionDescription>
                    </div>
                  }
                >
                  <div style={{ padding: '12px 16px' }}>
                    <ContactReasonsForm key={`contact-reasons-${selectedTemplate.id}`} />
                  </div>
                </Collapsable>

                <Collapsable
                  headerContent={
                    <div>
                      <SectionTitle>Intent Suggestions</SectionTitle>
                      <SectionDescription>AI-generated intent suggestions and recommendations</SectionDescription>
                    </div>
                  }
                >
                  <div style={{ padding: '12px 16px' }}>
                    <SuggestionsForm key={`suggestions-${selectedTemplate.id}`} />
                  </div>
                </Collapsable>
              </div>
            )}

            <FixedFooter>{footer}</FixedFooter>
          </form>
        </FormContent>
      </FormWrapper>
    </FormProvider>
  );
};

// Styled components
const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FormContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px; /* Space for fixed footer */
`;

const FixedFooter = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${(props) => props.theme.palette.white};
  border-top: 1px solid ${(props) => props.theme.palette.grey[300]};
  padding: 16px 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const Section = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  border: 1px solid ${(props) => props.theme.palette.grey[300]};
  border-radius: 8px;
  background-color: ${(props) => props.theme.palette.white};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
`;

const SectionTitle = styled(MD)`
  font-weight: ${(props) => props.theme.fontWeights.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionDescription = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[600]};
`;

const ToggleContainer = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ToggleContent = styled.div`
  max-width: 80%;

  p {
    margin: 0;
    color: ${({ theme }) => theme.palette.grey[600]};
  }
`;

export default AIAgentsForm;
