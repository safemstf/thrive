'use client';
import React from "react";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
`;

/** Formerly the matrix rain canvas — replaced with a no-op to keep imports intact. */
export const MatrixRain: React.FC<{
  fontSize?: number;
  layers?: number;
  style?: React.CSSProperties;
}> = () => <GlobalStyle />;
