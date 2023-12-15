import React, { useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import userService from '../../services/user';
import { toast } from 'react-toastify';
import { removeFromMenu } from '../../redux/slices/menu';
import { fetchUsers } from '../../redux/slices/user';
import moment from 'moment';
import ImageUploadSingle from '../../components/image-upload-single';
import { useTranslation } from 'react-i18next';
import { fetchClients } from '../../redux/slices/client';

export default function UserEditForm({ form, data, image, setImage }) {
  const { t } = useTranslation();
  const activeMenu = useSelector((list) => list.menu.activeMenu, shallowEqual);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [date, setDate] = useState();
  const [error, setError] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const changeData = (data, dataText) => setDate(dataText);

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      phone: values.phone,
      birthday: date,
      gender: values.gender,
      password_confirmation: values.password_confirmation,
      password: values.password,
      images: [image?.name],
    };
    const nextUrl = data.role !== 'user' ? 'users/admin' : 'users/user';
    userService
      .update(uuid, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}`);
        if (data.role === 'user') {
          dispatch(fetchClients());
        } else {
          dispatch(fetchUsers({ role: data.role }));
        }
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Form
      form={form}
      layout='vertical'
      initialValues={{
        gender: 'male',
        role: 'admin',
        ...data,
        birthday: data?.birthday ? moment(data.birthday) : null,
      }}
      onFinish={onFinish}
      className='px-2'
    >
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item label={t('avatar')}>
            <ImageUploadSingle
              type='users'
              image={image}
              setImage={setImage}
              form={form}
            />
          </Form.Item>
        </Col>
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

        <Col span={12} hidden={process.env.REACT_APP_IS_DEMO === 'true'}>
          <Form.Item
            label={t('phone')}
            name='phone'
            help={error?.phone ? error.phone[0] : null}
            validateStatus={error?.phone ? 'error' : 'success'}
            rules={[{ required: true, message: t('required') }]}
          >
            <Input min={0} className='w-100' />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label={t('birthday')}
            name='birthday'
            rules={[{ required: true, message: t('required') }]}
          >
            <DatePicker
              onChange={changeData}
              className='w-100'
              disabledDate={(current) => moment().add(-1, 'days') <= current}
            />
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

        <Col span={12} hidden={process.env.REACT_APP_IS_DEMO === 'true'}>
          <Form.Item
            label={t('email')}
            name='email'
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
            validateStatus={error?.password_confirmation ? 'error' : 'success'}
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
                  return Promise.reject(t('passwords.do.not.match'));
                },
              }),
            ]}
          >
            <Input type='password' className='w-100' />
          </Form.Item>
        </Col>

        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('save')}
        </Button>
      </Row>
    </Form>
  );
}
