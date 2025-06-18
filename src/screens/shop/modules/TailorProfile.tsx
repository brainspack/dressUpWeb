import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { User, Phone } from 'lucide-react';
import { useTailorStore, Tailor } from '../../../store/useTailorStore'; // Import Tailor interface

const TailorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { tailors, loading, error } = useTailorStore();
  const tailorData = tailors.find(tailor => tailor.id === id);

  useEffect(() => {
    // Assuming tailors data is pre-populated by ShopProfile.tsx or another mechanism.
    // If tailorData is not found, it means either: tailor doesn't exist, or it wasn't fetched yet.
    // For direct access, a backend endpoint to fetch a single tailor by ID would be more robust.
  }, [id, tailors]); // Depend on `tailors` array to re-evaluate `tailorData` if store updates

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-[#F2F7FE]">
        <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header title="Tailor Profile" onToggleSidebar={toggleSidebar} />
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <p>Loading tailor data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen bg-[#F2F7FE]">
        <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header title="Tailor Profile" onToggleSidebar={toggleSidebar} />
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <p className="text-red-500">Error: {error}</p>
            <Button onClick={() => navigate(-1)} className="ml-4">Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  if (!tailorData) {
    return (
      <div className="flex h-screen w-screen bg-[#F2F7FE]">
        <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header title="Tailor Profile" onToggleSidebar={toggleSidebar} />
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <p>Tailor not found.</p>
            <Button onClick={() => navigate(-1)} className="ml-4">Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#F2F7FE]">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={`${tailorData.name} Profile`} onToggleSidebar={toggleSidebar} />

        <div className="flex-1 p-6 overflow-y-auto">
          <Button onClick={() => navigate(-1)} className="mb-6">← Back</Button>

          {/* Tailor Profile Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-md mb-6 flex items-center w-full">
            <div className="w-24 h-24 rounded-full mr-6 flex items-center justify-center bg-white text-green-700">
              <User size={48} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{tailorData.name}</h2>
              <div className="flex items-center mt-4 text-green-200">
                <Phone size={16} className="mr-2" />
                <span>{tailorData.mobileNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Additional Tailor Details (Example - you can add more as needed) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Mobile Number:</strong> {tailorData.mobileNumber}</p>
              </CardContent>
            </Card>

            {/* You can add more cards here for other tailor-related information like assigned orders, etc. */}
            <Card>
              <CardHeader>
                <CardTitle>Other Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Tailor ID: {tailorData.id}</p>
                <p>Shop ID: {tailorData.shopId}</p>
                {/* Add other fields as needed */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TailorProfile; 