import request from '../request';

const ReportService = {
  getReportProductChart: (params) =>
    request.get('dashboard/seller/products/report/chart', { params }),
  getReportProductList: (params) =>
    request.get('dashboard/seller/products/report/paginate', { params }),
  productReportCompare: (params) =>
    request.get('dashboard/seller/products/report/compare', { params }),
  getOrderChart: (params) =>
    request.get('dashboard/seller/orders/report/chart', { params }),
  getOrderProducts: (params) =>
    request.get('dashboard/seller/orders/report/paginate', { params }),
  getStocks: (params) =>
    request.get('dashboard/seller/stocks/report/paginate', {
      params,
      timeout: Infinity,
    }),
  getCategoriesProducts: (params) =>
    request.get('dashboard/seller/categories/report/paginate', { params }),
  productCategoriesCompare: (params) =>
    request.get('dashboard/seller/categories/report/compare', { params }),
  getCategoriesChart: (params) =>
    request.get('dashboard/seller/categories/report/chart', { params }),
  getVariationProducts: (params) =>
    request.get('dashboard/seller/variations/report/paginate', { params }),
  productVariationCompare: (params) =>
    request.get('dashboard/seller/variations/report/compare', { params }),
  getVariationChart: (params) =>
    request.get('dashboard/seller/variations/report/chart', { params }),
  getExtrasReport: (id, params) =>
    request.get(`dashboard/seller/product/${id}/report/stock`, { params }),
  getRevenueChart: (params) =>
    request.get('dashboard/seller/revenue/report/chart', { params }),
  getRevenueProducts: (params) =>
    request.get('dashboard/seller/revenue/report/paginate', { params }),
  getOverviewChart: (params) =>
    request.get('dashboard/seller/overview/report/chart', { params }),
  getOverviewProducts: (params) =>
    request.get('dashboard/seller/overview/report/leaderboards/5', { params }),
};

export default ReportService;
