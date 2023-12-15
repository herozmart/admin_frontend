import request from './request';

const bannerService = {
  getAll: (params) =>
    request.get('dashboard/admin/banners/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/banners/${id}`, { params }),
  create: (params) => request.post('dashboard/admin/banners', {}, { params }),
  update: (id, params) =>
    request.put(`dashboard/admin/banners/${id}`, {}, { params }),
  delete: (id) => request.delete(`dashboard/admin/banners/${id}`),
  setActive: (id) => request.post(`dashboard/admin/banners/active/${id}`),
};

export default bannerService;
