import { Button } from '@zendeskgarden/react-buttons';
import { Field, Input, Fieldset, Checkbox } from '@zendeskgarden/react-forms';
import { LG, MD } from '@zendeskgarden/react-typography';
import { useState } from 'react';
import styled from 'styled-components';
import useAppState from '../storage';

const DEFAULT_INITIAL_VALUES: { name: string; dashboards: string[] } = {
  name: '',
  dashboards: [],
};

const CreateConfiguration = ({ onClose, handleSubmit }: any) => {
  const [values, setValues] = useState<{ name: string; dashboards: string[] }>(DEFAULT_INITIAL_VALUES);
  const dashboards = useAppState((state: any) => state.dashboards);

  const onSubmit = (e: any) => {
    e.preventDefault();
    handleSubmit(values);
  };

  return (
    <Container>
      <Header>
        <Title>Create configuration</Title>
        <Description>Group multiple dashboards to create a configuration.</Description>
      </Header>
      <Form onSubmit={onSubmit}>
        <Field>
          <Field.Label>Dashboard name</Field.Label>
          <Input
            placeholder="Demo setup"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            required
          />
        </Field>
        <Fieldset>
          <Fieldset.Legend>Select dashboards</Fieldset.Legend>
          {Object.entries(dashboards).map(([id, item]: any) => {
            return (
              <Field key={id}>
                <Checkbox
                  checked={values.dashboards.includes(id)}
                  onChange={() => {
                    setValues((prev: any) => ({
                      ...prev,
                      dashboards: prev.dashboards.includes(id)
                        ? prev.dashboards.filter((comparedId: string) => comparedId !== id)
                        : [...prev.dashboards, id],
                    }));
                  }}
                >
                  <Field.Label>{item.name}</Field.Label>
                </Checkbox>
              </Field>
            );
          })}
        </Fieldset>

        <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
          <Button size="medium" style={{ width: '100%' }} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isPrimary size="medium" style={{ width: '100%' }}>
            Create configuration
          </Button>
        </footer>
      </Form>
    </Container>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

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
