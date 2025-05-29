import { createStepWizardStore } from '@/storage/stepWizard';
import { createContext, ReactNode, useContext } from 'react';
import { useStore } from 'zustand';

type StepWizardStore = ReturnType<typeof createStepWizardStore>;

const StepWizardStoreContext = createContext<StepWizardStore | null>(null);

export const StepWizardProvider = ({ children, totalSteps }: { children: ReactNode; totalSteps: number }) => {
  const store = createStepWizardStore({ totalSteps });
  return <StepWizardStoreContext.Provider value={store}>{children}</StepWizardStoreContext.Provider>;
};

export const useStepWizardStore = <T,>(selector: (state: ReturnType<StepWizardStore['getState']>) => T): T => {
  const store = useContext(StepWizardStoreContext);
  if (!store) throw new Error('useStepperStore must be used within StepperProvider');
  return useStore(store, selector);
};
