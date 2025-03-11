export default function Home() {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dashboard</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h2 className="text-lg font-medium text-gray-900">Teams</h2>
              <p className="mt-1 text-sm text-gray-500">Manage teams and their permissions</p>
              <div className="mt-4">
                <a 
                  href="/teams" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Teams
                </a>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h2 className="text-lg font-medium text-gray-900">Users</h2>
              <p className="mt-1 text-sm text-gray-500">Manage user accounts and roles</p>
              <div className="mt-4">
                <a 
                  href="/users" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Users
                </a>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
              <p className="mt-1 text-sm text-gray-500">Manage API keys and access control</p>
              <div className="mt-4">
                <a 
                  href="/keys" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View API Keys
                </a>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <h2 className="text-lg font-medium text-gray-900">Models</h2>
              <p className="mt-1 text-sm text-gray-500">Manage LLM models and providers</p>
              <div className="mt-4">
                <a 
                  href="/models" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Models
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
