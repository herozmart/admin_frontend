import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Card, Col, Form, Input, Row, Switch } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import brandService from '../../services/brand';
import ImageUploadSingle from '../../components/image-upload-single';
import { fetchBrands } from '../../redux/slices/brand';
import { useTranslation } from 'react-i18next';

const BrandsAdd = () => {
  const { t } = useTranslation();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [image, setImage] = useState(activeMenu.data?.image || null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const onFinish = (values) => {
    const body = {
      ...values,
      active: values.active ? 1 : 0,
      'images[0]': image?.name,
    };
    setLoadingBtn(true);
    const nextUrl = 'catalog/brands';
    brandService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        dispatch(fetchBrands({}));
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Card title={t('add.brand')}>
      <Form
        name='basic'
        layout='vertical'
        onFinish={onFinish}
        form={form}
        initialValues={{ active: true, ...activeMenu.data }}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={t('title')}
              name={'title'}
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={6}>
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
                type='brands'
                image={image}
                setImage={setImage}
                form={form}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <div className='col-md-12 col-sm-6'>
              <Form.Item
                label={t('active')}
                name='active'
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
            </div>
          </Col>
        </Row>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('submit')}
        </Button>
      </Form>
    </Card>
  );
};

export default BrandsAdd;
