import useAuthStore, { User } from '../store/useAuthStore'
import React from 'react'

const Dashboard: React.FC = () => {
  const user: User = useAuthStore((state) => state.user)
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 hidden md:block">
        <nav>
          <ul>
            <li className="mb-2"><a href="/dashboard">Dashboard</a></li>
            {/* Add more private routes here */}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p>Welcome, {user?.phone}!</p>
      </main>
    </div>
  )
}

export default Dashboard
