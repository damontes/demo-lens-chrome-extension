import React, { useState, useEffect } from 'react';
import useAppState from '../../storage';
import styled, { useTheme } from 'styled-components';
import { LG, MD, SM } from '@zendeskgarden/react-typography';
import TrashIcon from '@zendeskgarden/svg-icons/src/16/trash-stroke.svg?react';
import ConfirmationModal from '../ui/ConfirmationModal';
import { Tag } from '@zendeskgarden/react-tags';
import { TemplateType } from '@/constants';

interface TemplateSelectorProps {
  templateType: TemplateType;
  selectedTemplate: string | null;
  onTemplateSelect: (template: any) => void;
  selectedIndustry: string;
  currentTemplate?: any;
  getTemplatesByIndustry: (industry: string) => any[];
}

const TemplateCard = styled.div<{ $isSelected: boolean }>`
  border: 1px solid ${(props) => (props.$isSelected ? props.theme.palette.green[600] : '#e3e5e8')};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  background-color: ${(props) => (props.$isSelected ? props.theme.palette.green[100] : 'white')};
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 120px;

  &:hover {
    background-color: ${(props) => (props.$isSelected ? props.theme.palette.green[100] : '#f9fafb')};
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.palette.red[600]};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.palette.red[100]};
  }
`;

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templateType,
  selectedTemplate,
  onTemplateSelect,
  selectedIndustry,
  currentTemplate,
  getTemplatesByIndustry,
}) => {
  const [predefinedTemplates, setPredefinedTemplates] = useState<any[]>([]);
  const [userTemplates, setUserTemplates] = useState<any[]>([]);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<any | null>(null);
  const { getTemplatesByType, saveTemplate, removeTemplate } = useAppState();
  const templates = useAppState((state: any) => state.templates); // Subscribe to templates
  const theme = useTheme();

  useEffect(() => {
    // Determine the industry to use for loading templates
    // For temporary templates, use selected industry instead of template's industry
    // For regular templates, use template's industry if available
    const industryForTemplates =
      currentTemplate && !currentTemplate.isTemporary
        ? currentTemplate.industry?.[0] || selectedIndustry
        : selectedIndustry;

    // Load predefined templates for the determined industry
    const templates = getTemplatesByIndustry(industryForTemplates);
    setPredefinedTemplates(templates);

    // Load user-created templates
    loadUserTemplates();
  }, [
    selectedIndustry,
    currentTemplate?.industry?.[0],
    currentTemplate?.isTemporary,
    templates,
    getTemplatesByIndustry,
  ]);

  const loadUserTemplates = async () => {
    try {
      const templates = getTemplatesByType(templateType);
      // Determine the industry to use for filtering (same logic as predefined templates)
      // For temporary templates, use selected industry instead of template's industry
      const industryForTemplates =
        currentTemplate && !currentTemplate.isTemporary
          ? currentTemplate.industry?.[0] || selectedIndustry
          : selectedIndustry;

      // Filter user templates by current industry, but always show temporary templates
      const filteredTemplates = templates.filter((template: any) => {
        // Always show temporary templates regardless of industry
        if (template.isTemporary) {
          return true;
        }
        // For regular user templates, filter by industry
        return template.industry && template.industry.includes(industryForTemplates);
      });
      setUserTemplates(filteredTemplates);
    } catch (error) {
      console.error('Failed to load user templates:', error);
    }
  };

  const handleTemplateSelect = (template: any) => {
    onTemplateSelect(template);
  };

  const handleDeleteTemplate = (template: any, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setTemplateToDelete(template);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete) {
      // Remove the template from storage
      removeTemplate(templateToDelete.id);

      // If the deleted template was selected, clear the selection
      if (selectedTemplate === templateToDelete.id) {
        onTemplateSelect(null);
      }

      // Immediately update the local state to reflect the deletion
      setUserTemplates((prevTemplates) => prevTemplates.filter((template) => template.id !== templateToDelete.id));

      // Close confirmation modal
      setDeleteConfirmationOpen(false);
      setTemplateToDelete(null);
    }
  };

  const cancelDeleteTemplate = () => {
    setDeleteConfirmationOpen(false);
    setTemplateToDelete(null);
  };

  return (
    <div>
      <LG isBold style={{ marginBottom: '16px' }}>
        Select a Template
      </LG>

      {/* Combined Templates Section */}
      {(predefinedTemplates.length > 0 || userTemplates.length > 0) && (
        <div style={{ marginBottom: '24px' }}>
          <MD isBold style={{ marginBottom: '12px' }}>
            Templates
          </MD>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px',
            }}
          >
            {/* Predefined Templates */}
            {predefinedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                $isSelected={selectedTemplate === template.id}
                onClick={() => handleTemplateSelect(template)}
              >
                <div style={{ marginBottom: '8px' }}>
                  <SM isBold style={{ margin: 0 }}>
                    {template.name}
                  </SM>
                </div>
                <p style={{ fontSize: '12px', color: '#68737d', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                  {template.description}
                </p>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}
                >
                  <Tag hue="#3A3A3A" size="small">
                    Default
                  </Tag>
                </div>
              </TemplateCard>
            ))}

            {/* User Created Templates */}
            {userTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                $isSelected={selectedTemplate === template.id}
                onClick={() => handleTemplateSelect(template)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <SM isBold style={{ margin: 0 }}>
                    {template.name}
                  </SM>
                  <DeleteButton onClick={(e) => handleDeleteTemplate(template, e)} title="Delete template">
                    <TrashIcon style={{ width: '14px', height: '14px' }} />
                  </DeleteButton>
                </div>
                <p style={{ fontSize: '12px', color: '#68737d', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                  {template.description}
                </p>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}
                >
                  <Tag hue="blue" size="small">
                    Custom
                  </Tag>
                </div>
              </TemplateCard>
            ))}
          </div>
        </div>
      )}

      {deleteConfirmationOpen && templateToDelete && (
        <ConfirmationModal
          onClose={() => cancelDeleteTemplate()}
          title="Delete Template"
          description={`Are you sure you want to delete the template "<strong>${templateToDelete.name}</strong>"? This action cannot be undone.`}
          handleSubmit={() => confirmDeleteTemplate()}
        />
      )}
    </div>
  );
};

export default TemplateSelector;
