import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DemoCopilot = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://z3n-desk-qa.zendesk.com/wfm/l5/api/dashboards', {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Demo Copilot</Title>

      <Content>
        <ButtonContainer>
          <FetchButton onClick={fetchDashboardMetrics} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Dashboard Metrics'}
          </FetchButton>
        </ButtonContainer>

        {loading && <LoadingText>Loading dashboard metrics...</LoadingText>}

        {error && (
          <ErrorContainer>
            <ErrorText>Error: {error}</ErrorText>
            <RetryButton onClick={fetchDashboardMetrics}>Retry</RetryButton>
          </ErrorContainer>
        )}

        {data && (
          <DataContainer>
            <DataTitle>Dashboard Metrics:</DataTitle>
            <DataContent>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </DataContent>
          </DataContainer>
        )}
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 80vh;
  background-color: white;
  position: fixed;
  right: 80px;
  bottom: 0px;
  border-radius: 15px 15px 0 0;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10000;
  overflow: hidden;
`;

const Title = styled.h2`
  margin: 0;
  padding: 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const Content = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
`;

const ButtonContainer = styled.div`
  margin-bottom: 16px;
  text-align: center;
`;

const FetchButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #218838;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #6c757d;
  font-style: italic;
`;

const ErrorContainer = styled.div`
  text-align: center;
`;

const ErrorText = styled.div`
  color: #dc3545;
  margin-bottom: 12px;
  font-size: 14px;
`;

const RetryButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #0056b3;
  }
`;

const DataContainer = styled.div`
  margin-top: 16px;
`;

const DataTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
`;

const DataContent = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
`;

export default DemoCopilot;
