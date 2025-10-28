import { useForm } from 'react-hook-form';
import { Field, Input } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import styled from 'styled-components';

type Props = {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  initialValues?: any;
};

const DEFAULT_INITIAL_VALUES = {
  feedback_last_rating: 5,
  bsat_response_count: 0,
  total_feedback_response_rate: 0,
};

const FeedbackRatingForm = ({ onSubmit, onCancel, initialValues }: Props) => {
  // Merge initialValues with defaults, ensuring we have proper values
  const mergedInitialValues = {
    ...DEFAULT_INITIAL_VALUES,
    ...initialValues,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: mergedInitialValues,
  });

  const onFormSubmit = (values: any) => {
    const formattedValues = {
      feedback_last_rating: Number(values.feedback_last_rating),
      bsat_response_count: Number(values.bsat_response_count),
      total_feedback_response_rate: Number(values.total_feedback_response_rate),
    };
    onSubmit(formattedValues);
  };

  return (
    <Container>
      <FormGrid>
        <Field>
          <Field.Label>Rating (1-5) *</Field.Label>
          <Input
            type="number"
            min="1"
            max="5"
            placeholder="5"
            {...register('feedback_last_rating', {
              required: 'Rating is required',
              valueAsNumber: true,
              min: { value: 1, message: 'Rating must be between 1-5' },
              max: { value: 5, message: 'Rating must be between 1-5' },
            })}
            validation={errors.feedback_last_rating ? 'error' : undefined}
          />
          {errors.feedback_last_rating && (
            <Field.Message validation="error">{errors.feedback_last_rating.message?.toString()}</Field.Message>
          )}
        </Field>

        <Field>
          <Field.Label>BSAT Response Count</Field.Label>
          <Input type="number" min="0" placeholder="13" {...register('bsat_response_count')} />
        </Field>

        <Field>
          <Field.Label>Total Feedback Response Rate</Field.Label>
          <Input
            type="number"
            step="any"
            min="0"
            max="100"
            placeholder="50"
            {...register('total_feedback_response_rate')}
          />
        </Field>
      </FormGrid>

      <Footer>
        <Button onClick={onCancel} isNeutral>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onFormSubmit)} isPrimary>
          Save
        </Button>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const Footer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
`;

export default FeedbackRatingForm;
