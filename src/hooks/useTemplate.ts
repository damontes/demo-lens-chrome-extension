import { useMemo } from 'react';
import useAppState from '@/storage';
import { ADMIN_TEMPLATES } from '@/models/admin/templates';
import { WFM_TEMPLATES } from '@/models/wfm/templates';

const DEFAULT_TEMPLATES_BY_TYPE = {
  admin: ADMIN_TEMPLATES,
  wfm: WFM_TEMPLATES,
} as const;

export const useTemplate = (type: 'admin' | 'wfm', templateId: string): any => {
  const { getTemplatesByType } = useAppState();

  const template = useMemo(() => {
    if (!templateId) return null;

    // First check user templates
    const userTemplates = getTemplatesByType(type);
    const userTemplate = userTemplates.find((t: any) => t.id === templateId);

    if (userTemplate) {
      return userTemplate;
    }

    // Then check default templates for the type
    const defaultTemplates = DEFAULT_TEMPLATES_BY_TYPE[type];
    const defaultTemplate = defaultTemplates.find((t: any) => t.id === templateId);

    return defaultTemplate || null;
  }, [templateId, type, getTemplatesByType]);

  return template;
};
