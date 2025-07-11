import { syncState } from '@/actions';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type AppState = {
  configurations: Record<string, any>;
  dashboards: Record<string, any>;
  dashboardDetails: Record<string, any>;
  activeConfiguration: string;
  version: number;
  setInitialState: (state: AppState) => void;
  saveDashboard: (id: string, dashboard: any) => void;
  removeDashboard: (id: string) => void;
  addConfiguration: (id: string, configuration: any) => void;
  removeConfiguration: (id: string) => void;
  setActiveConfiguration: (id: string) => void;
  intents: Record<string, any>[];
};

const useAppState = create<AppState>()(
  immer((set) => ({
    configurations: {},
    dashboards: {},
    dashboardDetails: {},
    activeConfiguration: '',
    version: 0,
    isEnabled: false,
    intents: [],
    setInitialState: (state) => {
      set(state);
    },
    saveDashboard: (id, dashboard) =>
      set((state) => {
        state.dashboards[id] = dashboard;
      }),
    removeDashboard: (id) =>
      set((state) => {
        delete state.dashboards[id];
      }),
    addConfiguration: (id, configuration) => {
      set((state) => {
        state.configurations[id] = configuration;
      });
    },
    removeConfiguration: (id) =>
      set((state) => {
        delete state.configurations[id];
      }),
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
  })),
);

export default useAppState;
