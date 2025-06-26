import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTailorStore } from '../../../store/useTailorStore';
import { useShopStore } from '../../../store/useShopStore';
import MainLayout from '../../../components/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

const TailorList: React.FC = () => {
  const navigate = useNavigate();
  const { tailors, loading, error, fetchAllTailors } = useTailorStore();
  const { shops, fetchShops } = useShopStore();

  useEffect(() => {
    fetchAllTailors();
    fetchShops();
  }, [fetchAllTailors, fetchShops]);

  // Helper to get shop serial number by shopId
  const getShopSerial = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    return shop ? `Shp-${(shop.serialNumber || 0) + 999}` : shopId;
  };

  return (
    <MainLayout>
      <div className="flex-1 p-6 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>All Tailors</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading tailors...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
                      <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tailor Id</th>
                      <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Serial</th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th> */}
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tailors.map((tailor) => (
                      <tr key={tailor.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{tailor.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{tailor.mobileNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">Tlr-{(tailor.serialNumber || 0) + 999}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getShopSerial(tailor.shopId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button size="sm" variant="mintGreen" onClick={() => navigate(`/tailor/profile/${tailor.id}`)}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tailors.length === 0 && <div className="text-center py-8 text-gray-500">No tailors found.</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TailorList; 