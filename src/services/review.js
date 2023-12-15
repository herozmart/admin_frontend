import request from './request';

const reviewService = {
  getAll: (params) =>
    request.get('dashboard/admin/reviews/paginate', { params }),
  getById: (id) => request.get(`dashboard/admin/reviews/${id}`),
  delete: (id) => request.delete(`dashboard/admin/reviews/${id}`),
};

export default reviewService;
