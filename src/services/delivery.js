import request from './request';

const deliveryService = {
  get: (params) => request.get('dashboard/admin/deliveries', { params }),
  getAll: (params) =>
    request.get('dashboard/admin/deliveries/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/deliveries/${id}`, { params }),
  create: (params) =>
    request.post('dashboard/admin/deliveries', {}, { params }),
  update: (id, params) =>
    request.put(`dashboard/admin/deliveries/${id}`, {}, { params }),
  delete: (id, params) => request.delete(`dashboard/admin/deliveries/${id}`),
  getTypes: (params) =>
    request.get(`dashboard/admin/delivery/types`, { params }),
};

export default deliveryService;
