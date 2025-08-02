// src/styles/styled.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: Record<string, string>;
      accent: {
        blue: string;
        lightBlue: string;
        muted: string;
      };
      background: {
        primary: string;
        secondary: string;
        tertiary: string;
      };
      text: {
        primary: string;
        secondary: string;
        muted: string;
        light: string;
      };
      border: {
        light: string;
        medium: string;
        dark: string;
      };
    };
    typography: {
      fonts: {
        display: string;
        body: string;
        accent: string;
      };
      sizes: Record<string, string>;
      weights: {
        light: number;
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
      };
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      glass: string;
    };
    transitions: {
      fast: string;
      normal: string;
      slow: string;
    };
    glass: {
      background: string;
      border: string;
      blur: string;
    };
  }
}
