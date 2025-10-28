import { MD, SM } from '@zendeskgarden/react-typography';
import { DEFAULT_THEME, ThemeProvider, ColorSchemeProvider, useColorScheme } from '@zendeskgarden/react-theming';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { getAppState, getCurrentVersion, setAppState } from '../lib/chromeExtension';
import { Spinner } from '@zendeskgarden/react-loaders';
import useAppState from '../storage';
import { ToastProvider } from '@zendeskgarden/react-notifications';
import ZendeskIcon from '@zendeskgarden/svg-icons/src/26/zendesk.svg?react';
import { Navigate, Route, Routes } from 'react-router';
import RootLayout from './RootLayout';
import SkeletonsLayout from '@/modules/Skeletons/Layouts/RootLayout';
import Skeletons from '@/modules/Skeletons/Pages/Skeletons';
import Categories from '@/modules/Categories/Pages/Categories';
import NewSkeleton from '@/modules/Skeletons/Pages/NewSkeleton';
import EditSkeleton from '@/modules/Skeletons/Pages/EditSkeleton';
import Scenarios from '@/modules/Scenarios/Pages/Scenarios';
import NewScenario from '@/modules/Scenarios/Pages/NewScenario';
import EditScenario from '@/modules/Scenarios/Pages/EditScenario';
import { syncState } from '@/actions';
import defaultIntents from '../../default-intents.json';

const Popup = () => {
  const { colorScheme } = useColorScheme();
  const [loading, setLoading] = useState(true);

  const setInitalState = useAppState((state: any) => state.setInitialState);
  const version = useAppState((state: any) => state.version);
  const initialRoute = useAppState((state: any) => state.initialRoute);

  const getInitialState = async () => {
    setLoading(true);
    const state = await getAppState();
    const version = await getCurrentVersion();
    const initialIntents = (state.intents ?? []).filter(
      (item: any) => defaultIntents.findIndex((defaultItem) => defaultItem.value === item.value) === -1,
    );
    const intents = [...defaultIntents, ...initialIntents];
    setInitalState({ ...state, intents, version });
    setAppState({
      currentDashboard: null,
      initialRoute: null,
      templates: state.templates, // Compativility with previos admin dashboar, we can ereasee this at some point
    });
    setLoading(false);
  };

  useEffect(() => {
    getInitialState();
  }, []);

  return (
    <ThemeProvider
      theme={{ ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, base: colorScheme, primaryHue: 'green' } }}
    >
      <ToastProvider zIndex={10}>
        <Header>
          <ZendeskIcon style={{ color: 'white' }} width={25} height={25} />
          <Title style={{ fontWeight: '900', color: '#eee' }}>DemoLens</Title>
          <SM style={{ color: 'white', marginLeft: 'auto' }}>v {version}</SM>
        </Header>
        {loading ? ( // Remove this once data is been saved in the BE
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Spinner size="large" />
            <SM>Loading...</SM>
          </div>
        ) : (
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<Navigate to={initialRoute ? initialRoute : '/skeletons'} replace />} />
              <Route path="skeletons" element={<SkeletonsLayout />}>
                <Route index element={<Skeletons />} />
                <Route path="categories/*" element={<Categories />} />
                <Route path="new" element={<NewSkeleton />} />
                <Route path=":skeletonId" element={<EditSkeleton />} />
              </Route>
              <Route path="scenarios">
                <Route index element={<Scenarios />} />
                <Route path="new" element={<NewScenario />} />
                <Route path=":scenarioId" element={<EditScenario />} />
              </Route>
            </Route>
          </Routes>
        )}
      </ToastProvider>
    </ThemeProvider>
  );
};

const withProviders = (Component: any) => {
  return () => {
    return (
      <ColorSchemeProvider initialColorScheme="light">
        <Component />
      </ColorSchemeProvider>
    );
  };
};

// Helper function to check if a value is in its initial/empty state
const isInitialState = (value: any): boolean => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
    return true;
  }

  return !value;
};

// Queue system to handle sync operations sequentially
let syncQueue: Promise<any> = Promise.resolve();

const queueSync = async (payload: any): Promise<any> => {
  syncQueue = syncQueue.then(async () => {
    try {
      await syncState(payload);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  });
  return syncQueue;
};

useAppState.subscribe((newState: any, previousState: any) => {
  const syncPayload: any = {};

  const propertiesToSync = ['dashboards', 'configurations', 'intents', 'templates'];

  propertiesToSync.forEach((property) => {
    const newValue = newState[property];
    const previousValue = previousState[property];

    // const isPreviousStateInitial = isInitialState(previousValue);
    const hasChanged = JSON.stringify(newValue) !== JSON.stringify(previousValue);

    if (hasChanged) {
      syncPayload[property] = newValue;
    }
  });

  if (Object.keys(syncPayload).length > 0) {
    queueSync(syncPayload);
  }
});

export default withProviders(Popup);

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${({ theme }) => theme.palette.black};

  padding: ${({ theme }) => theme.space.md};
`;

const Title = styled(MD)`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`;
