import { Field, Combobox, Option } from '@zendeskgarden/react-dropdowns';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  label: string;
  selectedOption: any;
  onSelect: (option: any) => void;
  options: any[];
  onAddItem?: (value: string) => void;
  onRemoveItem?: (value: string[]) => void;
  isMultiselectable?: boolean;
  error?: boolean;
  errorMessage?: string;
};

const Autocomplete = ({
  selectedOption,
  options,
  label,
  onSelect,
  error = false,
  errorMessage = '',
  isMultiselectable = false,
  onAddItem,
  onRemoveItem,
}: Props) => {
  const [inputValue, setInputValue] = useState(!isMultiselectable ? selectedOption?.title : '');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (event: any) => {
    const { type, selectionValue, inputValue: currentInputValue, isExpanded } = event;
    if (type === 'input:change') {
      setInputValue(currentInputValue);
      return;
    }

    if (type === 'input:keyDown:Enter' && onAddItem) {
      onAddItem(inputValue);
      setInputValue('');
    }

    if (type === 'fn:setSelectionValue' && selectionValue && isMultiselectable) {
      onRemoveItem?.(selectionValue);
    }

    if (type === 'option:click') {
      const option = isMultiselectable
        ? selectionValue.map((value: string) => options.find((option) => option.value === value))
        : options.find((option) => option.value === selectionValue);
      onSelect(option);
    }

    if (typeof isExpanded !== 'undefined') {
      setIsExpanded(isExpanded);
    }
  };

  const filterOptions = useMemo(() => {
    if (!inputValue) return options;
    const regex = new RegExp(inputValue.replace(/[.*+?^${}()|[\]\\]/giu, '\\$&'), 'giu');
    return options.filter((option) => option.title.match(regex));
  }, [inputValue, options]);

  useEffect(() => {
    if (!isExpanded && selectedOption && !inputValue && !isMultiselectable) {
      setInputValue(selectedOption.title);
    }
  }, [isExpanded]);

  return (
    <Field style={{ flex: 1 }}>
      <Field.Label>{label}</Field.Label>
      <Combobox
        isAutocomplete
        onChange={handleChange}
        selectionValue={isMultiselectable ? selectedOption?.map((option: any) => option.value) : selectedOption?.value}
        inputValue={inputValue}
        isMultiselectable={isMultiselectable}
        maxHeight="auto"
        {...(error ? { validation: 'error' } : {})}
      >
        {filterOptions.length === 0 ? (
          <Option isDisabled label="" value="No matches found" />
        ) : (
          filterOptions.map((item) => <Option key={item.value} value={item.value} label={item.title} />)
        )}
      </Combobox>
      {error && <Field.Message validation="error">{errorMessage}</Field.Message>}
    </Field>
  );
};

export default Autocomplete;
