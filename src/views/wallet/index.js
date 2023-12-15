import React, { useEffect } from 'react';
import { Card, Table } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import formatSortType from '../../helpers/formatSortType';
import useDidUpdate from '../../helpers/useDidUpdate';
import numberToPrice from '../../helpers/numberToPrice';
import { fetchWallets } from '../../redux/slices/wallet';
import SearchInput from '../../components/search-input';

export default function Wallets() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { wallets, loading, meta, params } = useSelector(
    (state) => state.wallet,
    shallowEqual
  );
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
      title: t('firstname'),
      dataIndex: 'firstname',
      key: 'firstname',
    },
    {
      title: t('lastname'),
      dataIndex: 'lastname',
      key: 'lastname',
    },
    {
      title: t('wallet'),
      dataIndex: 'wallet',
      key: 'wallet',
      render: (wallet) => numberToPrice(wallet?.price, defaultCurrency.symbol),
    },
    {
      title: t('phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
    },
  ];

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({ activeMenu, data: { perPage, page, column, sort } })
    );
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchWallets());
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
      search: data?.search,
    };
    dispatch(fetchWallets(paramsData));
  }, [activeMenu.data]);

  const handleFilter = (item, name) => {
    const data = activeMenu.data;
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...data, [name]: item },
      })
    );
  };

  return (
    <Card
      title={t('wallets')}
      extra={
        <SearchInput
          placeholder={t('search')}
          handleChange={(search) => handleFilter(search, 'search')}
        />
      }
    >
      <Table
        columns={columns}
        dataSource={wallets}
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
