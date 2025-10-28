import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Field, Input } from '@zendeskgarden/react-forms';
import { MD, SM } from '@zendeskgarden/react-typography';
import { Button } from '@zendeskgarden/react-buttons';
import styled from 'styled-components';
import PlusIcon from '@zendeskgarden/svg-icons/src/16/plus-stroke.svg?react';
import Collapsable from '@/components/ui/Collapsable';
import FeedbackRatingItem from './FeedbackRating/FeedbackRatingItem';
import AddFeedbackRating from './FeedbackRating/AddFeedbackRating';

const KPIsForm = () => {
  const { register, watch, setValue, getValues } = useFormContext();
  const watchedValues = watch();

  const [feedbackRatingsCount, setFeedbackRatingsCount] = useState(0);
  const [showAddFeedback, setShowAddFeedback] = useState(false);

  // Initialize feedbackRatingsCount based on actual data
  useEffect(() => {
    const feedbackRatings = getValues('kpis.feedback_rating_breakdown') || [];
    setFeedbackRatingsCount(Math.max(feedbackRatings.length, 1)); // At least 1 to show something
  }, [getValues]);

  const addFeedbackRating = () => {
    setFeedbackRatingsCount((prev) => prev + 1);
    setShowAddFeedback(false);
  };

  const removeFeedbackRating = (index: number) => {
    if (feedbackRatingsCount > 1) {
      const currentRatings = getValues('kpis.feedback_rating_breakdown') || [];
      const newRatings = currentRatings.filter((_: any, i: number) => i !== index);
      setValue('kpis.feedback_rating_breakdown', newRatings);
      setFeedbackRatingsCount((prev) => prev - 1);
    }
  };

  const editFeedbackRating = (index: number, values: any) => {
    const currentRatings = getValues('kpis.feedback_rating_breakdown') || [];
    const newRatings = [...currentRatings];
    newRatings[index] = values;
    setValue('kpis.feedback_rating_breakdown', newRatings);
  };

  const getFeedbackRatings = () => {
    const feedbackRatings = watch('kpis.feedback_rating_breakdown') || [];
    return Array.isArray(feedbackRatings) ? feedbackRatings : [];
  };
  return (
    <div>
      <CollapsableContainer>
        {/* BSAT Metrics Section */}
        <Collapsable
          headerContent={
            <div>
              <GroupTitle>BSAT Metrics</GroupTitle>
              <GroupDescription>Basic Satisfaction metrics and response tracking</GroupDescription>
            </div>
          }
        >
          <MetricContent>
            {/* bsat_response_count + bsat_response_rate */}
            <MetricPair>
              <Field>
                <Field.Label>BSAT Response - Count</Field.Label>
                <Input type="number" min="0" placeholder="150" {...register('kpis.bsat_response_count')} />
              </Field>
              <Field>
                <Field.Label>BSAT Response - Rate</Field.Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="1"
                  placeholder="0.85"
                  {...register('kpis.bsat_response_rate')}
                />
              </Field>
            </MetricPair>

            {/* bsat_conversations_count + bsat_percentage */}
            <MetricPair>
              <Field>
                <Field.Label>BSAT Conversations - Count</Field.Label>
                <Input type="number" min="0" placeholder="200" {...register('kpis.bsat_conversations_count')} />
              </Field>
              <Field>
                <Field.Label>BSAT Conversations - Percentage</Field.Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="1"
                  placeholder="0.78"
                  {...register('kpis.bsat_percentage')}
                />
              </Field>
            </MetricPair>
          </MetricContent>
        </Collapsable>

        {/* Performance Metrics Section */}
        <Collapsable
          headerContent={
            <div>
              <GroupTitle>Performance Metrics</GroupTitle>
              <GroupDescription>Conversation handling and processing statistics</GroupDescription>
            </div>
          }
        >
          <MetricContent>
            {/* Total Volume - Single field (special case) */}
            <Field>
              <Field.Label>Total Volume</Field.Label>
              <Input type="number" min="0" placeholder="1500" {...register('kpis.total_volume')} />
              <Field.Hint>Total number of conversations</Field.Hint>
            </Field>

            {/* understood_conversations + understood_conversations_rate */}
            <MetricPair>
              <Field>
                <Field.Label>Understood Conversations - Count</Field.Label>
                <Input type="number" min="0" placeholder="1380" {...register('kpis.understood_conversations')} />
              </Field>
              <Field>
                <Field.Label>Understood Conversations - Rate</Field.Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="1"
                  placeholder="0.92"
                  {...register('kpis.understood_conversations_rate')}
                />
              </Field>
            </MetricPair>

            {/* processed_conversations + processed_conversations_rate */}
            <MetricPair>
              <Field>
                <Field.Label>Processed Conversations - Count</Field.Label>
                <Input type="number" min="0" placeholder="1200" {...register('kpis.processed_conversations')} />
              </Field>
              <Field>
                <Field.Label>Processed Conversations - Rate</Field.Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="1"
                  placeholder="0.80"
                  {...register('kpis.processed_conversations_rate')}
                />
              </Field>
            </MetricPair>

            {/* ai_agent_handled_conversations + ai_agent_handled_conversations_rate */}
            <MetricPair>
              <Field>
                <Field.Label>AI Agent Handled Conversations - Count</Field.Label>
                <Input type="number" min="0" placeholder="900" {...register('kpis.ai_agent_handled_conversations')} />
              </Field>
              <Field>
                <Field.Label>AI Agent Handled Conversations - Rate</Field.Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="1"
                  placeholder="0.60"
                  {...register('kpis.ai_agent_handled_conversations_rate')}
                />
              </Field>
            </MetricPair>

            {/* escalated_conversations + escalated_conversations_rate */}
            <MetricPair>
              <Field>
                <Field.Label>Escalated Conversations - Count</Field.Label>
                <Input type="number" min="0" placeholder="225" {...register('kpis.escalated_conversations')} />
              </Field>
              <Field>
                <Field.Label>Escalated Conversations - Rate</Field.Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="1"
                  placeholder="0.15"
                  {...register('kpis.escalated_conversations_rate')}
                />
              </Field>
            </MetricPair>

            {/* assisted_conversations + assisted_conversations_rate */}
            <MetricPair>
              <Field>
                <Field.Label>Assisted Conversations - Count</Field.Label>
                <Input type="number" min="0" placeholder="40" {...register('kpis.assisted_conversations')} />
              </Field>
              <Field>
                <Field.Label>Assisted Conversations - Rate</Field.Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max="1"
                  placeholder="0.30"
                  {...register('kpis.assisted_conversations_rate')}
                />
              </Field>
            </MetricPair>
          </MetricContent>
        </Collapsable>

        {/* Feedback Rating Breakdown Section */}
        <Collapsable
          headerContent={
            <div>
              <GroupTitle>Feedback Rating Breakdown</GroupTitle>
              <GroupDescription>Configure feedback ratings breakdown (1-5 stars)</GroupDescription>
            </div>
          }
        >
          <MetricContent>
            <FeedbackHeaderActions>{/* Remove add button from header */}</FeedbackHeaderActions>

            <FeedbackList>
              {Array.from({ length: feedbackRatingsCount }, (_, index) => {
                const feedbackRating = getFeedbackRatings()[index] || {};
                return (
                  <FeedbackRatingItem
                    key={index}
                    feedbackRating={feedbackRating}
                    index={index}
                    onEdit={editFeedbackRating}
                    onRemove={removeFeedbackRating}
                    showDelete={feedbackRatingsCount > 1}
                  />
                );
              })}

              {showAddFeedback ? (
                <AddFeedbackRating
                  onSubmit={(values) => {
                    const currentRatings = getValues('kpis.feedback_rating_breakdown') || [];
                    setValue('kpis.feedback_rating_breakdown', [...currentRatings, values]);
                    addFeedbackRating();
                  }}
                  onCancel={() => setShowAddFeedback(false)}
                />
              ) : (
                <Button
                  type="button"
                  style={{ flex: 1, borderStyle: 'dashed' }}
                  onClick={() => setShowAddFeedback(true)}
                >
                  Add Feedback Rating
                </Button>
              )}
            </FeedbackList>
          </MetricContent>
        </Collapsable>
      </CollapsableContainer>
    </div>
  );
};

const CollapsableContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GroupTitle = styled(MD)`
  font-weight: ${(props) => props.theme.fontWeights.semibold};
  color: ${({ theme }) => theme.palette.grey[800]};
  margin: 0;
`;

const GroupDescription = styled(SM)`
  color: ${({ theme }) => theme.palette.grey[600]};
  margin: 0;
`;

const MetricContent = styled.div`
  padding: 16px;
`;

const MetricPair = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const FeedbackHeaderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export default KPIsForm;
