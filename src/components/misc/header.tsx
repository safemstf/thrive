// src/components/Header.tsx
'use client';
import React from 'react';
import Image from 'next/image';
import logo from '../../../public/assets/logo2.png';
import { Taskbar } from './taskbar';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="header container">
      <div className="logo">
        <Image src={logo} alt="Learn Morra Logo" width={200} height={200} />
        <span>{title}</span>
      </div>
      {subtitle && <p className="subtitle">{subtitle}</p>}
      <Taskbar />
    </header>
  );
}