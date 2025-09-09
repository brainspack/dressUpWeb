import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import ReusableCard from '../../../components/ui/CustomCard';
import { Button } from '../../../components/ui/button';
import { baseApi } from '../../../api/baseApi';
import { Order } from '../../../store/useOrderStore';
import { ArrowLeft, ShoppingBag, User, Scissors, Calendar, CheckCircle2 } from 'lucide-react';

const SectionRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b last:border-b-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value || 'N/A'}</span>
  </div>
);

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await baseApi(`/orders/${id}`, { method: 'GET' });
        setOrder(data as Order);
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : 'N/A');

  return (
    <div className="flex bg-[#F2F7FE]">
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-hidden">
          <div className="mb-4">
            <Button variant="mintGreen" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>

          {loading && (
            <Card className="p-6"><CardContent>Loading order...</CardContent></Card>
          )}
          {error && (
            <Card className="p-6"><CardContent className="text-red-500">{error}</CardContent></Card>
          )}

          {order && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <ReusableCard className="lg:col-span-2 bg-white max-h-[calc(100vh-180px)] overflow-y-auto">
                <CardHeader className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#55AC8A]/10 text-[#55AC8A] flex items-center justify-center">
                    <ShoppingBag />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Order Details</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReusableCard title={
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4"/> Customer
                      </div>
                    }>
                      <SectionRow label="Name" value={order.customer?.name} />
                      <SectionRow label="Status" value={order.status} />
                      <SectionRow label="Order Type" value={order.orderType || 'STITCHING'} />
                      {order.orderType === 'ALTERATION' && order.alterationPrice && (
                        <SectionRow label="Alteration Price" value={`₹${order.alterationPrice}`} />
                      )}
                      <SectionRow label="Order Date" value={formatDate(order.orderDate || order.createdAt)} />
                      <SectionRow label="Delivery Date" value={formatDate(order.deliveryDate)} />
                    </ReusableCard>

                    <ReusableCard title={
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4"/> Tailor
                      </div>
                    }>
                      <SectionRow label="Name" value={order.tailorName} />
                      <SectionRow label="Mobile" value={order.tailorNumber} />
                    </ReusableCard>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-6">
                    <ReusableCard title={order.orderType === 'ALTERATION' ? 'Alteration Items' : 'Clothes'}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(order.clothes || []).map((c, idx) => (
                          <div key={idx} className="rounded-lg border p-4">
                            <div className="font-semibold mb-2">{c.type || 'Item'} {idx + 1}</div>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              {order.orderType === 'ALTERATION' ? (
                                <div><span className="text-gray-500">Alteration Notes:</span> {c.designNotes || 'For alteration'}</div>
                              ) : (
                                <div><span className="text-gray-500">Notes:</span> {c.designNotes || '—'}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ReusableCard>

                    <ReusableCard title="Measurements">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th className="py-2 pr-4">Field</th>
                              <th className="py-2">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.measurements || []).map((m: any, i: number) => (
                              Object.entries(m)
                                .filter(([key]) => {
                                  const k = String(key).toLowerCase();
                                  return ![
                                    'id','_id','orderid','order_id','clothid','clothesid','clothingitemid','clothing_item_id',
                                    'customerid','shopid','tailorid','userid',
                                    'createdat','created_at','deletedat','deleted_at','updatedat','updated_at'
                                  ].includes(k);
                                })
                                .map(([key, val]: any, j: number) => (
                                  <tr key={`${i}-${j}`} className="border-t">
                                    <td className="py-2 pr-4 capitalize">{key}</td>
                                    <td className="py-2">{val ?? '—'}</td>
                                  </tr>
                                ))
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ReusableCard>

                  </div>
                </CardContent>
              </ReusableCard>

              <ReusableCard className="bg-white h-[50vh] sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4"/> Order: {formatDate(order.orderDate || order.createdAt)}</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4"/> Status: {order.status}</div>
                  </div>
                </CardContent>
              </ReusableCard>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;


