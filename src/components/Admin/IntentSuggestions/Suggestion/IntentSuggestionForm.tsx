import { useForm, useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { Field, Input, Select, Textarea } from '@zendeskgarden/react-forms';
import { Button } from '@zendeskgarden/react-buttons';
import { INTENT_SUGGESTIONS_CATEGORIES } from '@/constants';

type Props = {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  initialValues?: any;
};

const DEFAULT_INITIAL_VALUES = {
  label: '',
  description: '',
  parentCategory: '',
  childCategory: '',
};

const IntentSuggestionForm = ({ onSubmit, onCancel, initialValues = DEFAULT_INITIAL_VALUES }: Props) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  const parentCategory = useWatch({ control, name: 'parentCategory' });
  const selectedParentCategory = INTENT_SUGGESTIONS_CATEGORIES.find((cat) => cat.tag === parentCategory);

  const onFormSubmit = (values: any) => {
    // Format the values and generate ID if it's a new suggestion
    const formattedValues = {
      ...values,
      id: initialValues.id || `intent_suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    onSubmit(formattedValues);
  };

  return (
    <Container>
      <FormGrid>
        <Field>
          <Field.Label>Parent Category *</Field.Label>
          <Select
            {...register('parentCategory', { required: 'Parent category is required' })}
            validation={errors.parentCategory ? 'error' : undefined}
          >
            <option value="">Select a parent category</option>
            {INTENT_SUGGESTIONS_CATEGORIES.map((category) => (
              <option key={category.tag} value={category.tag}>
                {category.label}
              </option>
            ))}
          </Select>
          {errors.parentCategory && (
            <Field.Message validation="error">{String(errors.parentCategory.message)}</Field.Message>
          )}
          <Field.Hint>The main category this intent belongs to</Field.Hint>
        </Field>

        <Field>
          <Field.Label>Child Category *</Field.Label>
          <Select
            {...register('childCategory', { required: 'Child category is required' })}
            validation={errors.childCategory ? 'error' : undefined}
            disabled={!parentCategory}
          >
            <option value="">Select a child category</option>
            {selectedParentCategory?.children.map((childCategory: any) => (
              <option key={childCategory.tag} value={childCategory.tag}>
                {childCategory.label}
              </option>
            ))}
          </Select>
          {errors.childCategory && (
            <Field.Message validation="error">{String(errors.childCategory.message)}</Field.Message>
          )}
          <Field.Hint>The specific subcategory this intent belongs to</Field.Hint>
        </Field>
        <Field>
          <Field.Label>Label *</Field.Label>
          <Input
            {...register('label', { required: 'Label is required' })}
            validation={errors.label ? 'error' : undefined}
            placeholder="e.g., Password reset requests"
          />
          {errors.label && <Field.Message validation="error">{String(errors.label.message)}</Field.Message>}
          <Field.Hint>A clear, descriptive name for this intent suggestion</Field.Hint>
        </Field>

        <Field>
          <Field.Label>Description *</Field.Label>
          <Textarea
            {...register('description', { required: 'Description is required' })}
            validation={errors.description ? 'error' : undefined}
            placeholder="e.g., User requests for password resets, login issues, and authentication problems"
            rows={3}
          />
          {errors.description && <Field.Message validation="error">{String(errors.description.message)}</Field.Message>}
          <Field.Hint>Detailed description of what this intent covers</Field.Hint>
        </Field>
      </FormGrid>

      <ButtonRow>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" isPrimary onClick={handleSubmit(onFormSubmit)}>
          Save
        </Button>
      </ButtonRow>
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

export default IntentSuggestionForm;
