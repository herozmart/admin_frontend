import React, { useEffect } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Space, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import GlobalContainer from '../../components/global-container';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import { fetchDeliveries } from '../../redux/slices/delivery';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'react-toastify';
import deliveryService from '../../services/delivery';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { useContext } from 'react';

export default function Delivery() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [id, setId] = useState(null);
  const { setIsModalVisible } = useContext(Context);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `delivery/${row.id}`,
        id: 'delivery_edit',
        name: t('edit.delivery'),
      })
    );
    navigate(`/delivery/${row.id}`);
  };

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { deliveries, loading } = useSelector(
    (state) => state.delivery,
    shallowEqual
  );
  const deleteDelivery = () => {
    setLoadingBtn(true);
    deliveryService
      .delete(id)
      .then(() => {
        toast.success(t('successfully.deleted'));
        setIsModalVisible(false);
        dispatch(fetchDeliveries());
      })
      .catch((error) => {
        console.log(error);
        toast.error(error?.response?.data?.message);
      })
      .finally(() => setLoadingBtn(false));
  };
  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('title'),
      dataIndex: 'translation',
      key: 'translation',
      render: (translation) => translation?.title,
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('shop.id'),
      dataIndex: 'shop_id',
      key: 'shop_id',
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: t('options'),
      key: 'options',
      render: (data, row) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => goToEdit(row)}
          />
          <Button
            type='danger'
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setId(row.id);
            }}
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchDeliveries());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  return (
    <GlobalContainer
      headerTitle={t('deliveries')}
      navLInkTo={'/deliveries/add'}
      buttonTitle={t('add.delivery')}
    >
      <Table
        columns={columns}
        dataSource={deliveries}
        loading={loading}
        rowKey={(record) => record.id}
      />
      <CustomModal
        click={deleteDelivery}
        text={t('delete.deliverytype')}
        loading={loadingBtn}
      />
    </GlobalContainer>
  );
}
