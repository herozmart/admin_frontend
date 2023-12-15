import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
} from 'antd';
import { DebounceSelect } from '../../components/search';
import TextArea from 'antd/es/input/TextArea';
import shopService from '../../services/shop';
import brandService from '../../services/brand';
import categoryService from '../../services/category';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ImageGallery from '../../components/image-gallery';
import productService from '../../services/product';
import { replaceMenu, setMenuData } from '../../redux/slices/menu';
import unitService from '../../services/unit';
import { useNavigate, useParams } from 'react-router-dom';
import { AsyncTreeSelect } from '../../components/async-tree-select';
import { useTranslation } from 'react-i18next';
import Description from './description';

const ProductsIndex = ({ next }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const navigate = useNavigate();
  const {
    settings: { product_auto_approve },
  } = useSelector((state) => state.globalSettings, shallowEqual);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );
  const [fileList, setFileList] = useState(activeMenu.data?.images || []);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(
        setMenuData({ activeMenu, data: { ...activeMenu.data, ...data } })
      );
    };
  }, []);

  async function fetchUserShopList(search) {
    const params = { search };
    return shopService.search(params).then((res) =>
      res.data.map((item) => ({
        label: item.translation ? item.translation.title : 'no name',
        value: item.id,
      }))
    );
  }

  async function fetchUserBrandList(username) {
    return brandService.search(username).then((res) =>
      res.data.map((item) => ({
        label: item.title,
        value: item.id,
      }))
    );
  }

  async function fetchUserCategoryList() {
    const params = { perPage: 100 };
    return categoryService.getAll(params).then((res) =>
      res.data.map((item) => ({
        title: item.translation?.title,
        value: item.id,
        key: item.id,
        disabled: item.children.length ? true : false,
        children: item.children?.map((el) => ({
          title: el.translation?.title,
          value: el.id,
          key: el.id,
          disabled: el.children.length ? true : false,
          children: el.children?.map((three) => ({
            title: three.translation?.title,
            value: three.id,
            key: three.id,
            disabled: three.children.length ? true : false,
          })),
        })),
      }))
    );
  }

  const onFinish = (values) => {
    setLoadingBtn(true);
    const params = {
      ...values,
      active: Number(values.active),
      brand_id: values.brand?.value,
      category_id: values.category?.value,
      shop_id: values.shop?.value,
      unit_id: values.unit?.value,
      images: undefined,
      brand: undefined,
      category: undefined,
      shop: undefined,
      unit: undefined,
      product_auto_approve: Boolean(Number(product_auto_approve)) || false,
      ...Object.assign(
        {},
        ...fileList.map((item, index) => ({
          [`images[${index}]`]: item.name,
        }))
      ),
    };
    console.log('params => ', params);
    if (uuid) {
      productUpdate(values, params);
    } else {
      productCreate(values, params);
    }
  };

  function productCreate(values, params) {
    productService
      .create(params)
      .then(({ data }) => {
        dispatch(
          replaceMenu({
            id: `product-${data.uuid}`,
            url: `product/${data.uuid}`,
            name: t('add.product'),
            data: values,
            refetch: false,
          })
        );
        navigate(`/product/${data.uuid}?step=1`);
      })
      .finally(() => setLoadingBtn(false));
  }

  function productUpdate(values, params) {
    productService
      .update(uuid, params)
      .then(({ data }) => {
        dispatch(
          setMenuData({
            activeMenu,
            data: values,
          })
        );
        next();
      })
      .finally(() => setLoadingBtn(false));
  }

  function fetchUnits() {
    const params = {
      perPage: 100,
      page: 1,
      active: 1,
    };
    unitService.getAll(params).then(({ data }) => setUnits(formatUnits(data)));
  }

  useEffect(() => {
    fetchUnits();
  }, []);

  function formatUnits(data) {
    return data.map((item) => ({
      label: item.translation?.title,
      value: item.id,
    }));
  }

  return (
    <Form
      layout='vertical'
      form={form}
      initialValues={{ active: true, ...activeMenu.data }}
      onFinish={onFinish}
    >
      <Row gutter={12}>
        <Col span={12}>
          {languages.map((item) => (
            <Form.Item
              key={'name' + item.id}
              label={t('name')}
              name={`title[${item.locale}]`}
              rules={[
                {
                  required: item.locale === defaultLang,
                  message: t('required'),
                },
              ]}
              hidden={item.locale !== defaultLang}
            >
              <Input />
            </Form.Item>
          ))}
        </Col>
        <Col span={12} className='mb-4'>
          <Description languages={languages} form={form} lang={defaultLang} />
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('shop')}
            name='shop'
            rules={[{ required: true, message: t('required') }]}
          >
            <DebounceSelect
              fetchOptions={fetchUserShopList}
              disabled={uuid ? true : false}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('brand')}
            name='brand'
            rules={[
              {
                required: true,
                message: t('required'),
              },
            ]}
          >
            <DebounceSelect fetchOptions={fetchUserBrandList} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={t('category')}
            name='category'
            rules={[{ required: true, message: t('required') }]}
          >
            <AsyncTreeSelect fetchOptions={fetchUserCategoryList} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('tax')}
            name='tax'
            rules={[{ required: true, message: t('required') }]}
          >
            <InputNumber min={0} className='w-100' addonAfter='%' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('qr.code')}
            name='bar_code'
            rules={[{ required: true, message: t('required') }]}
          >
            <Input className='w-100' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('unit')}
            name='unit'
            rules={[{ required: true, message: t('required') }]}
          >
            <Select labelInValue={true} filterOption={false} options={units} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('min.qty')}
            name='min_qty'
            rules={[{ required: true, message: t('required') }]}
          >
            <InputNumber min={0} className='w-100' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label={t('max.qty')}
            name='max_qty'
            rules={[{ required: true, message: t('required') }]}
          >
            <InputNumber min={0} className='w-100' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('active')} name='active' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label={t('images')}
            name='images'
            rules={[{ required: true, message: t('required') }]}
          >
            <ImageGallery
              type='products'
              fileList={fileList}
              setFileList={setFileList}
              form={form}
            />
          </Form.Item>
        </Col>
      </Row>

      <Button type='primary' htmlType='submit' loading={loadingBtn}>
        {t('next')}
      </Button>
    </Form>
  );
};

export default ProductsIndex;
