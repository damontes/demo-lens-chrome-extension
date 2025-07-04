import { Button } from '@zendeskgarden/react-buttons';
import { Field, Input, Fieldset, Checkbox } from '@zendeskgarden/react-forms';
import { useState } from 'react';
import styled from 'styled-components';
import useAppState from '@/storage';
import { Notification, useToast } from '@zendeskgarden/react-notifications';
import { Accordion } from '@zendeskgarden/react-accordions';
import AdminInterceptor from '@/models/adminInterceptor';
import { Tag } from '@zendeskgarden/react-tags';

const DEFAULT_INITIAL_VALUES: { name: string; dashboards: string[] } = {
  name: '',
  dashboards: [],
};

type Props = {
  onClose: () => void;
  handleSubmit: (values: { name: string; dashboards: string[] }) => void;
  initialValues?: typeof DEFAULT_INITIAL_VALUES;
};

const ScenarioForm = ({ onClose, handleSubmit, initialValues = DEFAULT_INITIAL_VALUES }: Props) => {
  const [values, setValues] = useState(initialValues);
  const [showError, setShowError] = useState(false);

  const dashboards = useAppState((state) => state.dashboards);
  const { addToast } = useToast();

  const dashboardEntries = Object.entries(dashboards);
  const dashbordsByType = Object.groupBy(dashboardEntries, ([_, dashboard]: any) => dashboard.type);

  const onSubmit = (e: any) => {
    e.preventDefault();

    const selectedDashboards = values.dashboards.length;

    if (!selectedDashboards) {
      setShowError(true);
      return;
    }

    handleSubmit(values);
  };

  const onAddDashboard = (id: string, dashboardId: string) => {
    const selectedDashboards = values.dashboards;

    const dashboardIds = Object.entries(dashboards)
      .filter(([id]) => selectedDashboards.includes(id))
      .map(([_, item]: any) => item.dashboardId);

    const alreadyExist = selectedDashboards.includes(id);

    if (alreadyExist) {
      setValues((prev: any) => ({
        ...prev,
        dashboards: prev.dashboards.filter((comparedId: string) => comparedId !== id),
      }));
      return;
    }

    const isDuplicated = dashboardIds.includes(dashboardId);

    if (isDuplicated) {
      addToast(
        ({ close }) => (
          <Notification type="warning" style={{ maxWidth: '80%' }}>
            <Notification.Title>Warning</Notification.Title>
            Two dashboards of the same type cannot be selected, please unselect the other one.
            <Notification.Close aria-label="Close" onClick={close} />
          </Notification>
        ),
        { placement: 'top-end' },
      );
      return;
    }

    setValues((prev: any) => ({
      ...prev,
      dashboards: [...prev.dashboards, id],
    }));
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
        <Accordion level={4}>
          {Object.entries(dashbordsByType).map(([type, dashboards]: any) => {
            return (
              <Accordion.Section>
                <Accordion.Header>
                  <Accordion.Label>{type}</Accordion.Label>
                </Accordion.Header>
                <Accordion.Panel>
                  {dashboards.map(([id, item]: any) => {
                    return (
                      <Field key={id}>
                        <Checkbox
                          checked={values.dashboards.includes(id)}
                          onChange={() => onAddDashboard(id, item.dashboardId)}
                        >
                          <Field.Label>
                            {item.name}
                            {type === AdminInterceptor.getDashboardType() ? (
                              <Tag hue="yellow" isPill size="small">
                                Instance: {item.dashboardId.split(':').at(0)}
                              </Tag>
                            ) : null}
                          </Field.Label>
                        </Checkbox>
                      </Field>
                    );
                  })}
                </Accordion.Panel>
              </Accordion.Section>
            );
          })}
        </Accordion>

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

export default ScenarioForm;
