import { WebSocketDemo } from '@/components/WebSocketDemo';
import { ProductionStatus } from '@/components/ProductionStatus';

export default function WebSocketDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔄 WebSocket Real-time Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Test the live WebSocket connection deployed to AWS production. 
            This demonstrates real-time communication between frontend and backend.
          </p>
          <ProductionStatus />
        </div>
        
        <WebSocketDemo />
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Connected to <strong>AWS Stockholm Region (eu-north-1)</strong> • <strong>Phase 5: Real-time Features</strong>
          </p>
        </div>
      </div>
    </div>
  );
} 