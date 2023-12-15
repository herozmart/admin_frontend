import request from './request';

const CountryService = {
  get: (params) => request.get('dashboard/admin/findex', { params }),
  getById: (id, params) =>
    request.get(`dashboard/admin/findex/${id}`, { params }),
  update: (id, data) => request.put(`dashboard/admin/findex/${id}`, data),
};

export default CountryService;
