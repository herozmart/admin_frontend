import React, { useEffect, useState } from 'react';
import { Card, Col, Pagination, Row, Spin } from 'antd';
import Meta from 'antd/es/card/Meta';
import { PlusOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import getImage from '../../../helpers/getImage';
import { fetchProducts } from '../../../redux/slices/product';
import { disableRefetch } from '../../../redux/slices/menu';
import { toast } from 'react-toastify';
import ProductModal from './product-modal';
import { fetchPayments } from '../../../redux/slices/payment';
import { useTranslation } from 'react-i18next';

export default function ProductCard() {
  const colLg = {
    lg: 8,
    xl: 6,
    xxl: 6,
  };
  const { t } = useTranslation();
  const [extrasModal, setExtrasModal] = useState(null);
  const dispatch = useDispatch();
  const { products, loading, meta, params } = useSelector(
    (state) => state.product,
    shallowEqual
  );
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { currency } = useSelector((state) => state.cart, shallowEqual);

  function onChangePagination(page) {
    dispatch(fetchProducts({ perPage: 12, page }));
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchProducts({ perPage: 12, currency_id: currency?.id }));
      dispatch(fetchPayments());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const addProductToCart = (item) => {
    if (!currency) {
      toast.warning(t('please.select.currency'));
      return;
    }
    setExtrasModal(item);
  };

  return (
    <div className='px-2'>
      {loading ? (
        <Spin className='d-flex justify-content-center my-5' />
      ) : (
        <Row gutter={12} className='mt-4 product-card'>
          {products.map((item, index) => (
            <Col {...colLg} key={index}>
              <Card
                className='products-col'
                key={item.id}
                cover={<img alt={item.name} src={getImage(item.img)} />}
                onClick={() => addProductToCart(item)}
              >
                <Meta title={item.name} description={item.stock?.price} />
                <div className='preview'>
                  <PlusOutlined />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      {extrasModal && (
        <ProductModal
          extrasModal={extrasModal}
          setExtrasModal={setExtrasModal}
        />
      )}
      <div className='d-flex justify-content-end my-5'>
        <Pagination
          total={meta.total}
          current={params.page}
          pageSize={12}
          showSizeChanger={false}
          onChange={onChangePagination}
        />
      </div>
    </div>
  );
}
