import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { baseApi } from '../api/baseApi';

// Map route segments to display names
const routeNameMap: Record<string, string> = {
  orders: 'Orders',
  create: 'Create',
  'new-order': 'New Order',
  profile: 'Profile',
  shop: 'Shop',
  shopprofile: 'Shopprofile',
  customer: 'Customer',
  dashboard: 'Dashboard',
  edit: 'Edit',
  // Add more as needed
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Helper function to generate unique shop ID from UUID
const generateShopId = (shopUuid: string): string => {
  let hash = 0;
  for (let i = 0; i < shopUuid.length; i++) {
    const char = shopUuid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const uniqueId = Math.abs(hash) % 1000;
  return `Shp-${String(uniqueId).padStart(3, '0')}`;
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [serial, setSerial] = useState<string | null>(null);
  const [loadingSerial, setLoadingSerial] = useState(false);

  // Split the path and filter out empty segments
  const segments = location.pathname.split('/').filter(Boolean);

  // Effect: fetch serial number if on a detail page
  useEffect(() => {
    setSerial(null);
    setLoadingSerial(false);
    // Shop profile: /shop/shopprofile/:id
    if (segments[0] === 'shop' && segments[1] === 'shopprofile' && segments[2]) {
      setLoadingSerial(true);
      baseApi(`/shops/${segments[2]}`, { method: 'GET' })
        .then((data) => {
          // Use serialNumber if available, otherwise generate unique ID from UUID
          if (data.serialNumber) {
            setSerial(`Shp-${String(data.serialNumber).padStart(3, '0')}`);
          } else {
            setSerial(generateShopId(segments[2]));
          }
        })
        .catch(() => {
          // Fallback: generate unique ID from shop UUID if API fails
          setSerial(generateShopId(segments[2]));
        })
        .finally(() => setLoadingSerial(false));
    }
    // Customer profile: /customer/profile/:id
    else if (segments[0] === 'customer' && segments[1] === 'profile' && segments[2]) {
      setLoadingSerial(true);
      baseApi(`/customers/${segments[2]}`, { method: 'GET' })
        .then((data) => setSerial(data.serialNumber ? `Cus-${data.serialNumber + 999}` : null))
        .finally(() => setLoadingSerial(false));
    }
    // Tailor profile: /tailor/profile/:id
    else if (segments[0] === 'tailor' && segments[1] === 'profile' && segments[2]) {
      setLoadingSerial(true);
      baseApi(`/tailors/${segments[2]}`, { method: 'GET' })
        .then((data) => setSerial(data.serialNumber ? `Tlr-${data.serialNumber + 999}` : null))
        .finally(() => setLoadingSerial(false));
    }
    // Order detail: /orders/:id
    else if (segments[0] === 'orders' && segments[1] && segments.length === 2) {
      setLoadingSerial(true);
      baseApi(`/orders/${segments[1]}`, { method: 'GET' })
        .then((data) => setSerial(data.serialNumber ? `Ord-${data.serialNumber + 999}` : null))
        .finally(() => setLoadingSerial(false));
    }
    // Order edit: /orders/edit/:id
    else if (segments[0] === 'orders' && segments[1] === 'edit' && segments[2]) {
      setLoadingSerial(true);
      baseApi(`/orders/${segments[2]}`, { method: 'GET' })
        .then((data) => setSerial(data.serialNumber ? `Ord-${data.serialNumber + 999}` : null))
        .finally(() => setLoadingSerial(false));
    }
    // Order view: /orders/view/:id
    else if (segments[0] === 'orders' && segments[1] === 'view' && segments[2]) {
      setLoadingSerial(true);
      baseApi(`/orders/${segments[2]}`, { method: 'GET' })
        .then((data) => setSerial(data.serialNumber ? `Ord-${data.serialNumber + 999}` : null))
        .finally(() => setLoadingSerial(false));
    }
  }, [location.pathname, segments]);

  // Build the breadcrumb display
  const breadcrumb = segments.map((seg, idx) => {
    // If this is the last segment and we have a serial, show it instead of the UUID
    if (
      idx === segments.length - 1 &&
      serial &&
      /^[0-9a-fA-F-]{36}$/.test(seg)
    ) {
      return (
        <span key={idx} className="text-gray-700 font-semibold">
          {loadingSerial ? '...' : serial}
        </span>
      );
    }
    const name = routeNameMap[seg.toLowerCase()] || capitalize(seg);
    return (
      <span key={idx} className="text-gray-700 font-semibold">
        {name}
        {idx < segments.length - 1 && <span className="mx-1 text-gray-400">/</span>}
      </span>
    );
  });

  return (
    <div className="flex items-center mb-4">    
        <ChevronLeft size={24} />
      <div className="text-xl font-bold flex items-center">{breadcrumb}</div>
    </div>
  );
};

export default Breadcrumb; 