import React, { useContext, useEffect, useState } from 'react';
import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Space, Table, Tabs, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FaUserCog } from 'react-icons/fa';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../redux/slices/user';
import formatSortType from '../../helpers/formatSortType';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import useDidUpdate from '../../helpers/useDidUpdate';
import UserShowModal from './userShowModal';
import { useTranslation } from 'react-i18next';
import UserRoleModal from './userRoleModal';
import SearchInput from '../../components/search-input';
import userService from '../../services/user';
import { toast } from 'react-toastify';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
const { TabPane } = Tabs;

const roles = ['all', 'seller', 'moderator', 'manager', 'deliveryman', 'admin'];

export default function Admin() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { users, loading, meta, params } = useSelector(
    (state) => state.user,
    shallowEqual
  );
  const { user } = useSelector((state) => state.auth, shallowEqual);

  const { setIsModalVisible } = useContext(Context);

  const [uuid, setUuid] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const data = activeMenu.data;
  const paramsData = {
    sort: data?.sort,
    column: data?.column,
    role: data?.role === 'all' ? null : data?.role,
    perPage: data?.perPage,
    page: data?.page,
    search: data?.search,
  };
  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `user/${row.uuid}`,
        id: 'user_edit',
        name: 'User edit',
      })
    );
    navigate(`/user/${row.uuid}`);
  };

  const userDelete = () => {
    const data = activeMenu.data;

    setLoadingBtn(true);
    userService
      .delete(id)
      .then(() => {
        toast.success(t('successfully.deleted'));
        const params = {
          sort: data?.sort,
          column: data?.column,
          role: data?.role || 'seller',
          perPage: data?.perPage,
          page: data?.page,
          search: data?.search,
        };
        dispatch(fetchUsers(params));
        setIsModalVisible(false);
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
      sorter: true,
    },
    {
      title: t('firstname'),
      dataIndex: 'firstname',
    },
    {
      title: t('lastname'),
      dataIndex: 'lastname',
    },
    {
      title: t('email'),
      dataIndex: 'email',
      render: (email) => (
        <div>{process.env.REACT_APP_IS_DEMO === 'true' ? '' : email}</div>
      ),
    },
    {
      title: t('phone'),
      dataIndex: 'phone',
      render: (phone) => phone,
    },
    {
      title: t('role'),
      dataIndex: 'role',
    },
    {
      title: t('options'),
      dataIndex: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => setUuid(row.uuid)} />
            {row.role !== 'moderator' ? (
              <>
                <Tooltip title={t('change.user.role')}>
                  <Button
                    disabled={row.email === user.email}
                    onClick={() => setUserRole(row)}
                    icon={<FaUserCog />}
                  />
                </Tooltip>
                <Button
                  type='primary'
                  icon={<EditOutlined />}
                  onClick={() => goToEdit(row)}
                />
                <Button
                  type='danger'
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setId(row.uuid);
                    setIsModalVisible(true);
                  }}
                />
              </>
            ) : (
              ''
            )}
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
        data: { ...activeMenu.data, perPage, page, column, sort },
      })
    );
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchUsers(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    dispatch(fetchUsers(paramsData));
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
      title={t('users')}
      extra={
        <SearchInput
          placeholder={t('search')}
          handleChange={(search) => handleFilter(search, 'search')}
        />
      }
    >
      <Tabs
        activeKey={activeMenu.data?.role || 'all'}
        onChange={(key) => handleFilter(key, 'role')}
        type='card'
      >
        {roles.map((item) => (
          <TabPane tab={t(item)} key={item} />
        ))}
      </Tabs>
      <Table
        columns={columns}
        dataSource={users}
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
      <CustomModal
        click={userDelete}
        text={t('delete.user')}
        loading={loadingBtn}
      />
    </Card>
  );
}
