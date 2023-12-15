import request from './request';

const ReportService = {
  getReportProductChart: (params) =>
    request.get('dashboard/admin/products/report/chart', { params }),
  getReportProductList: (params) =>
    request.get('dashboard/admin/products/report/paginate', { params }),
  productReportCompare: (params) =>
    request.get('dashboard/admin/products/report/compare', { params }),
  getOrderChart: (params) =>
    request.get('dashboard/admin/orders/report/chart', { params }),
  getOrderProducts: (params) =>
    request.get('dashboard/admin/orders/report/paginate', { params }),
  getStocks: (params) =>
    request.get('dashboard/admin/stocks/report/paginate', {
      params,
      timeout: Infinity,
    }),
  getCategoriesProducts: (params) =>
    request.get('dashboard/admin/categories/report/paginate', { params }),
  productCategoriesCompare: (params) =>
    request.get('dashboard/admin/categories/report/compare', { params }),
  getCategoriesChart: (params) =>
    request.get('dashboard/admin/categories/report/chart', { params }),
  getVariationProducts: (params) =>
    request.get('dashboard/admin/variations/report/paginate', { params }),
  productVariationCompare: (params) =>
    request.get('dashboard/admin/variations/report/compare', { params }),
  getVariationChart: (params) =>
    request.get('dashboard/admin/variations/report/chart', { params }),
  getExtrasReport: (id, params) =>
    request.get(`dashboard/admin/product/${id}/report/stock`, { params }),
  getRevenueChart: (params) =>
    request.get('dashboard/admin/revenue/report/chart', { params }),
  getRevenueProducts: (params) =>
    request.get('dashboard/admin/revenue/report/paginate', { params }),
  getOverviewChart: (params) =>
    request.get('dashboard/admin/overview/report/chart', { params }),
  getOverviewProducts: (params) =>
    request.get('dashboard/admin/overview/report/leaderboards/5', { params }),
  getShopsChart: (params) =>
    request.get('dashboard/admin/shops/report/chart', { params }),
  getShopsProducts: (params) =>
    request.get('dashboard/admin/shops/report/paginate', { params }),
  productShopsCompare: (params) =>
    request.get('dashboard/admin/shops/report/compare', { params }),
};

export default ReportService;
