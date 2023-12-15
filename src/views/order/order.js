import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Card, Tabs, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CloudDownloadOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from '../../helpers/useDidUpdate';
import { fetchOrders } from '../../redux/slices/orders';
import formatSortType from '../../helpers/formatSortType';
import SearchInput from '../../components/search-input';
import { clearOrder } from '../../redux/slices/order';
import numberToPrice from '../../helpers/numberToPrice';
import { DebounceSelect } from '../../components/search';
import userService from '../../services/user';
import exportService from '../../services/export';

const { TabPane } = Tabs;

export default function Order() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const [downloading, setDownloading] = useState(null);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { orders, meta, loading, params } = useSelector(
    (state) => state.orders,
    shallowEqual
  );
  const data = activeMenu?.data;

  const allStatuses = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'ready', label: 'Ready' },
    { id: 'on_a_way', label: 'On the way' },
    {
      id: 'delivered',
      label: 'Delivered to customer',
    },
    { id: 'canceled', label: 'Canceled' },
  ];

  const goToEdit = (row) => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        url: `order/${row.id}`,
        id: 'order_edit',
        name: t('edit.order'),
      })
    );
    navigate(`/order/${row.id}`);
  };

  const goToShow = (row) => {
    dispatch(
      addMenu({
        url: `order/details/${row.id}`,
        id: 'order_details',
        name: t('order.details'),
      })
    );
    navigate(`/order/details/${row.id}`);
  };

  const handleDownload = (pdfUrl) => {
    const link = document.createElement('a');
    link.href = `https://api.goshops.org/storage/${pdfUrl}`;
    link.target = '_blank';
    link.download = 'download.pdf';
    link.click();
  };

  function getInvoiceFile(id) {
    setDownloading(id);
    exportService
      .orderExport(id)
      .then(({ data }) => {
        handleDownload(data.filepath);
      })
      .finally(() => setDownloading(null));
  }
  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('client'),
      dataIndex: 'user',
      key: 'user',
      render: (user) =>
        user ? (
          <div>
            {user?.firstname} {user?.lastname}
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: t('number.of.products'),
      dataIndex: 'details',
      key: 'rate',
      render: (details) => (
        <div className='text-lowercase'>
          {details.reduce(
            (total, item) => (total += item.order_stocks.length),
            0
          )}{' '}
          {t('products')}
        </div>
      ),
    },
    {
      title: t('amount'),
      dataIndex: 'price',
      key: 'price',
      render: (price, row) => numberToPrice(price, defaultCurrency.symbol),
    },
    {
      title: t('cashback'),
      dataIndex: 'cash_back',
      key: 'cash_back',
      render: (cash_back, row) =>
        numberToPrice(cash_back, defaultCurrency.symbol),
    },
    {
      title: t('payment.type'),
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) => t(transaction?.payment_system?.tag) || '-',
    },
    {
      title: t('transaction.status'),
      dataIndex: 'transaction',
      key: 'transaction',
      render: (_, data) => {
        const status = data?.transaction?.status;
        return (
          <div>
            {status === 'progress' ? (
              <Tag color='gold'>{t(status) || '-'}</Tag>
            ) : status === 'canceled' ? (
              <Tag color='error'>{t(status) || '-'}</Tag>
            ) : (
              <Tag color='cyan'>{t(status) || '-'}</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <Space>
          {status == 'new' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status == 'canceled' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: t('options'),
      key: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => goToShow(row)} />

            {/* <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
              disabled={
                row.status === 'delivered' ||
                row.status === 'canceled' ||
                row.status === 'on_a_way'
              }
            /> */}
            <Button
              icon={<DownloadOutlined />}
              loading={downloading === row.id}
              onClick={() => getInvoiceFile(row.id)}
            />
          </Space>
        );
      },
    },
  ];

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, perPage, page, column, sort },
      })
    );
  }

  useDidUpdate(() => {
    const paramsData = {
      search: data?.search,
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
      user_id: data?.userId,
      status: data?.status === 'all' ? null : data?.status,
    };
    dispatch(fetchOrders(paramsData));
  }, [activeMenu?.data]);

  useEffect(() => {
    if (activeMenu?.refetch) {
      const params = {
        status: data?.status === 'all' ? null : data?.status,
      };
      dispatch(fetchOrders(params));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu?.refetch]);

  const handleFilter = (item, name) => {
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, [name]: item },
      })
    );
  };
  async function getUsers(search) {
    const params = {
      search,
      perPage: 10,
    };
    return userService.search(params).then(({ data }) => {
      return data.map((item) => ({
        label: `${item.firstname} ${item.lastname}`,
        value: item.id,
      }));
    });
  }

  const goToAddProduct = () => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        id: 'order-add',
        url: 'pos-system',
        name: t('add.order'),
      })
    );
    navigate('/pos-system');
  };

  const onChangeTab = (status) => {
    dispatch(setMenuData({ activeMenu, data: { status } }));
  };

  return (
    <Card
      title={t('orders')}
      extra={
        <Space>
          <SearchInput
            placeholder={t('search')}
            handleChange={(search) => handleFilter(search, 'search')}
          />
          <DebounceSelect
            placeholder={t('select.client')}
            fetchOptions={getUsers}
            onSelect={(user) => handleFilter(user.value, 'userId')}
            onDeselect={() => handleFilter(null, 'userId')}
            style={{ minWidth: 200 }}
          />
          {/* <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddProduct}
          >
            {t('add.order')}
          </Button> */}
        </Space>
      }
    >
      <Tabs
        onChange={onChangeTab}
        type='card'
        activeKey={data?.status || 'all'}
      >
        {allStatuses.map((item) => (
          <TabPane tab={t(item.label)} key={item.id} />
        ))}
      </Tabs>
      <Table
        columns={columns}
        dataSource={orders}
        loading={loading}
        pagination={{
          pageSize: params.perPage,
          page: params.page,
          total: meta.total,
          defaultCurrent: params.page,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        scroll={{ x: 1440 }}
      />
    </Card>
  );
}
