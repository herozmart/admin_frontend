import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Card,
  Space,
  Row,
  Col,
  Select,
  Switch,
  TimePicker,
  Input,
  InputNumber,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import LanguageList from '../../components/language-list';
import shopService from '../../services/seller/shop';
import { IMG_URL } from '../../configs/app-global';
import moment from 'moment';
import ImageUploadSingle from '../../components/image-upload-single';
import TextArea from 'antd/lib/input/TextArea';
import Map from '../../components/map';
import { useTranslation } from 'react-i18next';
import getDefaultLocation from '../../helpers/getDefaultLocation';

export default function MyShopEdit() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages, defaultLang } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual
  );

  const [location, setLocation] = useState(getDefaultLocation(settings));
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [logoImage, setLogoImage] = useState(activeMenu.data?.logo_img || null);
  const [backImage, setBackImage] = useState(
    activeMenu.data?.background_img || null
  );

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.open_time = moment(data.open_time).format('HH:mm:ss');
      data.close_time = moment(data.close_time).format('HH:mm:ss');
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  function getLanguageFields(data) {
    if (!data) {
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
      [`address[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.address,
    }));
    return Object.assign({}, ...result);
  }

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

  const fetchShop = () => {
    setLoading(true);
    shopService
      .get()
      .then(({ data }) => {
        form.setFieldsValue({
          ...data,
          ...getLanguageFields(data),
          logo_img: createImage(data.logo_img),
          background_img: createImage(data.background_img),
          open_time: moment(data.open_time, 'HH:mm:ss'),
          close_time: moment(data.close_time, 'HH:mm:ss'),
        });
        setBackImage(createImage(data.background_img));
        setLogoImage(createImage(data.logo_img));
        setLocation({
          lat: Number(data.location?.latitude),
          lng: Number(data.location?.longitude),
        });
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      ...values,
      'images[0]': logoImage?.name,
      'images[1]': backImage?.name,
      open_time: moment(values.open_time).format('HH:mm:ss'),
      close_time: moment(values.close_time).format('HH:mm:ss'),
      visibility: Number(values.visibility),
      open: Number(values.open),
      location: location.lat + ',' + location.lng,
    };
    console.log('body => ', body);
    console.log('values => ', values);
    const nextUrl = 'my-shop';
    shopService
      .update(body)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchShop();
    }
  }, [activeMenu.refetch]);

  const handleCancel = () => {
    const nextUrl = 'my-shop';
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    navigate(`/${nextUrl}`);
  };

  return (
    <Card title={t('edit.shop')} extra={<LanguageList />} loading={loading}>
      <Form
        form={form}
        name='basic'
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          ...activeMenu.data,
          open_time: moment(activeMenu.data?.open_time, 'HH:mm:ss'),
          close_time: moment(activeMenu.data?.close_time, 'HH:mm:ss'),
        }}
      >
        <Row gutter={36}>
          <Col span={8}>
            <Card>
              <Row>
                <Col span={12}>
                  <Form.Item label={t('logo.image')}>
                    <ImageUploadSingle
                      type={'shops/logo'}
                      image={logoImage}
                      setImage={setLogoImage}
                      form={form}
                      name='logo_img'
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={t('background.image')}>
                    <ImageUploadSingle
                      type={'shops/background'}
                      image={backImage}
                      setImage={setBackImage}
                      form={form}
                      name='background_img'
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name='status' label={t('status')}>
                    <Select disabled>
                      <Select.Option value={'new'}>{t('new')}</Select.Option>
                      <Select.Option value={'edited'}>
                        {t('edited')}
                      </Select.Option>
                      <Select.Option value={'approved'}>
                        {t('approved')}
                      </Select.Option>
                      <Select.Option value={'rejected'}>
                        {t('rejected')}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={t('visibility')}
                    name='visibility'
                    valuePropName='checked'
                    hidden
                  >
                    <Switch disabled />
                  </Form.Item>
                  <Form.Item
                    label={t('open')}
                    name='open'
                    valuePropName='checked'
                    hidden
                  >
                    <Switch disabled />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label={t('status.note')} name='status_note'>
                    <TextArea rows={4} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
            <Card title={t('shop.working.hours')}>
              <Row>
                <Col span={24}>
                  <Form.Item
                    name='open_time'
                    label={t('open.hours')}
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <TimePicker className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name='close_time'
                    label={t('close.hours')}
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <TimePicker className='w-100' />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={16}>
            <Card title={t('general')}>
              <Row>
                <Col span={24}>
                  {languages.map((item, idx) => (
                    <Form.Item
                      key={'title' + idx}
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
                <Col span={24}>
                  <Form.Item
                    label={t('phone')}
                    name='phone'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  {languages.map((item, idx) => (
                    <Form.Item
                      key={'desc' + idx}
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
              </Row>
            </Card>

            <Card title={t('order.info')}>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label={t('min.amount')}
                    name='min_amount'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t('tax')}
                    name='tax'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={t('percentage')}
                    name='percentage'
                    rules={[{ required: true, message: t('required') }]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <Card title={t('address')}>
              <Row gutter={12}>
                <Col span={12}>
                  {languages.map((item, idx) => (
                    <Form.Item
                      key={'address' + idx}
                      label={t('address')}
                      name={`address[${item.locale}]`}
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
                <Col span={12}>
                  <Form.Item
                    label={t('delivery.range')}
                    name='delivery_range'
                    rules={[
                      {
                        required: true,
                        message: t('required'),
                      },
                    ]}
                  >
                    <InputNumber min={0} className='w-100' />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Map
                    location={location}
                    setLocation={setLocation}
                    setAddress={(value) =>
                      form.setFieldsValue({
                        [`address[${defaultLang}]`]: value,
                      })
                    }
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Space>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('save')}
          </Button>
          <Button onClick={handleCancel}>{t('cancel')}</Button>
        </Space>
      </Form>
    </Card>
  );
}
