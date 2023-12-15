import React, { useState } from 'react';
import { Card, Empty, Space, Spin } from 'antd';
import brandService from '../../services/brand';
import categoryService from '../../services/category';
import Meta from 'antd/lib/card/Meta';
import getImage from '../../helpers/getImage';
import { PlusOutlined } from '@ant-design/icons';
import shopService from '../../services/shop';
import OrderItems from './orderItems';
import { DebounceSelect } from '../../components/search';
import SearchInput from '../../components/search-input';
import ExtrasModal from './extrasModal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchProducts } from '../../redux/slices/product';
import useDidUpdate from '../../helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';

const ProductInfo = ({ form }) => {
  const { t } = useTranslation();
  const [brand, setBrand] = useState(null);
  const [category, setCategory] = useState(null);
  const [shop, setShop] = useState(null);
  const [search, setSearch] = useState(null);
  const [extrasModal, setExtrasModal] = useState(null);

  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.order, shallowEqual);
  const { products, loading } = useSelector(
    (state) => state.product,
    shallowEqual
  );

  useDidUpdate(() => {
    const params = {
      perPage: 10,
      page: 1,
      brand_id: brand?.value,
      category_id: category?.value,
      search,
      shop_id: shop?.value,
      active: 1,
    };
    dispatch(fetchProducts(params));
  }, [brand, category, shop, search]);

  async function fetchBrands(search) {
    return brandService.search(search).then(({ data }) =>
      data.map((item) => ({
        label: item.title,
        value: item.id,
      }))
    );
  }

  async function fetchCategories(search) {
    const params = { search };
    return categoryService.search(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
      }))
    );
  }

  async function fetchShops(search) {
    const params = { search, status: 'approved' };
    return shopService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
      }))
    );
  }

  const addProductToCart = (item) => {
    if (!data.currency) {
      toast.warning(t('please.select.currency'));
      return;
    }
    setExtrasModal(item);
  };

  return (
    <Card
      title={t('order.details')}
      extra={
        <Space>
          <DebounceSelect
            placeholder={t('select.shop')}
            fetchOptions={fetchShops}
            style={{ minWidth: 150 }}
            onChange={(value) => setShop(value)}
            value={shop}
          />
          <DebounceSelect
            placeholder={t('select.category')}
            fetchOptions={fetchCategories}
            style={{ minWidth: 150 }}
            onChange={(value) => setCategory(value)}
            value={category}
          />
          <DebounceSelect
            placeholder={t('select.brand')}
            fetchOptions={fetchBrands}
            style={{ minWidth: 150 }}
            onChange={(value) => setBrand(value)}
            value={brand}
          />
        </Space>
      }
    >
      <div className='d-flex justify-content-end mb-4'>
        <SearchInput placeholder={t('search')} handleChange={setSearch} />
      </div>
      <div className='products-row order-items'>
        {products.length ? (
          products.map((item) => (
            <Card
              className='products-col'
              key={item.id}
              cover={
                <img alt={item.translation?.title} src={getImage(item.img)} />
              }
              onClick={() => addProductToCart(item)}
            >
              <Meta
                title={item.translation?.title}
                description={item.stock?.price}
              />
              <div className='preview'>
                <PlusOutlined />
              </div>
            </Card>
          ))
        ) : (
          <div className='d-flex align-items-center justify-content-center w-100'>
            <Empty />
          </div>
        )}
        {loading && (
          <div className='loader'>
            <Spin />
          </div>
        )}
      </div>
      {extrasModal && (
        <ExtrasModal
          extrasModal={extrasModal}
          setExtrasModal={setExtrasModal}
        />
      )}

      <OrderItems form={form} />
    </Card>
  );
};

export default ProductInfo;
