import request from './request';

const orderService = {
  getAll: (params) =>
    request.get('dashboard/admin/orders/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/orders/${id}`, { params }),
  create: (data) => request.post('dashboard/admin/orders', data),
  update: (id, data) => request.put(`dashboard/admin/orders/${id}`, data),
  calculate: (params) =>
    request.get('dashboard/admin/order/calculate/products', { params }),
  updateStatus: (id, params) =>
    request.post(`dashboard/admin/order/details/${id}/status`, {}, { params }),
  updateAllOrderStatus: (id, params) =>
    request.post(
      `dashboard/admin/orders/${id}/all-status/change`,
      {},
      { params }
    ),
  updateDelivery: (id, params) =>
    request.put(`dashboard/admin/order/${id}/deliveryman`, {}, { params }),
};

export default orderService;
