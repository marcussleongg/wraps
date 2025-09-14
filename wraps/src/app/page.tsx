export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Spending API Backend
        </h1>
        <p className="text-gray-600 mb-8">
          Backend APIs ready for frontend integration
        </p>
        <div className="bg-gray-100 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-4">Available Endpoints:</h2>
          <ul className="text-left space-y-2 text-sm">
            <li><code className="bg-gray-200 px-2 py-1 rounded">GET /api/spending</code></li>
            <li><code className="bg-gray-200 px-2 py-1 rounded">GET /api/merchants</code></li>
            <li><code className="bg-gray-200 px-2 py-1 rounded">GET /api/categorize</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
