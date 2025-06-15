// app/dashboard/page.tsx
"use client";

import styled from "styled-components";
import { useAuth } from '@/providers/authProvider';
import { ProtectedRoute } from '@/components/auth/protectedRoute';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f8f8;
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  font-family: "Work Sans", sans-serif;
  letter-spacing: 1px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  
  h3 {
    color: #2c2c2c;
    margin-bottom: 1rem;
    font-family: "Work Sans", sans-serif;
  }
  
  p {
    color: #666;
    line-height: 1.6;
  }
`;

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <PageWrapper>
        <Container>
          <Header>
            <Title>Welcome back, {user?.name}!</Title>
            <Subtitle>Here's what's happening in your account.</Subtitle>
          </Header>
          
          <Grid>
            <Card>
              <h3>Quick Stats</h3>
              <p>Your account overview and recent activity will appear here.</p>
            </Card>
            
            <Card>
              <h3>Recent Activity</h3>
              <p>Track your latest interactions and progress.</p>
            </Card>
            
            <Card>
              <h3>Settings</h3>
              <p>Manage your account preferences and profile information.</p>
            </Card>
            
            {user?.role === 'admin' && (
              <Card>
                <h3>Admin Panel</h3>
                <p>
                  <a href="/admin" style={{ color: '#2c2c2c', textDecoration: 'underline' }}>
                    Access administrative features
                  </a>
                </p>
              </Card>
            )}
          </Grid>
        </Container>
      </PageWrapper>
    </ProtectedRoute>
  );
}