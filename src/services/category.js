import request from './request';

const categoryService = {
  getAll: (params) =>
    request.get('dashboard/admin/categories/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/categories/${id}`, { params }),
  create: (params) =>
    request.post('dashboard/admin/categories', {}, { params }),
  update: (id, params) =>
    request.put(`dashboard/admin/categories/${id}`, {}, { params }),
  delete: (id) => request.delete(`dashboard/admin/categories/${id}`),
  checkPosition: (data) =>
    request.post(`dashboard/admin/categories/check-position`, {
      id: data?.id || null,
      position: data?.position,
    }),
  search: (params) =>
    request.get('dashboard/admin/categories/search', { params }),
  setActive: (id) => request.post(`dashboard/admin/categories/active/${id}`),
  export: () => request.get(`dashboard/admin/categories/export`),
  import: (data) => request.post('dashboard/admin/categories/import', data, {}),
};

export default categoryService;
