import request from './request';

const exportService = {
  orderExport: (id, params) =>
    request.get(`dashboard/user/export/order/${id}/pdf`, {
      params,
    }),
  ticketExport: (id, params) =>
    request.get(`dashboard/admin/export/order-ticket/${id}/pdf`, {
      params,
      responseType: 'blob',
    }),
};

export default exportService;
