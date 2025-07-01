import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { User, Phone } from 'lucide-react';
import { useTailorStore } from '../../../store/useTailorStore';
import { baseApi } from '../../../api/baseApi';
import { useShopStore } from '../../../store/useShopStore';
import MainLayout from '../../../components/MainLayout';
import ReusableCard from '../../../components/ui/ReusableCard';
import Loader from '../../../components/ui/Loader';

const TailorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { tailors, loading, error } = useTailorStore();
  const { shops, fetchShops } = useShopStore();
  const [tailorData, setTailorData] = useState<any>(null);
  const [shopName, setShopName] = useState('');
  const [tailorSerial, setTailorSerial] = useState('');
  const [shopSerial, setShopSerial] = useState('');

  useEffect(() => {
    let found = tailors.find(tailor => tailor.id === id);
    if (found) {
      setTailorData(found);
      if ((found as any).serialNumber) {
        setTailorSerial(`Tlr-${(found as any).serialNumber + 999}`);
      }
    } else if (id) {
      baseApi(`/tailors/${id}`, { method: 'GET' })
        .then((data) => {
          setTailorData(data);
          if (data.serialNumber) {
            setTailorSerial(`Tlr-${data.serialNumber + 999}`);
          }
        });
    }
  }, [id, tailors]);

  useEffect(() => {
    if (tailorData && tailorData.shopId) {
      baseApi(`/shops/${tailorData.shopId}`, { method: 'GET' })
        .then((data) => {
          setShopName(data.name);
          if (data.serialNumber) {
            setShopSerial(`Shp-${data.serialNumber + 999}`);
          }
        });
    }
  }, [tailorData]);

  if (loading) {
    return (
      <MainLayout>
        <Loader message="Loading tailor data..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={() => navigate(-1)} className="ml-4">Go Back</Button>
        </div>
      </MainLayout>
    );
  }

  if (!tailorData) {
    return (
      <MainLayout>
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
          <p>Tailor not found.</p>
          <Button onClick={() => navigate(-1)} className="ml-4">Go Back</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 p-6 overflow-y-auto">
        <Button onClick={() => navigate(-1)} className="mb-6">← Back</Button>
        {/* Tailor Profile Card (match CustomerProfile) */}
        <ReusableCard className="bg-[#55AC8A] text-white p-6 rounded-lg shadow-md mb-6 flex items-center w-full">
          <div className="w-24 h-24 rounded-full mr-6 flex items-center justify-center bg-white text-[#55AC8A]">
            <User size={48} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{tailorData.name}</h2>
            <div className="flex items-center mt-4 text-white">
              <Phone size={16} className="mr-2" />
              <span>{tailorData.mobileNumber || 'N/A'}</span>
            </div>
          </div>
        </ReusableCard>
        {/* Additional Tailor Details (match CustomerProfile) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReusableCard title="Contact Information">
            <p><strong>Mobile Number:</strong> {tailorData.mobileNumber}</p>
          </ReusableCard>
          <ReusableCard title="Other Details">
            <p><strong>Tailor:</strong> {tailorData.name} {tailorSerial && `(${tailorSerial})`}</p>
            <p><strong>Shop:</strong> {shopName} {shopSerial && `(${shopSerial})`}</p>
          </ReusableCard>
        </div>
      </div>
    </MainLayout>
  );
};

export default TailorProfile; 