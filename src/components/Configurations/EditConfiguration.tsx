import { LG, MD } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import useAppState from '@/storage';
import ConfigurationForm from './ConfigurationForm';
import { reloadDashboard } from '@/actions';

const EditConfiguration = ({ configurationId, onClose }: any) => {
  const addConfiguration = useAppState((state) => state.addConfiguration);
  const configurations = useAppState((state) => state.configurations);
  const initialValues = configurations[configurationId];

  const handleSubmit = async (newConfiguration: any) => {
    addConfiguration(configurationId, newConfiguration);
    await reloadDashboard();
    onClose();
  };

  return (
    <Container>
      <Header>
        <Title>{initialValues.name}</Title>
        <Description>Edit configuration</Description>
      </Header>
      <ConfigurationForm onClose={onClose} handleSubmit={handleSubmit} initialValues={initialValues} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Title = styled(LG)`
  margin: 0;
  font-weight: bold;
`;

const Description = styled(MD)`
  margin: 0;
  color: ${({ theme }) => theme.palette.grey[600]};
`;

export default EditConfiguration;
