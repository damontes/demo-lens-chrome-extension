import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import PencilIcon from '@zendeskgarden/svg-icons/src/16/pencil-fill.svg?react';

interface Props {
  value: string;
  style: React.CSSProperties;
  onChange?: (value: string) => void;
}

const TextEditable = ({ value = '', style = {}, onChange }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPencil, setShowPencil] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onFocus = () => {
    setIsEditing(true);
  };

  const onBlur = () => {
    setIsEditing(false);
    const value = inputRef.current?.value.trim() || '';
    onChange?.(value);
  };

  const getInputTextWidth = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const input = inputRef.current;
    const defaultWidth = inputRef.current?.offsetWidth || 0;

    if (!context || !input) {
      return defaultWidth;
    }

    const style = getComputedStyle(input!);
    context.font = `${style.fontSize} ${style.fontFamily}`;

    const currentLength = context.measureText(input?.value ?? '').width + 24;

    return Math.min(currentLength, defaultWidth);
  };

  useEffect(() => {
    inputRef.current?.addEventListener('mouseenter', () => {
      setShowPencil(true);
    });
    inputRef.current?.addEventListener('mouseleave', () => {
      setShowPencil(false);
    });
  }, []);

  return (
    <Container>
      <Input
        isEditing={isEditing}
        ref={inputRef}
        style={style}
        defaultValue={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
      />
      {!isEditing && (
        <PencilIcon
          width={14}
          height={14}
          style={{
            position: 'absolute',
            left: getInputTextWidth(),
            top: 4,
            transition: 'opacity 0.1s ease-in-out',
            opacity: showPencil ? 1 : 0,
          }}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input<{ isEditing: boolean }>`
  border: ${({ isEditing }) => (isEditing ? '1px solid #eee' : '1px solid transparent')};
  border-radius: 4px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  background: transparent;
  font-size: inherit;
  color: inherit;
  font-family: inherit;
  outline: none;
  padding: 0px;
  margin: 0;
  box-shadow: none;
  resize: none;
`;

export default TextEditable;
