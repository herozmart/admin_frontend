import React, { useState } from 'react';
import { Button, Col, DatePicker, Form, Input, Modal, Row, Select } from 'antd';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import userService from '../../services/user';
import { toast } from 'react-toastify';
import { fetchDeliverymans } from '../../redux/slices/deliveryman';

export default function DeliverymanModal({ visibility, handleCancel }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [birthday, setBirthday] = useState(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const changeData = (data, dataText) => setBirthday(dataText);

  const onFinish = (values) => {
    const body = {
      ...values,
      role: 'deliveryman',
      birthday,
    };
    setLoading(true);
    userService
      .create(body)
      .then(() => {
        handleCancel();
        toast.success(t('successfully.created'));
        dispatch(fetchDeliverymans());
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      visible={visibility}
      title={t('add.deliveryman')}
      onCancel={handleCancel}
      footer={[
        <Button type='primary' onClick={() => form.submit()} loading={loading}>
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
      className='large-modal'
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{ gender: 'male' }}
        onFinish={onFinish}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label={t('firstname')}
              name='firstname'
              help={error?.firstname ? error.firstname[0] : null}
              validateStatus={error?.firstname ? 'error' : 'success'}
              rules={[{ required: true, message: t('required') }]}
            >
              <Input className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('lastname')}
              name='lastname'
              help={error?.lastname ? error.lastname[0] : null}
              validateStatus={error?.lastname ? 'error' : 'success'}
              rules={[{ required: true, message: t('required') }]}
            >
              <Input className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('phone')}
              name='phone'
              help={error?.phone ? error.phone[0] : null}
              validateStatus={error?.phone ? 'error' : 'success'}
              rules={[{ required: true, message: t('required') }]}
            >
              <Input className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('birthday')}
              name='birthday'
              rules={[{ required: true, message: t('required') }]}
              valuePropName='data'
            >
              <DatePicker onChange={changeData} className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('gender')}
              name='gender'
              rules={[{ required: true, message: t('required') }]}
            >
              <Select picker='dayTime' className='w-100'>
                <Select.Option value='male'>{t('male')}</Select.Option>
                <Select.Option value='female'>{t('female')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('email')}
              name='user_email'
              help={error?.email ? error.email[0] : null}
              validateStatus={error?.email ? 'error' : 'success'}
              rules={[{ required: true, message: t('required') }]}
            >
              <Input type='email' className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('password')}
              name='password'
              help={error?.password ? error.password[0] : null}
              validateStatus={error?.password ? 'error' : 'success'}
              rules={[{ required: true, message: t('required') }]}
            >
              <Input type='password' className='w-100' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('password.confirmation')}
              help={
                error?.password_confirmation
                  ? error.password_confirmation[0]
                  : null
              }
              validateStatus={
                error?.password_confirmation ? 'error' : 'success'
              }
              name='password_confirmation'
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(t('password.do.not.match'));
                  },
                }),
              ]}
            >
              <Input type='password' className='w-100' />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
