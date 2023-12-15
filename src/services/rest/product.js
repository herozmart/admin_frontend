import request from '../request';

const productService = {
  getProductByIds: (params) => request.get('rest/products/ids', { params }),
};

export default productService;
