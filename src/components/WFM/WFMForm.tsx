import { Field, Select, Toggle } from '@zendeskgarden/react-forms';
import { MD, SM, LG } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { useForm, FormProvider } from 'react-hook-form';
import { useState, useEffect } from 'react';
import PhoneIcon from '@zendeskgarden/svg-icons/src/16/phone-stroke.svg?react';
import { VERTICALS } from '@/constants';
import useAppState from '@/storage';
import WFMTemplateSelector from './WFMTemplateSelector';
import { WFM_TEMPLATES, WFMTemplate } from '@/models/wfm/templates';

type Props = {
  footer: JSX.Element;
  onSubmit: (values: any) => void;
  initialValues?: any;
};

const DEFAULT_INITIAL_VALUES = {
  industry: 'finance',
  useInstanceData: false,
  templateId: '', // Template reference for the dashboard
};

const WFMForm = ({ footer, onSubmit, initialValues = DEFAULT_INITIAL_VALUES }: Props) => {
  const methods = useForm({
    defaultValues: initialValues,
  });

  const { handleSubmit, watch, setValue } = methods;
  const [currentIndustry, setCurrentIndustry] = useState(initialValues.industry || 'finance');
  const { getTemplatesByType } = useAppState();

  const watchedValues = watch();

  // Effect to derive industry from selected template
  useEffect(() => {
    if (watchedValues.templateId) {
      // Try to find the template and get its industry
      let template = null;

      // Check user templates first
      const userTemplates = getTemplatesByType('wfm');
      template = userTemplates.find((t: any) => t.id === watchedValues.templateId);

      // If not found, check predefined templates
      if (!template) {
        template = WFM_TEMPLATES.find((t: any) => t.id === watchedValues.templateId);
      }

      if (template && template.industry && template.industry.length > 0) {
        const templateIndustry = Array.isArray(template.industry) ? template.industry[0] : template.industry;
        setCurrentIndustry(templateIndustry);
        setValue('industry', templateIndustry);
      }
    }
  }, [watchedValues.templateId, getTemplatesByType, setValue]);

  const handleIndustryChange = (industry: string) => {
    setCurrentIndustry(industry);
    setValue('industry', industry);
    // Reset template selection when industry changes
    setValue('templateId', '');
  };

  const handleTemplateSelect = (template: WFMTemplate | any) => {
    setValue('templateId', template?.id);
  };

  const onSubmitWithValidation = (values: any) => {
    // Validate that a template is selected
    if (!values.templateId) {
      alert('Please select a template before saving.');
      return;
    }

    // Clean up payload - only keep essential fields
    const cleanPayload = {
      templateId: values.templateId,
      useInstanceData: values.useInstanceData || false,
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
                <SectionTitle>Use instance data</SectionTitle>
              </SectionHeader>
              <ToggleContainer>
                <ToggleContent>
                  <p>
                    Enable this option to incorporate data from your Zendesk instance:
                    <b>agents, groups, tasks, workstreams, locations, organizations, and teams</b>.
                  </p>
                </ToggleContent>
                <Field>
                  <Toggle
                    checked={watchedValues.useInstanceData || false}
                    onChange={(e) => setValue('useInstanceData', e.target.checked)}
                  >
                    <Field.Label hidden>Use instance data</Field.Label>
                  </Toggle>
                </Field>
              </ToggleContainer>
            </Section>

            <Section>
              <SectionHeader>
                <PhoneIcon />
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
                  Select the industry that best matches your organization for optimized template recommendations.
                </Field.Hint>
              </Field>
            </Section>

            <Section>
              <WFMTemplateSelector
                selectedIndustry={currentIndustry}
                selectedTemplate={watchedValues.templateId}
                onTemplateSelect={handleTemplateSelect}
              />
            </Section>

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

export default WFMForm;
