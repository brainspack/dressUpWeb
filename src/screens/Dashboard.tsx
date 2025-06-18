import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore, { User } from '../store/useAuthStore'
import { Menu, Search, ShoppingBag, FileText, Bell, BarChart, Package as PackageIcon, DollarSign, LayoutGrid, Calendar, Users, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

// Import Shadcn UI components
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "../components/ui/card"

const Dashboard: React.FC = () => {
  const user: User = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div
      className="flex flex-1"
      style={{
        backgroundImage: `url('/assets/sidebar-bg.svg')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left',
        backgroundColor: '#F2F7FE',
      }}
    >
      {/* Main content flex-grow with own scroll */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="w-full  px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2200</div>
                  <p className="text-xs text-muted-foreground">+20% from last month</p>
                </CardContent>
                <CardFooter>
                  <Link to="#" className="text-sm text-purple-600 hover:underline">View All →</Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4400</div>
                  <p className="text-xs text-muted-foreground">+30% from last month</p>
                </CardContent>
                <CardFooter>
                  <Link to="#" className="text-sm text-purple-600 hover:underline">View All →</Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6600</div>
                  <p className="text-xs text-muted-foreground">+60% from last month</p>
                </CardContent>
                <CardFooter>
                  <Link to="#" className="text-sm text-purple-600 hover:underline">View All →</Link>
                </CardFooter>
              </Card>

              <Card className="bg-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2 text-purple-200">
                  <CardTitle className="text-sm font-medium">Payments</CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8800</div>
                  <p className="text-xs text-purple-200">+90% from last month</p>
                </CardContent>
                <CardFooter>
                  <Link to="#" className="text-sm text-purple-200 hover:underline">View All →</Link>
                </CardFooter>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">Sales Chart Placeholder</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3"><Star size={20} /></div>
                      <div>
                        <p className="font-semibold text-sm">Twitter Subscription</p>
                        <p className="text-xs text-gray-500">$159.69</p>
                      </div>
                    </div>
                    <span className="text-green-500 text-sm font-semibold">+</span>
                  </div>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3"><Star size={20} /></div>
                      <div>
                        <p className="font-semibold text-sm">Xbox Purchased</p>
                        <p className="text-xs text-gray-500">$36.38</p>
                      </div>
                    </div>
                    <span className="text-red-500 text-sm font-semibold">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3"><Star size={20} /></div>
                      <div>
                        <p className="font-semibold text-sm">Youtube Subscription</p>
                        <p className="text-xs text-gray-500">$23.85</p>
                      </div>
                    </div>
                    <span className="text-green-500 text-sm font-semibold">+</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-500 text-white flex flex-col items-center justify-end" style={{ height: '300px' }}>
              <CardHeader className="self-start">
                <CardTitle className="text-white">Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full max-w-xs flex flex-col items-center">
                  <div className="w-1/2 h-6 bg-red-500 mb-1"></div>
                  <div className="w-2/3 h-6 bg-pink-500 mb-1"></div>
                  <div className="w-full h-6 bg-yellow-500 mb-1"></div>
                  <div className="w-2/3 h-6 bg-green-500 mb-1"></div>
                  <div className="w-1/2 h-6 bg-teal-500 mb-1"></div>
                  <div className="w-1/3 h-6 bg-cyan-500 mb-1"></div>
                  <div className="w-full h-6 bg-blue-400 mb-1"></div>
                  <div className="w-2/3 h-6 bg-indigo-500 mb-1"></div>
                  <div className="w-1/2 h-6 bg-purple-500"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
