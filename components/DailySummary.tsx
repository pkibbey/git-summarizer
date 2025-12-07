"use client";

import React from 'react';

interface DailySummaryProps {
  title?: string;
  text: string;
  className?: string;
}

export function DailySummary({
  text,
  className = '',
}: DailySummaryProps) {
  return (
    <p className={`text-lg text-gray-600 dark:text-gray-400 max-w-3xl mb-12 pl-6 border-l-2 border-primary ${className}`}>
      {text}
    </p>
  );
}

export default DailySummary;
