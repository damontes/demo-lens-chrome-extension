import { LG, MD } from '@zendeskgarden/react-typography';
import styled from 'styled-components';
import useAppState from '@/storage';
import { getRandomId } from '@/lib/general';
import ScenarioForm from '../Components/ScenarioForm';
import { useNavigate } from 'react-router';

const NewScenario = () => {
  const addConfiguration = useAppState((state) => state.addConfiguration);
  const navigate = useNavigate();

  const onClose = () => {
    navigate(-1);
  };

  const handleSubmit = async (newConfiguration: any) => {
    const id = getRandomId();
    addConfiguration(id, newConfiguration);
    onClose();
  };

  return (
    <Container>
      <Header>
        <Title>Create a scneario</Title>
        <Description>Group multiple skeletons to create a scenario.</Description>
      </Header>
      <ScenarioForm onClose={onClose} handleSubmit={handleSubmit} />
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

export default NewScenario;
