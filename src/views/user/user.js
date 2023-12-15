import React, { useEffect, useState } from 'react';
import {
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Table, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FaUserCog } from 'react-icons/fa';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import formatSortType from '../../helpers/formatSortType';
import useDidUpdate from '../../helpers/useDidUpdate';
import UserShowModal from './userShowModal';
import UserRoleModal from './userRoleModal';
import { fetchClients } from '../../redux/slices/client';
import SearchInput from '../../components/search-input';
import moment from 'moment';

const User = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { clients, loading, meta, params } = useSelector(
    (state) => state.client,
    shallowEqual
  );

  const [uuid, setUuid] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `user/${row.uuid}`,
        id: 'user_edit',
        name: t('edit.user'),
      })
    );
    navigate(`/user/${row.uuid}`);
  };

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
      title: t('email'),
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <div>{process.env.REACT_APP_IS_DEMO === 'true' ? '' : email}</div>
      ),
    },
    {
      title: t('phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone,
    },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: t('registered_at'),
      dataIndex: 'registered_at',
      key: 'registered_at',
      render: (data, row) => moment(data).format('MMM Do YY'),
    },
    {
      title: t('options'),
      dataIndex: 'options',
      key: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => setUuid(row.uuid)} />
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
            <Tooltip title={t('change.user.role')}>
              <Button onClick={() => setUserRole(row)} icon={<FaUserCog />} />
            </Tooltip>
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
      setMenuData({ activeMenu, data: { perPage, page, column, sort } })
    );
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchClients());
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
    dispatch(fetchClients(paramsData));
  }, [activeMenu.data]);

  const goToAddClient = () => {
    dispatch(
      addMenu({
        id: 'user-add',
        url: 'user/add',
        name: t('add.client'),
      })
    );
    navigate('/user/add');
  };

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
      title={t('clients')}
      extra={
        <Space>
          <SearchInput
            placeholder={t('search')}
            handleChange={(search) => handleFilter(search, 'search')}
          />
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddClient}
          >
            {t('add.client')}
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={clients}
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

      {uuid && <UserShowModal uuid={uuid} handleCancel={() => setUuid(null)} />}
      {userRole && (
        <UserRoleModal data={userRole} handleCancel={() => setUserRole(null)} />
      )}
    </Card>
  );
};

export default User;
