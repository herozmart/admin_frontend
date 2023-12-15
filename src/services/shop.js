import request from './request';

const shopService = {
  get: (params) => request.get('dashboard/admin/shops', { params }),
  getShopWidthSeller: (params) =>
    request.get('dashboard/admin/shops-with-seller', { params }),
  getAll: (params) => request.get('dashboard/admin/shops/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/shops/${id}`, { params }),
  create: (params) => request.post('dashboard/admin/shops', {}, { params }),
  update: (id, params) =>
    request.put(`dashboard/admin/shops/${id}`, {}, { params }),
  delete: (id) => request.delete(`dashboard/admin/shops/${id}`),
  search: (params) => request.get('dashboard/admin/shops/search', { params }),
  getShopDeliveries: (params) =>
    request.get('rest/shops/deliveries', { params }),
  statusChange: (id, params) =>
    request.post(`dashboard/admin/shops/${id}/status/change`, {}, { params }),
};

export default shopService;
