import { Field, Select, Toggle } from '@zendeskgarden/react-forms';
import { MD, SM } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import { useForm, FormProvider } from 'react-hook-form';
import { useEffect } from 'react';
import BuildingIcon from '@zendeskgarden/svg-icons/src/16/building-stroke.svg?react';
import GearIcon from '@zendeskgarden/svg-icons/src/16/gear-stroke.svg?react';
import { VERTICALS } from '@/constants';
import useAppState from '@/storage';
import AdminTemplateSelector from './AdminTemplateSelector';
import { AdminTemplate } from '@/models/admin/templates';
import { useTemplate } from '@/hooks/useTemplate';
import OverviewCopilotForm from './OverviewCopilot/OverviewCopilotForm';
import IntentSuggestionsForm from './IntentSuggestions/IntentSuggestionsForm';
import AutomationPotentialForm from './AutomationPotential/AutomationPotentialForm';
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

const AdminForm = ({ footer, onSubmit, initialValues = DEFAULT_INITIAL_VALUES }: Props) => {
  const methods = useForm({
    defaultValues: initialValues,
  });

  const { handleSubmit, watch, setValue } = methods;
  const templates = useAppState((state: any) => state.templates);
  const saveTemplate = useAppState((state: any) => state.saveTemplate);

  const watchedValues = watch();
  const selectedTemplate = useTemplate('admin', watchedValues.templateId);

  const currentIndustry =
    selectedTemplate && !selectedTemplate.isTemporary
      ? selectedTemplate.industry?.[0] || watchedValues.industry || 'finance'
      : watchedValues.industry || 'finance';

  useEffect(() => {
    if (selectedTemplate && watchedValues.templateId) {
      const hasTemplateData =
        selectedTemplate.configuration &&
        Object.keys(selectedTemplate.configuration).some(
          (configKey) => watchedValues[configKey] !== undefined && watchedValues[configKey] !== null,
        );

      if (!hasTemplateData) {
        handleTemplateSelect(selectedTemplate);
      }
    }
  }, [selectedTemplate?.id]); // Only run when template ID changes

  const handleIndustryChange = (industry: string) => {
    setValue('industry', industry);
    // Reset template selection when industry changes
    setValue('templateId', '');

    // Clear any configuration properties from previous template
    if (selectedTemplate?.configuration) {
      Object.keys(selectedTemplate.configuration).forEach((configKey) => {
        setValue(configKey, undefined);
      });
    }
  };

  const handleTemplateSelect = (template: AdminTemplate | any) => {
    setValue('templateId', template?.id);

    // Set industry from template only if it's not a temporary template
    // Temporary templates should preserve the user's industry selection
    if (template?.industry?.[0] && !template?.isTemporary) {
      setValue('industry', template.industry[0]);
    }

    // Disable advanced mode if selecting a default template (no createdAt)
    // Advanced mode should only be enabled for custom templates
    const isDefaultTemplate = !template?.createdAt;
    if (isDefaultTemplate && watchedValues.advancedMode) {
      setValue('advancedMode', false);
    }

    // Populate form with all template configuration properties
    if (template?.configuration) {
      Object.keys(template.configuration).forEach((configKey) => {
        setValue(configKey, template.configuration[configKey]);
      });
    }
  };

  const onSubmitWithValidation = (values: any) => {
    // Validate that a template is selected
    if (!values.templateId) {
      alert('Please select a template before saving.');
      return;
    }

    let finalTemplateId = values.templateId;

    // Only create/update custom templates if in advanced mode
    if (values.advancedMode && selectedTemplate) {
      // Check if the selected template is a default template (no createdAt)
      const isDefaultTemplate = !(selectedTemplate as any).createdAt;

      // Check if the user switched templates during this session
      const initialTemplateId = initialValues?.templateId;
      const hasTemplateChanged = initialTemplateId && initialTemplateId !== values.templateId;

      if (isDefaultTemplate) {
        // Extract configuration from form values (excluding form control fields)
        const { industry, templateId, advancedMode, ...configuration } = values;

        // Check if we're editing an existing dashboard that was using a custom template
        const initialTemplate = initialTemplateId ? templates[initialTemplateId] : null;
        const wasUsingCustomTemplate = initialTemplate && (initialTemplate as any).createdAt;

        // Only reuse/update an existing custom template if:
        // 1. We were initially using that custom template AND
        // 2. It's based on the same default template we currently have selected AND
        // 3. The user did NOT switch templates (templateId hasn't changed)
        if (
          wasUsingCustomTemplate &&
          initialTemplate &&
          (initialTemplate as any).name.includes(`${selectedTemplate.name} (Custom)`) &&
          !hasTemplateChanged
        ) {
          // Update the existing custom template that was initially selected
          const updatedTemplate = {
            ...initialTemplate,
            configuration,
          };
          saveTemplate(updatedTemplate as any);
          finalTemplateId = initialTemplate.id;
        } else {
          // Create a new user copy of the default template
          const userTemplate = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'admin',
            createdAt: Date.now(),
            name: `${selectedTemplate.name} (Custom)`,
            description: `Custom version of ${selectedTemplate.name}`,
            industry: selectedTemplate.industry,
            configuration,
          };

          saveTemplate(userTemplate);
          finalTemplateId = userTemplate.id;

          // Update the form to use the new custom template
          setValue('templateId', userTemplate.id);
        }
      } else {
        // We're updating an existing custom template
        // Only update if we haven't switched to a different template
        if (!hasTemplateChanged) {
          const { industry, templateId, advancedMode, ...configuration } = values;

          const updatedTemplate = {
            ...selectedTemplate,
            configuration,
          };
          saveTemplate(updatedTemplate as any);
        }
        // If template changed and it's a custom template, just use the new template as-is
      }
    }

    const cleanPayload = {
      templateId: finalTemplateId,
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
                  Select the industry that best matches your organization for optimized AI copilot recommendations.
                </Field.Hint>
              </Field>
            </Section>

            <Section>
              <AdminTemplateSelector
                selectedIndustry={currentIndustry}
                selectedTemplate={watchedValues.templateId}
                onTemplateSelect={handleTemplateSelect}
                currentTemplate={selectedTemplate}
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
                      <SectionTitle>Overview copilot</SectionTitle>
                      <SectionDescription>Metrics, Recommendations, and Setup tasks</SectionDescription>
                    </div>
                  }
                >
                  <div style={{ padding: '12px 16px' }}>
                    <OverviewCopilotForm key={`overview-copilot-${selectedTemplate.id}`} />
                  </div>
                </Collapsable>

                <Collapsable
                  headerContent={
                    <div>
                      <SectionTitle>Intent Suggestions</SectionTitle>
                      <SectionDescription>AI-powered intent suggestions and configuration</SectionDescription>
                    </div>
                  }
                >
                  <div style={{ padding: '12px 16px' }}>
                    <IntentSuggestionsForm key={`intent-suggestions-${selectedTemplate.id}`} />
                  </div>
                </Collapsable>

                <Collapsable
                  headerContent={
                    <div>
                      <SectionTitle>Automation Potential</SectionTitle>
                      <SectionDescription>AI agent automation insights and topic configuration</SectionDescription>
                    </div>
                  }
                >
                  <div style={{ padding: '12px 16px' }}>
                    <AutomationPotentialForm key={`automation-potential-${selectedTemplate.id}`} />
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

export default AdminForm;
