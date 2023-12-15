import React, { useEffect, useState } from 'react';
import { Card, Form, Tabs } from 'antd';
import { useParams } from 'react-router-dom';
import * as moment from 'moment';
import userService from '../../services/user';
import Loading from '../../components/loading';
import UserEditForm from './userEditForm';
import UserAddress from './userAddress';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import UserOrders from './userOrders';
import WalletHistory from './walletHistory';
import createImage from '../../helpers/createImage';
const { TabPane } = Tabs;

const UserEdit = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('edit');
  const [image, setImage] = useState(activeMenu?.data?.image || null);

  const showUserData = (uuid) => {
    setLoading(true);
    userService
      .getById(uuid)
      .then((res) => {
        const data = res.data;
        const payload = {
          ...data,
          image: createImage(data.img),
        };
        dispatch(setMenuData({ activeMenu, data: payload }));
        form.setFieldsValue({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          phone: data.phone,
          birthday: moment(data.birthday),
          gender: data.gender,
          password_confirmation: data.password_confirmation,
          password: data.password,
          image: createImage(data.img),
        });
        setImage(createImage(data.img));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

  useEffect(() => {
    if (activeMenu?.refetch) {
      showUserData(uuid);
    }
  }, [activeMenu?.refetch]);

  const onChange = (key) => {
    setTab(key);
  };

  return (
    <Card title={t('user.settings')}>
      {!loading ? (
        <Tabs activeKey={tab} onChange={onChange}>
          <TabPane key='edit' tab={t('edit.user')}>
            <UserEditForm
              data={activeMenu?.data}
              form={form}
              image={image}
              setImage={setImage}
            />
          </TabPane>
          <TabPane key='address' tab={t('address')}>
            <UserAddress data={activeMenu?.data} />
          </TabPane>
          <TabPane key='order' tab={t('orders')}>
            <UserOrders data={activeMenu?.data} />
          </TabPane>
          <TabPane key='wallet' tab={t('wallet')}>
            <WalletHistory data={activeMenu?.data} />
          </TabPane>
        </Tabs>
      ) : (
        <Loading />
      )}
    </Card>
  );
};

export default UserEdit;
