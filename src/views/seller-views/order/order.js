import React, { useEffect } from 'react';
import { Button, Space, Table, Card, Tabs, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addMenu,
  disableRefetch,
  setMenuData,
} from '../../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import useDidUpdate from '../../../helpers/useDidUpdate';
import { fetchSellerOrders } from '../../../redux/slices/orders';
import formatSortType from '../../../helpers/formatSortType';
import SearchInput from '../../../components/search-input';
import { clearOrder } from '../../../redux/slices/order';
import numberToPrice from '../../../helpers/numberToPrice';
import { DebounceSelect } from '../../../components/search';
import userService from '../../../services/seller/user';
import { allStatuses } from '../../../constants/OrderStatus';

const { TabPane } = Tabs;

const statuses = ['open', 'completed', 'canceled'];

export default function SellerOrder() {
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
        url: `seller/order/details/${row.id}`,
        id: 'order_details',
        name: t('order.details'),
      })
    );
    navigate(`/seller/order/details/${row.id}`);
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
      render: (user) =>
        user ? (
          <div>
            {user.firstname} {user.lastname}
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
      render: (_, row) => {
        const status = row.details?.[0]?.status;
        return (
          <Space>
            {status == 'new' ? (
              <Tag color='blue'>
                {t(allStatuses.find((item) => item.id == status)?.label)}
              </Tag>
            ) : status == 'canceled' ? (
              <Tag color='error'>
                {t(allStatuses.find((item) => item.id == status)?.label)}
              </Tag>
            ) : (
              <Tag color='cyan'>
                {t(allStatuses.find((item) => item.id == status)?.label)}
              </Tag>
            )}
          </Space>
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
      status: data?.status || 'new',
    };

    dispatch(fetchSellerOrders(paramsData));
  }, [activeMenu?.data]);

  useEffect(() => {
    if (activeMenu?.refetch) {
      const params = {
        status: data?.status || 'new',
      };
      dispatch(fetchSellerOrders(params));
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
    return userService.getAll(params).then(({ data }) => {
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
        url: 'seller/order/add',
        name: t('add.order'),
      })
    );
    navigate('/seller/order/add');
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
      <Tabs onChange={onChangeTab} type='card' activeKey={data?.status}>
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
        scroll={{ x: 1200 }}
      />
    </Card>
  );
}
