import Autocomplete from '@/components/ui/Autocomplete';
import { getRandomId, randInt, toSnakeCase } from '@/lib/general';
import useAppState from '@/storage';
import { Button } from '@zendeskgarden/react-buttons';
import { Field, Input, Select } from '@zendeskgarden/react-forms';
import { useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
};

export const RECOMMENDATION_ACTION_TYPES = {
  assignee: 'assignee_id',
  group: 'group_id',
};

const DEFAULT_INITIAL_VALUES = {
  action: null,
  intent: [],
  actionType: RECOMMENDATION_ACTION_TYPES.assignee,
};

const RecommendationForm = ({ onCancel, onSubmit, initialValues = DEFAULT_INITIAL_VALUES }: Props) => {
  const [values, setValues] = useState<any>(initialValues);
  const [error, setError] = useState<any>(false);
  const intents = useAppState((state: any) => state.intents);
  const addIntent = useAppState((state: any) => state.addIntent);

  const initialMetrics = useMemo(() => {
    return {
      analysedPeriod: randInt(1, 30),
      metricExpectedImprovement: randInt(3600, 12000),
      numTickets: randInt(1, 1000),
      percentTickets: randInt(1, 100) / 100,
      precision: randInt(1, 100) / 100,
    };
  }, []);

  const onSelectAction = (value: string) => {
    if (!value) return setValues((prev: any) => ({ ...prev, action: null }));
    setValues((prev: any) => ({ ...prev, action: { value: toSnakeCase(value), title: value } }));
  };

  const onSelectIntent = (intent: any) => {
    setValues((prev: any) => ({ ...prev, intent }));
  };

  const onSelectActionType = (actionType: string) => {
    setValues((prev: any) => ({ ...prev, actionType }));
    onSelectAction('');
  };

  const onAddNewIntent = (value: string) => {
    const newIntent = { value: toSnakeCase(value), title: value };
    addIntent(newIntent);
    onSelectIntent([...values.intent, newIntent]);
  };

  const onRemoveIntent = (value: string) => {
    const newIntents = values.intent.filter((item: any) => value !== item.value);
    setValues((prev: any) => ({ ...prev, intent: newIntents }));
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
      <Field>
        <Field.Label>Action to</Field.Label>
        <Input
          value={values.action?.title}
          onChange={(e) => onSelectAction(e.target.value)}
          {...(error && !values.action ? { validation: 'error' } : {})}
        />
        {error && !values.action && (
          <Field.Message validation="error">
            {values.actionType === RECOMMENDATION_ACTION_TYPES.assignee
              ? 'Please type an assignee'
              : 'Please type a group'}
          </Field.Message>
        )}
      </Field>
      <Autocomplete
        label="Intent"
        onSelect={onSelectIntent}
        options={intents}
        error={error && !values.intent.length}
        errorMessage="Please select an intent"
        selectedOption={values.intent}
        isMultiselectable
        onAddItem={(value) => onAddNewIntent(value)}
        onRemoveItem={(value) => onRemoveIntent(value)}
      />
      <Footer>
        <Button type="button" size="medium" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" isPrimary size="medium" onClick={handleSubmit}>
          Save
        </Button>
      </Footer>
    </>
  );
};

const Footer = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid #ccc;
  padding-top: 16px;
`;

export default RecommendationForm;
