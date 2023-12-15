import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Space, Switch, Table } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import numberToPrice from '../../helpers/numberToPrice';
import { disableRefetch } from '../../redux/slices/menu';
import { fetchPoints } from '../../redux/slices/point';
import pointService from '../../services/points';
import CashbackEditModal from './cashbackEditModal';
import CashbackModal from './cashbackModal';

export default function Cashback() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [type, setType] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [modal, setModal] = useState(false);
  const [cashbackId, setCashbackId] = useState(null);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('cashback'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price} %`,
    },
    {
      title: t('min.amount'),
      dataIndex: 'value',
      key: 'value',
      render: (value) => numberToPrice(value, defaultCurrency?.symbol),
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => {
        return (
          <Switch
            key={row.id + active}
            onChange={() => {
              setIsModalVisible(true);
              setActiveId(row.id);
              setType(true);
            }}
            checked={active}
          />
        );
      },
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
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
          <Button
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setId(row.id);
              setType(false);
            }}
          />
        </Space>
      ),
    },
  ];

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { points, meta, loading } = useSelector(
    (state) => state.point,
    shallowEqual
  );

  const pointDelete = () => {
    setLoadingBtn(true);
    pointService
      .delete(id)
      .then(() => {
        dispatch(fetchPoints());
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    pointService
      .setActive(activeId)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchPoints());
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchPoints());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchPoints({ perPage: pageSize, page: current }));
  };
  return (
    <Card
      title={t('cashback')}
      extra={
        <Button type='primary' onClick={() => setModal(true)}>
          {t('add.cashback')}
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={points}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.id}
        loading={loading}
        onChange={onChangePagination}
      />
      <CustomModal
        click={type ? handleActive : pointDelete}
        text={type ? t('set.active.banner') : t('delete.banner')}
        loading={loadingBtn}
      />
      {modal && (
        <CashbackModal
          visibility={modal}
          handleCancel={() => setModal(false)}
        />
      )}
      {cashbackId && (
        <CashbackEditModal
          visibility={cashbackId}
          handleCancel={() => setCashbackId(null)}
        />
      )}
    </Card>
  );
}
