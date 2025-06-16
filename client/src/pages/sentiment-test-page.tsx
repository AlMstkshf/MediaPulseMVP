import React from 'react';
import { Link } from "wouter";
import TestSentiment from '@/components/test-sentiment';

export default function SentimentTestPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link href="/">
          <a className="text-blue-500 hover:underline">&larr; Back to Dashboard</a>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold">OpenAI Sentiment Analysis Test</h1>
          <p className="text-gray-600">
            Test the connection to OpenAI API and analyze sentiment for social media content
          </p>
        </div>
        <TestSentiment />
      </div>
    </div>
  );
}