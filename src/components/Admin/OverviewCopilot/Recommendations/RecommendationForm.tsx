import Autocomplete from '@/components/ui/Autocomplete';
import { formatSecondsToHourMinutes, getRandomId, randInt } from '@/lib/general';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Select } from '@zendeskgarden/react-forms';
import { SM } from '@zendeskgarden/react-typography';
import { act, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = {
  onCancel: () => void;
  groups: any[];
  intents: any[];
  assignees?: any[];
  onSubmit: (values: any) => void;
  initialValues?: any;
};

export const RECOMMENDATION_ACTION_TYPES = {
  assignee: 'assignee_id',
  group: 'group_id',
};

const DEFAULT_INITIAL_VALUES = {
  action: null,
  intent: null,
  actionType: RECOMMENDATION_ACTION_TYPES.assignee,
};

const RecommendationForm = ({
  groups = [],
  intents = [],
  assignees = [],
  onCancel,
  onSubmit,
  initialValues = DEFAULT_INITIAL_VALUES,
}: Props) => {
  const [values, setValues] = useState<any>(initialValues);
  const [error, setError] = useState<any>(false);

  const initialMetrics = useMemo(() => {
    return {
      analysedPeriod: randInt(1, 30),
      metricExpectedImprovement: randInt(3600, 12000),
      numTickets: randInt(1, 1000),
      percentTickets: randInt(1, 100) / 100,
      precision: randInt(1, 100) / 100,
    };
  }, []);

  const onSelectAction = (action: any) => {
    setValues((prev: any) => ({ ...prev, action }));
  };

  const onSelectIntent = (intent: any) => {
    setValues((prev: any) => ({ ...prev, intent }));
  };

  const onSelectActionType = (actionType: string) => {
    setValues((prev: any) => ({ ...prev, actionType }));
    onSelectAction(null);
  };

  const handleSubmit = () => {
    if (!values.action || !values.intent) {
      setError(true);
      return;
    }

    setError(false);
    const payload = {
      id: getRandomId(),
      ...initialMetrics,
      ...values,
    };

    onSubmit(payload);
  };

  return (
    <>
      <Field>
        <Field.Label>Action</Field.Label>
        <Select value={values.actionType} onChange={(e) => onSelectActionType(e.target.value)}>
          <option value={RECOMMENDATION_ACTION_TYPES.assignee}>Assignee</option>
          <option value={RECOMMENDATION_ACTION_TYPES.group}>Group</option>
        </Select>
      </Field>
      <Autocomplete
        label="Action to"
        onSelect={onSelectAction}
        options={values.actionType === RECOMMENDATION_ACTION_TYPES.assignee ? assignees : groups}
        error={error && !values.action}
        errorMessage={RECOMMENDATION_ACTION_TYPES.assignee ? 'Please select an assignee' : 'Please select a group'}
        selectedOption={values.action}
      />
      <Autocomplete
        label="Intent"
        onSelect={onSelectIntent}
        options={intents}
        error={error && !values.intent}
        errorMessage="Please select an intent"
        selectedOption={values.intent}
        isMultiselectable
      />
      <div style={{ maxWidth: '90%' }}>
        <SM style={{ fontWeight: 'bold' }}>
          Improve resolution time by{' '}
          {formatSecondsToHourMinutes(values.metricExpectedImprovement ?? initialMetrics.metricExpectedImprovement)}
        </SM>
        <Subtitle>
          Route to the group <b>{values.action?.title ?? '<Select action tO>'}</b> tickets with intent(s):{' '}
          <b>{values.intent?.map((item: any) => item.title).join(', ') ?? '<Select Intent(s)>'}</b>
        </Subtitle>
      </div>
      <Footer>
        <Button type="button" size="medium" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" isPrimary size="medium" onClick={handleSubmit}>
          Add
        </Button>
      </Footer>
    </>
  );
};

const Subtitle = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[600]};
`;

const Footer = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #ccc;
  padding-top: 16px;
`;

export default RecommendationForm;
