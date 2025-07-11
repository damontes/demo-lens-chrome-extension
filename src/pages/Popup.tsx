import { MD, SM } from '@zendeskgarden/react-typography';
import { DEFAULT_THEME, ThemeProvider, ColorSchemeProvider, useColorScheme } from '@zendeskgarden/react-theming';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { getAppState, getCurrentTabDetails, getCurrentVersion, setAppState } from '../lib/chromeExtension';
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

const Popup = () => {
  const { colorScheme } = useColorScheme();
  const [loading, setLoading] = useState(true);

  const setInitalState = useAppState((state: any) => state.setInitialState);
  const version = useAppState((state: any) => state.version);
  const initialRoute = useAppState((state: any) => state.initialRoute);

  const getInitialState = async () => {
    setLoading(true);
    const state = await getAppState();
    const dashboardDetails = await getCurrentTabDetails();
    const version = await getCurrentVersion();
    setInitalState({ ...state, dashboardDetails, version });
    setAppState({ currentDashboard: null, initialRoute: null });
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

useAppState.subscribe((newState, previousState) => {
  if (JSON.stringify(newState.dashboards) !== JSON.stringify(previousState.dashboards)) {
    syncState({
      dashboards: newState.dashboards,
      currentDashboard: null,
    });
  } else if (JSON.stringify(newState.configurations) !== JSON.stringify(previousState.configurations)) {
    syncState({
      configurations: newState.configurations,
    });
  } else if (newState.intents.length !== previousState.intents.length) {
    syncState({
      intents: newState.intents,
    });
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
