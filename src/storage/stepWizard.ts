import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type StepWizardState = {
  step: number;
  totalSteps: number;
  setValue: (key: string, value: any) => void;
  values: Record<string, any>;
  next: () => void;
  prev: () => void;
};

type StepWizardInitialValues = {
  totalSteps: number;
};

export const createStepWizardStore = ({ totalSteps }: StepWizardInitialValues) =>
  createStore<StepWizardState>()(
    immer((set) => ({
      step: 0,
      totalSteps,
      values: {},
      setValue: (key: string, value: any) => {
        set((state) => {
          state.values[key] = value;
        });
      },
      next: () => {
        set((state) => {
          state.step = Math.min(state.step + 1, state.totalSteps - 1);
        });
      },
      prev: () => {
        set((state) => {
          state.step = Math.max(0, state.step - 1);
        });
      },
    })),
  );
