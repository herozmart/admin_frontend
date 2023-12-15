import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, Col, Form, Input, Row, Select, Switch } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import ImageUploadSingle from '../../components/image-upload-single';
import { fetchBanners } from '../../redux/slices/banner';
import shopService from '../../services/shop';
import productService from '../../services/product';
import { DebounceSelect } from '../../components/search';
import bannerService from '../../services/banner';
import { useTranslation } from 'react-i18next';

const BannerAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [image, setImage] = useState(activeMenu.data?.image || null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [shops, setShops] = useState([]);
  const shop_id = Form.useWatch('shop_id', form);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const onFinish = (values) => {
    const body = {
      url: values.url,
      shop_id: values.shop_id,
      'images[0]': image?.name,
      ...Object.assign(
        {},
        ...values.products.map((item, index) => ({
          [`products[${index}]`]: item.value,
        }))
      ),
    };
    setLoadingBtn(true);
    const nextUrl = 'banners';
    bannerService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchBanners());
      })
      .finally(() => setLoadingBtn(false));
  };

  function fetchProducts(search) {
    const params = {
      search,
      perPage: 10,
      shop_id,
    };
    return productService
      .getAll(params)
      .then((res) => formatProducts(res.data));
  }

  function fetchShops() {
    shopService.get().then(({ data }) => setShops(data));
  }

  useEffect(() => {
    fetchShops();
  }, []);

  function formatProducts(data) {
    return data.map((item) => ({
      label: item.translation?.title,
      value: item.id,
    }));
  }

  return (
    <Card title={t('add.banner')} className='h-100'>
      <Form
        name='banner-add'
        layout='vertical'
        onFinish={onFinish}
        form={form}
        initialValues={{ active: true, ...activeMenu.data }}
        className='d-flex flex-column h-100'
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={t('image')}
              name='image'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <ImageUploadSingle
                type='banners'
                image={image}
                setImage={setImage}
                form={form}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label={t('url')} name={'url'}>
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={t('shop')}
              name={'shop_id'}
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Select>
                {shops.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.translation?.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t('products')}
              name={'products'}
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <DebounceSelect
                disabled={!shop_id}
                mode='multiple'
                fetchOptions={fetchProducts}
                debounceTimeout={200}
                refetch
              />
            </Form.Item>
          </Col>
        </Row>
        <div className='flex-grow-1 d-flex flex-column justify-content-end'>
          <div className='pb-5'>
            <Button type='primary' htmlType='submit' loading={loadingBtn}>
              {t('submit')}
            </Button>
          </div>
        </div>
      </Form>
    </Card>
  );
};

export default BannerAdd;
