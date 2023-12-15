import React, { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Space, Table } from 'antd';
import { toast } from 'react-toastify';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../redux/slices/menu';
import useDidUpdate from '../../helpers/useDidUpdate';
import formatSortType from '../../helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import reviewService from '../../services/review';
import { fetchOrderReviews } from '../../redux/slices/orderReview';
import OrderReviewShowModal from './orderReviewShow';

export default function OrderReviews() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('user'),
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.firstname + ' ' + user?.lastname,
    },
    {
      title: t('order'),
      dataIndex: 'reviewable_id',
      key: 'reviewable_id',
      render: (reviewable_id) => `${t('order')} #${reviewable_id}`,
    },
    {
      title: t('rating'),
      dataIndex: 'rating',
      key: 'rating',
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
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EyeOutlined />}
              onClick={() => setShow(row.id)}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                setId(row.id);
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
  const [show, setShow] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { reviews, meta, loading, params } = useSelector(
    (state) => state.orderReview,
    shallowEqual
  );

  const reviewDelete = () => {
    setLoadingBtn(true);
    reviewService
      .delete(id)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchOrderReviews());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchOrderReviews());
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
    dispatch(fetchOrderReviews(paramsData));
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
    <Card title={t('order.reviews')}>
      <Table
        columns={columns}
        dataSource={reviews}
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
        click={reviewDelete}
        text={t('delete.review')}
        loading={loadingBtn}
      />
      {show && (
        <OrderReviewShowModal id={show} handleCancel={() => setShow(null)} />
      )}
    </Card>
  );
}
