import { useEffect } from 'react';
import useAppState from '@/storage';
import { ADMIN_TEMPLATES } from '@/models/admin/templates';
import { WFM_TEMPLATES } from '@/models/wfm/templates';
import { AI_AGENTS_TEMPLATES } from '@/models/aiagents/templates';
import { TEMPLATE_TYPES, TemplateType } from '@/constants';

/**
 * Custom hook to retrieve a template by type and ID
 * Returns template from default templates or user-created templates
 */
export const useTemplate = (type: TemplateType, templateId: string | undefined) => {
  const userTemplates = useAppState((state: any) => state.templates);

  if (!templateId) return undefined;

  // First check user-created templates
  if (userTemplates[templateId]) {
    return userTemplates[templateId];
  }

  // Then check default templates based on type
  switch (type) {
    case TEMPLATE_TYPES.ADMIN:
      return ADMIN_TEMPLATES.find((template) => template.id === templateId);
    case TEMPLATE_TYPES.WFM:
      return WFM_TEMPLATES.find((template) => template.id === templateId);
    case TEMPLATE_TYPES.AI_AGENTS:
      return AI_AGENTS_TEMPLATES.find((template) => template.id === templateId);
    default:
      return undefined;
  }
};

/**
 * Custom hook for template form logic
 * Handles template selection, industry changes, and form value management
 */
export const useTemplateForm = (
  templateType: TemplateType,
  watchedValues: any,
  setValue: (name: string, value: any) => void,
  initialValues?: any,
) => {
  const templates = useAppState((state: any) => state.templates);
  const saveTemplate = useAppState((state: any) => state.saveTemplate);
  const selectedTemplate = useTemplate(templateType, watchedValues.templateId);

  const currentIndustry =
    selectedTemplate && !selectedTemplate.isTemporary
      ? selectedTemplate.industry?.[0] || watchedValues.industry || 'finance'
      : watchedValues.industry || 'finance';

  // Auto-populate template data when template is selected
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

  const handleTemplateSelect = (template: any) => {
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

  const validateAndProcessTemplate = (values: any): { isValid: boolean; templateId?: string; error?: string } => {
    // Validate that a template is selected
    if (!values.templateId) {
      return { isValid: false, error: 'Please select a template before saving.' };
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
            type: templateType,
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

    return { isValid: true, templateId: finalTemplateId };
  };

  return {
    selectedTemplate,
    currentIndustry,
    handleIndustryChange,
    handleTemplateSelect,
    validateAndProcessTemplate,
  };
};
