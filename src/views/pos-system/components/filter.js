import React, { useState } from 'react';
import { Card, Col, Row } from 'antd';
import { DebounceSelect } from '../../../components/search';
import shopService from '../../../services/shop';
import brandService from '../../../services/brand';
import categoryService from '../../../services/category';
import useDidUpdate from '../../../helpers/useDidUpdate';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../../../redux/slices/product';
import SearchInput from '../../../components/search-input';
import { useTranslation } from 'react-i18next';

const Filter = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [brand, setBrand] = useState(null);
  const [category, setCategory] = useState(null);
  const [shop, setShop] = useState(null);
  const [search, setSearch] = useState(null);

  async function fetchUserShop(search) {
    const params = { search, status: 'approved' };
    return shopService.getAll(params).then((res) =>
      res.data.map((item) => ({
        label: item.translation !== null ? item.translation.title : 'no name',
        value: item.id,
      }))
    );
  }

  async function fetchUserBrand(username) {
    return brandService.search(username).then((res) =>
      res.data.map((item) => ({
        label: item.title,
        value: item.id,
      }))
    );
  }

  async function fetchUserCategory(search) {
    const params = { search };
    return categoryService.search(params).then((res) =>
      res.data.map((item) => ({
        label: item.translation !== null ? item.translation.title : 'no name',
        value: item.id,
      }))
    );
  }

  useDidUpdate(() => {
    const params = {
      brand_id: brand?.value,
      category_id: category?.value,
      search,
      shop_id: shop?.value,
      active: 1,
    };
    dispatch(fetchProducts(params));
  }, [brand, category, shop, search]);

  return (
    <Card>
      <Row gutter={12}>
        <Col span={9}>
          <SearchInput
            placeholder={t('search')}
            handleChange={setSearch}
            style={{}}
          />
        </Col>
        <Col span={5}>
          <DebounceSelect
            className='w-100'
            placeholder={t('select.shop')}
            fetchOptions={fetchUserShop}
            onChange={(value) => setShop(value)}
            value={shop}
          />
        </Col>
        <Col span={5}>
          <DebounceSelect
            className='w-100'
            placeholder={t('select.category')}
            fetchOptions={fetchUserCategory}
            onChange={(value) => setCategory(value)}
            value={category}
          />
        </Col>
        <Col span={5}>
          <DebounceSelect
            className='w-100'
            placeholder={t('select.brand')}
            fetchOptions={fetchUserBrand}
            onChange={(value) => setBrand(value)}
            value={brand}
          />
        </Col>
      </Row>
    </Card>
  );
};
export default Filter;
