// src/app/thrive/sat/styles.ts
import styled from 'styled-components';

export const PageWrapper = styled.div`
  background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
  min-height: 100vh;
  padding: 4rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 2rem;
    width: 100%;
    max-width: 1000px;
    margin-top: 4rem;
  }

  .card {
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .card__content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      background: #fff;
    }

    .text-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #102a43;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .text-body {
      font-size: 1rem;
      color: #627d98;
      text-align: center;
    }
  }

  .exercises {
    width: 100%;
    max-width: 600px;
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;

    h2 {
      font-size: 2rem;
      color: #102a43;
      margin-bottom: 1rem;
      text-align: center;
    }

    .leaderboard {
      margin-top: 2rem;
      h3 {
        font-size: 1.25rem;
        color: #102a43;
        margin-bottom: 0.5rem;
      }
      .scores {
        list-style: none;
        padding: 0;
        li {
          margin-bottom: 0.5rem;
          font-size: 1rem;
          color: #334e68;
        }
      }
    }
  }
`;