import { EditOutlined } from '@ant-design/icons';
import { Button, Card, Space, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch } from '../../redux/slices/menu';
import CountryService from '../../services/delivery-of-country';
import CashbackEditModal from './edit';

export default function DeliveryOfCountry() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [cashbackId, setCashbackId] = useState(null);
  const [data, setData] = useState([]);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const getDeliveryCountry = () => {
    CountryService.get()
      .then(({ data }) => {
        setData(data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        dispatch(disableRefetch(activeMenu));
      });
  };
  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('country'),
      dataIndex: 'country',
      key: 'country',
      render: (data, row) => <>{data.translation?.title}</>,
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: t('options'),
      key: 'options',
      dataIndex: 'options',
      render: (data, row) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => setCashbackId(row.id)}
          />
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (activeMenu.refetch) {
      getDeliveryCountry();
    }
  }, [activeMenu.refetch]);
  return (
    <Card title={t('delivery_of_country')}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => record.id}
      />
      {cashbackId && (
        <CashbackEditModal
          visibility={cashbackId}
          handleCancel={() => setCashbackId(null)}
        />
      )}
    </Card>
  );
}
