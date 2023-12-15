import React, { useContext, useEffect, useState } from 'react';
import '../../assets/scss/components/product-categories.scss';
import { EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Table, Space, Card, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import unitService from '../../services/unit';
import { fetchUnits } from '../../redux/slices/unit';
import { useTranslation } from 'react-i18next';

export default function Units() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uuid, setUUID] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const { setIsModalVisible } = useContext(Context);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        id: 'unit-edit',
        url: `unit/${row.id}`,
        name: t('edit.unit'),
      })
    );
    navigate(`/unit/${row.id}`);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('name'),
      dataIndex: 'translation',
      render: (translation) => translation?.title,
    },
    {
      title: t('position'),
      dataIndex: 'position',
    },
    {
      title: t('active'),
      dataIndex: 'active',
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setUUID(row.id);
            }}
            checked={active}
          />
        );
      },
    },
    {
      title: t('options'),
      dataIndex: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
          </Space>
        );
      },
    },
  ];

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { units, meta, loading, params } = useSelector(
    (state) => state.unit,
    shallowEqual
  );

  function formatSortType(type) {
    switch (type) {
      case 'ascend':
        return 'asc';

      case 'descend':
        return 'desc';

      default:
        break;
    }
  }

  const handleActive = () => {
    setLoadingBtn(true);
    unitService
      .setActive(uuid)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchUnits(params));
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  function onChange(pagination, filters, sorter, extra) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(fetchUnits({ ...params, perPage, page, column, sort }));
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchUnits());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const goToAddUnit = () => {
    dispatch(
      addMenu({
        id: 'unit-add',
        url: 'unit/add',
        name: t('add.unit'),
      })
    );
    navigate('/unit/add');
  };

  return (
    <Card
      title={t('units')}
      extra={
        <Space>
          <Button
            type='primary'
            onClick={goToAddUnit}
            icon={<PlusCircleOutlined />}
          >
            {t('add.unit')}
          </Button>
        </Space>
      }
    >
      <Table
        loading={loading}
        columns={columns}
        dataSource={units}
        pagination={{
          pageSize: params.perPage,
          page: params.page,
          total: meta.total,
          defaultCurrent: params.page,
        }}
        onChange={onChange}
        rowKey={(record) => record.id}
      />
      <CustomModal
        click={handleActive}
        text={t('set.active.unit')}
        loading={loadingBtn}
      />
    </Card>
  );
}
