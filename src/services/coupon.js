import request from './request';

const couponService = {
  getAll: (params) =>
    request.get('dashboard/admin/coupons/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/coupons/${id}`, { params }),
  create: (data) => request.post('dashboard/admin/coupons', data),
  update: (id, data) => request.put(`dashboard/admin/coupons/${id}`, data),
  delete: (id) => request.delete(`dashboard/admin/coupons/${id}`),
};

export default couponService;
