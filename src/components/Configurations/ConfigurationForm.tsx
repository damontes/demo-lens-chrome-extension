import { Button } from '@zendeskgarden/react-buttons';
import { Field, Input, Fieldset, Checkbox } from '@zendeskgarden/react-forms';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import useAppState from '@/storage';

const DEFAULT_INITIAL_VALUES: { name: string; dashboards: string[] } = {
  name: '',
  dashboards: [],
};

type Props = {
  onClose: () => void;
  handleSubmit: (values: { name: string; dashboards: string[] }) => void;
  initialValues?: typeof DEFAULT_INITIAL_VALUES;
};

const ConfigurationForm = ({ onClose, handleSubmit, initialValues = DEFAULT_INITIAL_VALUES }: Props) => {
  const [values, setValues] = useState(initialValues);
  const [showError, setShowError] = useState(false);

  const dashboards = useAppState((state: any) => state.dashboards);

  const onSubmit = (e: any) => {
    e.preventDefault();

    const selectedDashboards = values.dashboards.length;

    if (!selectedDashboards) {
      setShowError(true);
      return;
    }

    handleSubmit(values);
  };

  return (
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

        {showError && <Field.Message validation="error">At least one dashboard must be selected</Field.Message>}
      </Fieldset>

      <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
        <Button size="medium" style={{ width: '100%' }} onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isPrimary size="medium" style={{ width: '100%' }}>
          Save
        </Button>
      </footer>
    </Form>
  );
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export default ConfigurationForm;
