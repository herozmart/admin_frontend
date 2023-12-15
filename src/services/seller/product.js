import request from '../request';

const productService = {
  getAll: (params) =>
    request.get('dashboard/seller/products/paginate', { params }),
  getById: (id, params) =>
    request.get(`dashboard/seller/products/${id}`, { params }),
  create: (params) => request.post(`dashboard/seller/products`, {}, { params }),
  update: (uuid, params) =>
    request.put(`dashboard/seller/products/${uuid}`, {}, { params }),
  delete: (uuid) => request.delete(`dashboard/seller/products/${uuid}`),
  deleteAll: (ids) => request.post(`dashboard/seller/products/delete/all`, ids),
  extras: (uuid, data) =>
    request.post(`dashboard/seller/products/${uuid}/extras`, data),
  stocks: (uuid, data) =>
    request.post(`dashboard/seller/products/${uuid}/stocks`, data),
  properties: (uuid, data) =>
    request.post(`dashboard/seller/products/${uuid}/properties`, data),
  setActive: (uuid) =>
    request.post(`dashboard/seller/products/${uuid}/active`, {}),
  export: (params) =>
    request.get('dashboard/seller/products/export', { params }),
  import: (data) => request.post('dashboard/seller/products/import', data, {}),
};

export default productService;
