import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ChevronDownIcon } from '../icons';

const Collapsable = ({ headerContent, children, isActive }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    containerRef.current?.addEventListener('toggle', () => {
      if (!containerRef.current) return;
      setIsOpen(containerRef.current.open);
    });
  }, []);

  return (
    <Details ref={containerRef} isActive={isActive}>
      <summary>
        {headerContent}
        <ChevronDownIcon
          style={{
            width: '16px',
            height: '16px',
            marginLeft: 'auto',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
          }}
        />
      </summary>
      {children}
    </Details>
  );
};

const Details = styled.details<{ isActive: boolean }>`
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: ${({ theme }) => theme.borderRadii.md};
  border: 1px solid ${({ theme, isActive }) => (isActive ? theme.palette.green[600] : theme.palette.grey[200])};

  summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    cursor: pointer;
    flex: 1;
  }
`;
export default Collapsable;
