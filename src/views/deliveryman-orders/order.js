import React, { useEffect } from 'react';
import { Button, Space, Table, Card, Tabs, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from '../../helpers/useDidUpdate';
import { fetchDeliverymanOrders } from '../../redux/slices/orders';
import formatSortType from '../../helpers/formatSortType';
import SearchInput from '../../components/search-input';
import numberToPrice from '../../helpers/numberToPrice';
export const allStatuses = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'ready', label: 'Ready' },
  { id: 'on_a_way', label: 'On the way' },
  { id: 'delivered', label: 'Delivered to customer' },
  { id: 'canceled', label: 'Canceled' },
];
const { TabPane } = Tabs;

export default function DeliverymanOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );

  const goToShow = (row) => {
    dispatch(
      addMenu({
        url: `deliveryman/order/details/${row.id}`,
        id: 'order_details',
        name: t('order.details'),
      })
    );
    navigate(`/deliveryman/order/details/${row.id}`);
  };

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
      render: (user) => (
        <div>
          {user.firstname} {user.lastname}
        </div>
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
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <div>
          {status === 'new' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'canceled' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
        </div>
      ),
    },
    {
      title: t('amount'),
      dataIndex: 'details',
      key: 'price',
      render: (details, row) => {
        const item = details[0];
        const totalPrice = item.price + item.tax + item.delivery_fee;
        return numberToPrice(totalPrice, defaultCurrency.symbol);
      },
    },
    {
      title: t('payment.type'),
      dataIndex: 'transaction',
      key: 'transaction',
      render: (transaction) => t(transaction?.payment_system?.tag) || '-',
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
          </Space>
        );
      },
    },
  ];

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { orders, meta, loading, params } = useSelector(
    (state) => state.orders,
    shallowEqual
  );
  const data = activeMenu?.data;

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
    dispatch(fetchDeliverymanOrders(paramsData));
  }, [activeMenu?.data]);

  useEffect(() => {
    if (activeMenu?.refetch) {
      const params = {
        status: data?.status === 'all' ? null : data?.status,
      };
      dispatch(fetchDeliverymanOrders(params));
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
        </Space>
      }
    >
      <Tabs
        onChange={onChangeTab}
        type='card'
        activeKey={data?.status || 'all'}
      >
        {allStatuses.map((item) => (
          <TabPane tab={t(item.id)} key={item.id} />
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
      />
    </Card>
  );
}
