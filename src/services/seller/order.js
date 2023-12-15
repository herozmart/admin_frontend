import request from '../request';

const orderService = {
  getAll: (params) =>
    request.get('dashboard/seller/orders/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/orders/${id}`, { params }),
  create: (data) => request.post('dashboard/seller/orders', data),
  update: (id, data) => request.put(`dashboard/seller/orders/${id}`, data),
  calculate: (params) => request.get('rest/products/calculate', { params }),
  updateStatus: (id, data) =>
    request.post(`dashboard/seller/order/details/${id}/status`, data),
  updateAllOrderStatus: (id, params) =>
    request.post(
      `dashboard/seller/orders/${id}/all-status/change`,
      {},
      { params }
    ),
  updateDelivery: (id, data) =>
    request.post(`dashboard/seller/order/details/${id}/deliveryman`, data),
};

export default orderService;
