import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, Col, Form, Input, Row, Spin, Switch } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../../redux/slices/menu';
import { fetchLooks } from '../../../redux/slices/look';
import productService from '../../../services/seller/product';
import productRestService from '../../../services/rest/product';
import { DebounceSelect } from '../../../components/search';
import lookService from '../../../services/seller/look';
import { IMG_URL } from '../../../configs/app-global';
import { useTranslation } from 'react-i18next';
import TextArea from 'antd/lib/input/TextArea';
import LanguageList from '../../../components/language-list';
import ImageGallery from '../../../components/image-gallery';
import getTranslationFields from '../../../helpers/getTranslationFields';

export default function LookEdit() {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [fileList, setFileList] = useState(activeMenu.data?.images || []);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const createImages = (items) =>
    items.map((item) => ({
      uid: item.id,
      name: item.path,
      url: IMG_URL + item.path,
    }));

  function getLanguageFields(data) {
    if (!data?.translations) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.title,
      [`description[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.description,
    }));
    return Object.assign({}, ...result);
  }

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
          image: createImages(banner.galleries),
          products: formatProducts(data),
          ...getLanguageFields(banner),
        });
        setFileList(createImages(banner.galleries));
      })
      .finally(() => setLoading(false));
  }

  const getBanner = (alias) => {
    setLoading(true);
    lookService
      .getById(alias)
      .then((res) => {
        let banner = res.data;
        getProducts(banner.products, banner);
      })
      .finally(() => dispatch(disableRefetch(activeMenu)));
  };

  const onFinish = (values) => {
    console.log('values => ', values);
    const body = {
      images: fileList.map((item) => item.name),
      products: values.products.map((item) => item.value),
      title: getTranslationFields(languages, values),
      description: getTranslationFields(languages, values, 'description'),
    };
    console.log('body => ', body);
    setLoadingBtn(true);
    const nextUrl = 'seller/looks';
    lookService
      .update(id, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchLooks());
      })
      .finally(() => setLoadingBtn(false));
  };

  async function fetchProducts(search) {
    const params = {
      search,
      perPage: 10,
      look: true,
    };
    return productService
      .getAll(params)
      .then((res) => formatProducts(res.data));
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      getBanner(id);
    }
  }, [activeMenu.refetch]);

  function formatProducts(data) {
    return data.map((item) => ({
      label: item.translation?.title,
      value: item.id,
    }));
  }

  return (
    <Card title={t('edit.look')} className='h-100' extra={<LanguageList />}>
      {!loading ? (
        <Form
          name='look-edit'
          layout='vertical'
          onFinish={onFinish}
          form={form}
          initialValues={{ active: true, ...activeMenu.data }}
          className='d-flex flex-column h-100'
        >
          <Row gutter={12}>
            <Col span={12}>
              {languages.map((item) => (
                <Form.Item
                  key={'title' + item.id}
                  label={t('title')}
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
            <Col span={24}>
              <Form.Item label={t('images')} name='images'>
                <ImageGallery
                  type='banners'
                  fileList={fileList}
                  setFileList={setFileList}
                  form={form}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              {languages.map((item) => (
                <Form.Item
                  key={'description' + item.id}
                  label={t('description')}
                  name={`description[${item.locale}]`}
                  rules={[
                    {
                      required: item.locale === defaultLang,
                      message: t('required'),
                    },
                  ]}
                  hidden={item.locale !== defaultLang}
                >
                  <TextArea rows={4} />
                </Form.Item>
              ))}
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
}
