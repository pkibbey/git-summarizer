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
    <p className={`font-script text-gray-700 text-2xl dark:text-gray-300 mb-12 leading-snug ${className}`}>
      {text}
    </p>
  );
}

export default DailySummary;
