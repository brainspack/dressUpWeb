import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { baseApi } from '../../api/baseApi';
import useAuthStore, { User as AuthUser } from '../../store/useAuthStore';
import { useUserStore } from '../../store/useUserStore'; // Import the new user store

interface UserData {
  id: string;
  name?: string;
  mobileNumber: string;
  role: string;
  language: string;
  createdAt: string;
}

const UserProfile: React.FC = () => {
  const currentUser: AuthUser = useAuthStore((state) => state.user);
  const { users, loading, error, fetchUsers } = useUserStore(); // Use the user store
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    user.mobileNumber.includes(searchQuery) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="flex"
      style={{
        backgroundImage: `url('/assets/sidebar-bg.svg')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left',
        backgroundColor: '#F2F7FE',
      }}
    >
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: 'white' }}>
          <div
            className="relative mb-6 p-6 rounded-lg flex items-center gap-2"
            style={{ backgroundColor: '#E0F2FE', overflow: 'hidden' }}
          >
            <Input
              type="text"
              placeholder="Search Users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow max-w-xs px-3 py-2 rounded-l-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white"
            />
          </div>

          {loading && (
            <div className="text-center py-4">
              <p>Loading user profiles...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <p className="text-red-500">Error: {error}</p>
              <Button
                variant="outline"
                onClick={fetchUsers} // Use fetchUsers from store
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!loading && !error && filteredUsers.length > 0 && (
              filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gray-300 mr-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                      <CardTitle className="text-base font-semibold mb-1 truncate">
                        {user.name || 'N/A'}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-1">{user.mobileNumber}</p>
                      <p className="text-gray-500 text-xs truncate">
                        Role: {user.role}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}

            {!loading && !error && filteredUsers.length === 0 && (
              <div className="col-span-full text-center py-4">
                {searchQuery ? (
                  <p>No users found matching your search.</p>
                ) : (
                  <p>No users found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile; 