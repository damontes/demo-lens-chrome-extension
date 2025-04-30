import { LG, MD } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import useAppState from '@/storage';
import ConfigurationForm from './ConfigurationForm';
import { getRandomId } from '@/lib/general';

const CreateConfiguration = ({ onClose }: any) => {
  const addConfiguration = useAppState((state: any) => state.addConfiguration);

  const handleSubmit = async (newConfiguration: any) => {
    const id = getRandomId();
    addConfiguration(id, newConfiguration);
    onClose();
  };

  return (
    <Container>
      <Header>
        <Title>Create configuration</Title>
        <Description>Group multiple dashboards to create a configuration.</Description>
      </Header>
      <ConfigurationForm onClose={onClose} handleSubmit={handleSubmit} />
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

export default CreateConfiguration;
