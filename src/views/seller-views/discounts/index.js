import React, { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Image, Space, Switch, Table } from 'antd';
import { toast } from 'react-toastify';
import GlobalContainer from '../../../components/global-container';
import CustomModal from '../../../components/modal';
import { Context } from '../../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  addMenu,
  disableRefetch,
  setMenuData,
} from '../../../redux/slices/menu';
import discountService from '../../../services/seller/discount';
import { fetchDiscounts } from '../../../redux/slices/discount';
import useDidUpdate from '../../../helpers/useDidUpdate';
import formatSortType from '../../../helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import getImage from '../../../helpers/getImage';

export default function SellerDiscounts() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `discount/${row.id}`,
        id: 'discount_edit',
        name: t('edit.discount'),
      })
    );
    navigate(`/discount/${row.id}`);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      render: (img, row) => (
        <Image
          src={getImage(img)}
          alt={row.type}
          width={100}
          className='rounded'
          preview
          placeholder
        />
      ),
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: t('start.date'),
      dataIndex: 'start',
      key: 'start',
    },
    {
      title: t('end.date'),
      dataIndex: 'end',
      key: 'end',
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => (
        <Switch
          checked={active}
          onChange={() => {
            setId(row.id);
            setIsDelete(false);
            setIsModalVisible(true);
          }}
        />
      ),
    },
    {
      title: t('options'),
      key: 'options',
      dataIndex: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                setId(row.id);
                setIsDelete(true);
                setIsModalVisible(true);
              }}
            />
          </Space>
        );
      },
    },
  ];

  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { discounts, meta, loading, params } = useSelector(
    (state) => state.discount,
    shallowEqual
  );

  const discountDelete = () => {
    setLoadingBtn(true);
    discountService
      .delete(id)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchDiscounts());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const discountSetActive = () => {
    setLoadingBtn(true);
    discountService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(fetchDiscounts());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchDiscounts());
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
    dispatch(fetchDiscounts(paramsData));
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
    <GlobalContainer
      headerTitle={t('discounts')}
      navLInkTo={'/discount/add'}
      buttonTitle={t('add.discount')}
    >
      <Table
        columns={columns}
        dataSource={discounts}
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
      <CustomModal
        click={isDelete ? discountDelete : discountSetActive}
        text={isDelete ? t('delete.discount') : t('set.active.discount')}
        loading={loadingBtn}
      />
    </GlobalContainer>
  );
}
