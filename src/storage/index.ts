// @ts-nocheck

import { act } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useAppState = create()(
  immer((set) => ({
    configurations: {},
    dashboards: {},
    dashboadDetails: {},
    activeConfiguration: '',
    version: 0,
    isEnabled: false,
    setInitialState: (state) => {
      set(state);
    },
    addDashboard: (id, dashboard) =>
      set((state) => {
        state.dashboards[id] = dashboard;
      }),
    saveTab: (id, tabIndex, tab) => {
      set((state) => {
        state.dashboards[id].tabs[tabIndex] = tab;
      });
    },
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
  })),
);

export default useAppState;
