import React, { useEffect, useState } from 'react';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Card, Table, Tag } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../../redux/slices/menu';
import useDidUpdate from '../../../helpers/useDidUpdate';
import formatSortType from '../../../helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import { fetchSellerWallets } from '../../../redux/slices/wallet';
import numberToPrice from '../../../helpers/numberToPrice';
import PayoutStatusModal from './payoutStatusModal';
import PayoutRequest from './payoutRequest';

export default function SellerPayouts() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [modal, setModal] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      render: (price) => numberToPrice(price, defaultCurrency.symbol),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <div>
          {status === 'processed' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'rejected' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
          {status === 'processed' ? (
            <EditOutlined onClick={() => setModal(row)} />
          ) : (
            ''
          )}
        </div>
      ),
    },
    {
      title: t('note'),
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ];

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { wallets, meta, loading, params } = useSelector(
    (state) => state.wallet,
    shallowEqual
  );

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSellerWallets());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    const data = activeMenu.data;
    const paramsData = {
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
    };
    dispatch(fetchSellerWallets(paramsData));
  }, [activeMenu.data]);

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({ activeMenu, data: { perPage, page, column, sort } })
    );
  }

  return (
    <Card
      title={t('payouts')}
      extra={
        <Button
          type='primary'
          icon={<PlusCircleOutlined />}
          onClick={() => setWithdrawModal(true)}
        >
          {t('withdraw')}
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={wallets}
        pagination={{
          pageSize: params.perPage,
          page: params.page,
          total: meta.total,
          defaultCurrent: params.page,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
      {modal && (
        <PayoutStatusModal data={modal} handleCancel={() => setModal(null)} />
      )}
      {withdrawModal && (
        <PayoutRequest
          data={withdrawModal}
          handleCancel={() => setWithdrawModal(false)}
        />
      )}
    </Card>
  );
}
