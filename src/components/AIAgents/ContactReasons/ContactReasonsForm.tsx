import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MD, SM } from '@zendeskgarden/react-typography';
import { Button } from '@zendeskgarden/react-buttons';
import styled from 'styled-components';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';
import PhoneIcon from '@zendeskgarden/svg-icons/src/16/phone-stroke.svg?react';
import UseCaseItem from './UseCase/UseCaseItem';
import AddUseCase from './UseCase/AddUseCase';
import KnowledgeSourceItem from './KnowledgeSource/KnowledgeSourceItem';
import AddKnowledgeSource from './KnowledgeSource/AddKnowledgeSource';

const ContactReasonsForm: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const [showAddUseCase, setShowAddUseCase] = useState(false);
  const [showAddKnowledgeSource, setShowAddKnowledgeSource] = useState(false);

  const contactReasons = watch('contactReasons');

  // Use Case handlers
  const handleAddUseCase = (useCaseData: any) => {
    const currentUseCases = contactReasons?.useCases || [];
    const newUseCase = {
      ...useCaseData,
      id: `usecase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setValue('contactReasons.useCases', [...currentUseCases, newUseCase]);
    setShowAddUseCase(false);
  };

  const handleEditUseCase = (index: number, useCaseData: any) => {
    const currentUseCases = contactReasons?.useCases || [];
    const updatedUseCases = currentUseCases.map((item: any, idx: number) =>
      idx === index ? { ...useCaseData, id: item.id } : item,
    );
    setValue('contactReasons.useCases', updatedUseCases);
  };

  const handleRemoveUseCase = (index: number) => {
    const currentUseCases = contactReasons?.useCases || [];
    const updatedUseCases = currentUseCases.filter((_: any, idx: number) => idx !== index);
    setValue('contactReasons.useCases', updatedUseCases);
  };

  // Knowledge Source handlers
  const handleAddKnowledgeSource = (knowledgeSourceData: any) => {
    const currentKnowledgeSources = contactReasons?.knowledgeSources || [];
    const newKnowledgeSource = {
      ...knowledgeSourceData,
      id: `knowledge_source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setValue('contactReasons.knowledgeSources', [...currentKnowledgeSources, newKnowledgeSource]);
    setShowAddKnowledgeSource(false);
  };

  const handleEditKnowledgeSource = (index: number, knowledgeSourceData: any) => {
    const currentKnowledgeSources = contactReasons?.knowledgeSources || [];
    const updatedKnowledgeSources = currentKnowledgeSources.map((item: any, idx: number) =>
      idx === index ? { ...knowledgeSourceData, id: item.id } : item,
    );
    setValue('contactReasons.knowledgeSources', updatedKnowledgeSources);
  };

  const handleRemoveKnowledgeSource = (index: number) => {
    const currentKnowledgeSources = contactReasons?.knowledgeSources || [];
    const updatedKnowledgeSources = currentKnowledgeSources.filter((_: any, idx: number) => idx !== index);
    setValue('contactReasons.knowledgeSources', updatedKnowledgeSources);
  };

  const getUseCases = () => {
    const currentUseCases = contactReasons?.useCases || [];
    return Array.isArray(currentUseCases) ? currentUseCases : [];
  };

  const getKnowledgeSources = () => {
    const currentKnowledgeSources = contactReasons?.knowledgeSources || [];
    return Array.isArray(currentKnowledgeSources) ? currentKnowledgeSources : [];
  };

  return (
    <Container>
      <ContentSection>
        {/* Use Cases Section */}
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Use Cases</SectionTitle>
          </SectionHeader>

          {getUseCases().map((useCase: any, index: number) => (
            <UseCaseItem
              key={useCase.id || index}
              useCase={useCase}
              index={index}
              onEdit={handleEditUseCase}
              onRemove={() => handleRemoveUseCase(index)}
            />
          ))}

          {showAddUseCase ? (
            <AddUseCase onCancel={() => setShowAddUseCase(false)} onSubmit={handleAddUseCase} />
          ) : (
            <Button type="button" style={{ flex: 1, borderStyle: 'dashed' }} onClick={() => setShowAddUseCase(true)}>
              Add Use Case
            </Button>
          )}
        </SectionContainer>

        {/* Knowledge Sources Section */}
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Knowledge Sources</SectionTitle>
          </SectionHeader>

          {getKnowledgeSources().map((knowledgeSource: any, index: number) => (
            <KnowledgeSourceItem
              key={knowledgeSource.id || index}
              knowledgeSource={knowledgeSource}
              index={index}
              onEdit={handleEditKnowledgeSource}
              onRemove={() => handleRemoveKnowledgeSource(index)}
            />
          ))}

          {showAddKnowledgeSource ? (
            <AddKnowledgeSource onCancel={() => setShowAddKnowledgeSource(false)} onSubmit={handleAddKnowledgeSource} />
          ) : (
            <Button
              type="button"
              style={{ flex: 1, borderStyle: 'dashed' }}
              onClick={() => setShowAddKnowledgeSource(true)}
            >
              Add Knowledge Source
            </Button>
          )}
        </SectionContainer>
      </ContentSection>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled(SM)`
  font-weight: ${(props) => props.theme.fontWeights.semibold};
  color: ${({ theme }) => theme.palette.grey[800]};
`;

export default ContactReasonsForm;
