"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from '@/providers/authProvider';
import { ProtectedRoute } from '@/components/auth/protectedRoute';
import { Calendar, LayoutDashboard, BookOpenCheck, Image as GalleryIcon, Shield } from "lucide-react";

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
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  }

  h3 {
    color: #2c2c2c;
    margin-bottom: 1rem;
    font-family: "Work Sans", sans-serif;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    color: #666;
    line-height: 1.6;
    margin: 0.25rem 0;
  }

  a {
    color: #2c2c2c;
    text-decoration: underline;
  }
`;

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, gallery: 0, courses: 0 });

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/stats')
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => {
        setStats({
          projects: data.totalProjects || 0,
          gallery: data.totalGalleryItems || 0,
          courses: data.completedCourses || 0,
        });
      })
      .catch(console.error);
  }, [user]);

  const recentActivity = [
    { label: "Uploaded a new gallery item", date: "July 21" },
    { label: "Completed ‘Advanced Design’ course", date: "July 18" },
    { label: "Created project ‘UI Toolkit’", date: "July 14" },
  ];

  return (
    <ProtectedRoute>
      <PageWrapper>
        <Container>
          <Header>
            <Title>Welcome back, {user?.name}!</Title>
            <Subtitle>Here's a quick snapshot of your activity.</Subtitle>
          </Header>

          <Grid>
            <Card>
              <h3><LayoutDashboard size={20} /> Quick Stats</h3>
              <p><strong>{stats.projects}</strong> projects created</p>
              <p><strong>{stats.gallery}</strong> gallery items</p>
              <p><strong>{stats.courses}</strong> courses completed</p>
            </Card>

            <Card>
              <h3><Calendar size={20} /> Recent Activity</h3>
              {recentActivity.map((item, i) => (
                <p key={i}>{item.label} – <em>{item.date}</em></p>
              ))}
            </Card>

            <Card>
              <h3><BookOpenCheck size={20} /> Learning</h3>
              <p>You have <strong>{stats.courses}</strong> courses completed.</p>
              <p><a href="/courses">Continue Learning →</a></p>
            </Card>

            <Card>
              <h3><GalleryIcon size={20} /> Gallery</h3>
              <p>Manage your <strong>{stats.gallery}</strong> creative uploads.</p>
              <p><a href="/dashboard/gallery">View Gallery →</a></p>
            </Card>

            <Card>
              <h3><Shield size={20} /> Profile</h3>
              <p>Manage your account settings and preferences.</p>
              <p><a href="/dashboard/profile">Go to Profile →</a></p>
            </Card>

            {user?.role === 'admin' && (
              <Card>
                <h3><Shield size={20} /> Admin Panel</h3>
                <p><a href="/admin">Access admin tools →</a></p>
              </Card>
            )}
          </Grid>
        </Container>
      </PageWrapper>
    </ProtectedRoute>
  );
}
