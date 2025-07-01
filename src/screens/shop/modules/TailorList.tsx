import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTailorStore } from '../../../store/useTailorStore';
import { useShopStore } from '../../../store/useShopStore';
import MainLayout from '../../../components/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import ReusableTable from '../../../components/ui/ReusableTable';
import Loader from '../../../components/ui/Loader';
import useAuthStore from '../../../store/useAuthStore';

const TailorList: React.FC = () => {
  const navigate = useNavigate();
  const { tailors, loading, error, fetchAllTailors } = useTailorStore();
  const { shops, fetchShops } = useShopStore();
  const user = useAuthStore((state) => state.user);
  const filteredTailors = user?.role?.toLowerCase() === 'shop_owner'
    ? tailors.filter(t => t.shopId === user.shopId)
    : tailors;

  useEffect(() => {
    fetchAllTailors();
    fetchShops();
  }, [fetchAllTailors, fetchShops]);

  // Helper to get shop serial number by shopId
  const getShopSerial = (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    return shop ? `Shp-${(shop.serialNumber || 0) + 999}` : shopId;
  };

  if (user?.role?.toLowerCase() === 'shop_owner' && shops.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg font-bold mb-4">Please create your shop to access tailors.</p>
            <Button variant="mintGreen" onClick={() => navigate('/shop/new')}>Create Shop</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 p-6 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>All Tailors</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader message="Loading tailors..." />
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <ReusableTable
                columns={[
                  { header: 'Name', accessor: 'name', className: 'w-1/4' },
                  { header: 'Mobile Number', accessor: 'mobileNumber', className: 'w-1/4' },
                  { header: 'Tailor Id', accessor: 'serialNumber', className: 'w-1/4' },
                  { header: 'Shop Serial', accessor: 'shopId', className: 'w-1/4' },
                  { header: '', accessor: 'actions' },
                ]}
                data={filteredTailors}
                renderRow={(tailor) => (
                  <tr key={tailor.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle w-1/4 font-medium">{tailor.name}</td>
                    <td className="p-4 align-middle w-1/4">{tailor.mobileNumber}</td>
                    <td className="p-4 align-middle w-1/4">Tlr-{(tailor.serialNumber || 0) + 999}</td>
                    <td className="p-4 align-middle w-1/4">{getShopSerial(tailor.shopId)}</td>
                    <td className="p-4 align-middle text-right">
                      <Button size="sm" variant="mintGreen" onClick={() => navigate(`/tailor/profile/${tailor.id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                )}
                emptyMessage="No tailors found."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TailorList; 