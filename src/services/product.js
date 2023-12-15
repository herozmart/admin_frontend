import request from './request';

const productService = {
  getAll: (params) =>
    request.get('dashboard/admin/products/paginate', { params }),
  getProductType: (params) =>
    request.get('dashboard/admin/product-type', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/products/${id}`, { params }),
  create: (params) => request.post(`dashboard/admin/products`, {}, { params }),
  update: (uuid, params) =>
    request.put(`dashboard/admin/products/${uuid}`, {}, { params }),
  delete: (uuid) => request.delete(`dashboard/admin/products/${uuid}`),
  deleteAll: (ids) => request.post(`dashboard/admin/products/delete/all`, ids),
  extras: (uuid, data) =>
    request.post(`dashboard/admin/products/${uuid}/extras`, data),
  stocks: (uuid, data) =>
    request.post(`dashboard/admin/products/${uuid}/stocks`, data),
  properties: (uuid, data) =>
    request.post(`dashboard/admin/products/${uuid}/properties`, data),
  setActive: (uuid) =>
    request.post(`dashboard/admin/products/${uuid}/active`, {}),
  export: (params) =>
    request.get(`dashboard/admin/products/export`, { params }),
  import: (data) => request.post('dashboard/admin/products/import', data, {}),
  updateStatus: (uuid, params) =>
    request.post(
      `dashboard/admin/products/${uuid}/status/change`,
      {},
      { params }
    ),
};

export default productService;
