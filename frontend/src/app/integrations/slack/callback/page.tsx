'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function SlackCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing Slack authorization...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authorization failed: ${error}`);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authorization parameters. Please try connecting again.');
          return;
        }

        // Call the callback endpoint
        const response = await fetch(`/api/integrations/slack/callback?code=${code}&state=${state}`);
        
        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage(`Successfully connected to ${data.integration?.teamName || 'Slack workspace'}!`);
          
          // Redirect back to integrations page after 2 seconds
          setTimeout(() => {
            router.push('/integrations');
          }, 2000);
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(errorData.error || 'Failed to complete Slack authorization');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Slack Integration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Setting up your Slack workspace connection
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center space-y-4">
            {status === 'processing' && (
              <>
                <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
                <h3 className="text-lg font-medium text-gray-900">Processing...</h3>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckIcon className="h-12 w-12 text-green-500" />
                <h3 className="text-lg font-medium text-green-800">Success!</h3>
              </>
            )}

            {status === 'error' && (
              <>
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
                <h3 className="text-lg font-medium text-red-800">Error</h3>
              </>
            )}

            <p className="text-sm text-gray-600 text-center">
              {message}
            </p>

            {status === 'success' && (
              <p className="text-xs text-gray-500 text-center">
                Redirecting you back to integrations...
              </p>
            )}

            {status === 'error' && (
              <button
                onClick={() => router.push('/integrations')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Integrations
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Slack Integration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Loading...
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center space-y-4">
            <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SlackCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SlackCallbackContent />
    </Suspense>
  );
} 