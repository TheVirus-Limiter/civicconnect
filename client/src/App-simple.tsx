import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import SimpleOffline from "@/components/simple-offline";

// Simple test component first
function TestHome() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Connected Civics</h1>
      <p className="text-xl text-gray-700 mb-8">
        Civic engagement platform for TX-23 San Antonio - Testing offline functionality
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">📜 Bills</h2>
          <p>Track federal and state legislation</p>
          <div className="mt-2 text-sm text-blue-600">✓ Cached for offline access</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">👥 Representatives</h2>
          <p>Connect with your elected officials</p>
          <div className="mt-2 text-sm text-green-600">✓ Cached for offline access</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">📰 News</h2>
          <p>Stay informed with civic updates</p>
          <div className="mt-2 text-sm text-purple-600">✓ Cached for offline access</div>
        </div>
      </div>
      
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">🔄 Offline Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Service Worker</h3>
            <p className="text-gray-600">Intelligent caching for bills, representatives, and news data</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">PWA Ready</h3>
            <p className="text-gray-600">Install as an app with offline capabilities</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Background Sync</h3>
            <p className="text-gray-600">Automatic data updates when connection returns</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Smart Indicators</h3>
            <p className="text-gray-600">Real-time connection status with visual feedback</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={TestHome} />
      <Route component={() => <div>Page not found</div>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <SimpleOffline />
    </QueryClientProvider>
  );
}

export default App;