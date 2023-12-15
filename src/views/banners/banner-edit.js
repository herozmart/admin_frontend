import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import ImageUploadSingle from '../../components/image-upload-single';
import { fetchBanners } from '../../redux/slices/banner';
import shopService from '../../services/shop';
import productService from '../../services/product';
import productRestService from '../../services/rest/product';
import { DebounceSelect } from '../../components/search';
import bannerService from '../../services/banner';
import { IMG_URL } from '../../configs/app-global';
import { useTranslation } from 'react-i18next';

const BannerEdit = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [image, setImage] = useState(activeMenu.data?.image || null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const shop_id = Form.useWatch('shop_id', form);
  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

  function getProducts(ids, banner) {
    const result = ids.map((item, idx) => ({
      [`products[${idx}]`]: item,
    }));
    const params = Object.assign({}, ...result);
    productRestService
      .getProductByIds(params)
      .then(({ data }) => {
        form.setFieldsValue({
          ...banner,
          image: createImage(banner.img),
          products: formatProducts(data),
        });
        setImage(createImage(banner.img));
      })
      .finally(() => setLoading(false));
  }

  const getBanner = (alias) => {
    setLoading(true);
    bannerService
      .getById(alias)
      .then((res) => {
        let banner = res.data;
        getProducts(banner.products, banner);
      })
      .finally(() => dispatch(disableRefetch(activeMenu)));
  };

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
      .update(id, body)
      .then(() => {
        toast.success(t('successfully.updated'));
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
    if (activeMenu.refetch) {
      getBanner(id);
    }
    fetchShops();
  }, [activeMenu.refetch]);

  function formatProducts(data) {
    return data.map((item) => ({
      label: item.translation?.title,
      value: item.id,
    }));
  }

  return (
    <Card title={t('edit.banner')} className='h-100'>
      {!loading ? (
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
      ) : (
        <div className='d-flex justify-content-center align-items-center'>
          <Spin size='large' className='py-5' />
        </div>
      )}
    </Card>
  );
};

export default BannerEdit;
