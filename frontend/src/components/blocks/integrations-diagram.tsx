import React from 'react';
import Image from 'next/image';

const IntegrationsNode = ({ logoSrc, name, className = "" }: { logoSrc: string, name: string, className?: string }) => (
  <div className={`group relative flex flex-col items-center space-y-2 ${className}`}>
    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-xl p-2">
      <img 
        src={logoSrc} 
        alt={`${name} logo`}
        className="w-full h-full object-contain"
      />
    </div>
    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
      {name}
    </span>
  </div>
);

const ConnectionLine = ({ className = "" }: { className?: string }) => (
  <div className={`absolute bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 ${className}`} 
       style={{ height: '2px' }} />
);

export function IntegrationsNetwork() {
  return (
    <div className="mt-32 mx-10 relative">
      <div className="text-center mb-12">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Real Integrations
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Connect with the tools you already use
        </p>
      </div>
      
      <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>

        {/* Central Junokit Hub */}
        <div className="flex flex-col items-center relative z-10">
          <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex items-center justify-center mb-6 p-2 border-2 border-purple-200 dark:border-purple-700 relative z-20">
            <Image
              src="/JunoKitColorNoBGNoTEXT.png"
              alt="Junokit AI"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
            {/* Connection pulses behind THIS logo */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Larger animated connection pulses behind the Junokit logo */}
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/20 rounded-full animate-ping transform -translate-x-1/2 -translate-y-1/2 -z-10" 
                   style={{ animationDelay: '0s', animationDuration: '3s' }} />
              <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-blue-500/20 rounded-full animate-ping transform -translate-x-1/2 -translate-y-1/2 -z-10" 
                   style={{ animationDelay: '1s', animationDuration: '3s' }} />
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-green-500/20 rounded-full animate-ping transform -translate-x-1/2 -translate-y-1/2 -z-10" 
                   style={{ animationDelay: '2s', animationDuration: '3s' }} />
            </div>
          </div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Junokit AI</h4>
          
          {/* Integration Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl">
            
            {/* AI & Backend */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-purple-600 dark:text-purple-400 text-center mb-4">AI & Infrastructure</h5>
              <div className="space-y-4">
                <IntegrationsNode 
                  logoSrc="/aws-logo.png" 
                  name="AWS"
                />
                <IntegrationsNode 
                  logoSrc="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openai.svg" 
                  name="OpenRouter"
                />
                <IntegrationsNode 
                  logoSrc="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/GitHub_Invertocat_Logo.svg/2048px-GitHub_Invertocat_Logo.svg.png" 
                  name="GitHub"
                />
              </div>
            </div>

            {/* Communication & Productivity */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-blue-600 dark:text-blue-400 text-center mb-4">Communication</h5>
              <div className="space-y-4">
                <IntegrationsNode 
                  logoSrc="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png" 
                  name="Slack"
                />
                <IntegrationsNode 
                  logoSrc="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
                  name="Email (SES)"
                />
                <IntegrationsNode 
                  logoSrc="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" 
                  name="Google Calendar"
                />
              </div>
            </div>

            {/* Project Management */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-green-600 dark:text-green-400 text-center mb-4">Project Management</h5>
              <div className="space-y-4">
                <IntegrationsNode 
                  logoSrc="https://cdn.worldvectorlogo.com/logos/jira-1.svg" 
                  name="Jira"
                />
                <IntegrationsNode 
                  logoSrc="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" 
                  name="Outlook"
                />
                <IntegrationsNode 
                  logoSrc="https://cdn.worldvectorlogo.com/logos/confluence-1.svg" 
                  name="Confluence"
                />
              </div>
            </div>
          </div>


        </div>

        {/* Actual Project Stats */}
        <div className="mt-12 grid grid-cols-3 gap-8 text-center relative z-10">
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">9+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Integrations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Stockholm</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">EU Region</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">GDPR</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Compliant</div>
          </div>
        </div>

        {/* Deployment Status */}
        <div className="mt-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Infrastructure Deployed & Live</span>
          </div>
        </div>
      </div>
    </div>
  );
} 