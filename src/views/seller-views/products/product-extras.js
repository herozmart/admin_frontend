import React, { useEffect, useState } from 'react';
import { Spin, Form, Row, Col, Checkbox, Button, Space } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import productService from '../../../services/seller/product';
import { setMenuData } from '../../../redux/slices/menu';
import { fetchSelletExtraGroups } from '../../../redux/slices/extraGroup';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

const ProductExtras = ({ next, prev }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { loading, extraGroups } = useSelector(
    (state) => state.extraGroup,
    shallowEqual
  );
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    const params = { valid: true };
    dispatch(fetchSelletExtraGroups(params));
  }, []);

  function formatExtraGroups(list) {
    return list.map((item) => ({
      id: item.id,
      label: item.translation?.title,
      value: item.id,
    }));
  }

  const onFinish = (values) => {
    setLoadingBtn(true);
    const extras = values.extras || [];
    extras.sort((a, b) => a - b);
    productService
      .extras(uuid, { extras })
      .then(() => {
        dispatch(
          setMenuData({
            activeMenu,
            data: { ...activeMenu.data, extras },
          })
        );
        next();
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      layout='vertical'
      initialValues={{ ...activeMenu.data }}
      onFinish={onFinish}
    >
      {!loading ? (
        <>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label={t('extras')} name='extras'>
                <Checkbox.Group options={formatExtraGroups(extraGroups)} />
              </Form.Item>
            </Col>
          </Row>
          <Space>
            <Button onClick={prev}>{t('prev')}</Button>
            <Button type='primary' htmlType='submit' loading={loadingBtn}>
              {t('next')}
            </Button>
          </Space>
        </>
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Form>
  );
};
export default ProductExtras;
