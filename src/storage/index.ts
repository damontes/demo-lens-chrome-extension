import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// Generic template interface that can hold any dashboard type template
interface Template {
  id: string;
  type: string; // 'wfm', 'admin', 'explore', etc. (dashboard type from interceptor)
  createdAt: number;
  name: string;
  description: string;
  industry: string[];
  configuration: any;
}

type AppState = {
  configurations: Record<string, any>;
  dashboards: Record<string, any>;
  dashboardDetails: Record<string, any>;
  templates: Record<string, Template>; // Generic templates storage
  activeConfiguration: string;
  version: number;
  setInitialState: (state: AppState) => void;
  saveDashboard: (id: string, dashboard: any) => void;
  removeDashboard: (id: string) => void;
  addConfiguration: (id: string, configuration: any) => void;
  removeConfiguration: (id: string) => void;
  setActiveConfiguration: (id: string) => void;
  intents: Record<string, any>[];
  addIntent: (intent: any) => void;
  // Generic template management
  saveTemplate: (template: Template) => void;
  removeTemplate: (id: string) => void;
  getTemplatesByType: (type: string) => any[]; // Returns metadata for the specific type
};

const useAppState = create<AppState>()(
  immer((set, get) => ({
    configurations: {},
    dashboards: {},
    dashboardDetails: {},
    templates: {},
    activeConfiguration: '',
    version: 0,
    isEnabled: false,
    intents: [],
    setInitialState: (state) => {
      set(state);
    },
    saveDashboard: (id, dashboard) => {
      set((state) => {
        state.dashboards[id] = dashboard;
      });
    },
    removeDashboard: (id) => {
      set((state) => {
        delete state.dashboards[id];
      });
    },
    addConfiguration: (id, configuration) => {
      set((state) => {
        state.configurations[id] = configuration;
      });
    },
    removeConfiguration: (id) => {
      set((state) => {
        delete state.configurations[id];
      });
    },
    setActiveConfiguration: (id) => {
      set((state) => {
        state.activeConfiguration = id;
      });
    },
    addIntent: (intent: any) => {
      set((state) => {
        state.intents.push(intent);
      });
    },
    // Generic template management
    saveTemplate: (template: Template) => {
      set((state) => {
        state.templates[template.id] = template;
      });
    },
    removeTemplate: (id: string) => {
      set((state) => {
        delete state.templates[id];
      });
    },
    getTemplatesByType: (type: string) => {
      const state = get();
      return Object.values(state.templates).filter((template: Template) => template.type === type);
    },
  })),
);

export default useAppState;
