import React, { useContext, useEffect, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Image, Space, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IMG_URL } from '../../configs/app-global';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import shopService from '../../services/shop';
import { fetchShops } from '../../redux/slices/shop';
import { useTranslation } from 'react-i18next';
import ShopStatusModal from './shop-status-modal';
import DeleteButton from '../../components/delete-button';

const Shops = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [shopStatus, setShopStatus] = useState(null);
  const { user } = useSelector((state) => state.auth, shallowEqual);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        id: 'edit-shop',
        url: `shop/${row.uuid}`,
        name: t('edit.shop'),
      })
    );
    navigate(`/shop/${row.uuid}`);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
    },
    {
      title: t('title'),
      dataIndex: 'name',
    },
    {
      title: t('logo'),
      dataIndex: 'logo_img',
      render: (img) => {
        return (
          <Image
            alt='images'
            className='img rounded'
            src={img ? IMG_URL + img : 'https://via.placeholder.com/150'}
            effect='blur'
            width={50}
            height={50}
            preview
            placeholder
          />
        );
      },
    },
    {
      title: t('background'),
      dataIndex: 'back',
      render: (img) => {
        return (
          <Image
            alt={'images background'}
            className='img rounded'
            src={img ? IMG_URL + img : 'https://via.placeholder.com/150'}
            effect='blur'
            width={50}
            height={50}
            preview
            placeholder
          />
        );
      },
    },
    {
      title: t('seller'),
      dataIndex: 'seller',
    },
    {
      title: t('open_close.time'),
      dataIndex: 'open',
    },
    {
      title: t('tax'),
      dataIndex: 'tax',
      render: (tax) => `${tax} %`,
    },
    {
      title: t('status'),
      dataIndex: 'status',
      render: (status, row) => (
        <div>
          {status === 'new' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'rejected' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
          <EditOutlined onClick={() => setShopStatus(row)} />
        </div>
      ),
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
            {user?.role !== 'manager' ? (
              <DeleteButton
                icon={<DeleteOutlined />}
                onClick={() => {
                  setId(row.uuid);
                  setIsModalVisible(true);
                }}
              />
            ) : (
              ''
            )}
          </Space>
        );
      },
    },
  ];
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { shops, meta, loading, params } = useSelector(
    (state) => state.shop,
    shallowEqual
  );

  const shopDelete = () => {
    shopService.delete(id).then(() => {
      toast.success(t('successfully.deleted'));
      setIsModalVisible(false);
      dispatch(fetchShops(params));
    });
  };

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchShops({ perPage: pageSize, page: current }));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchShops(params));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add-shop',
        url: `shop/add`,
        name: t('add.shop'),
      })
    );
    navigate(`/shop/add`);
  };
  return (
    <Card
      title={t('shops')}
      extra={
        <Space>
          <Button
            icon={<PlusCircleOutlined />}
            type='primary'
            onClick={goToAdd}
          >
            {t('add.shop')}
          </Button>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={shops}
        loading={loading}
        pagination={{
          pageSize: params.perPage,
          page: params.page,
          total: meta.total,
          defaultCurrent: params.page,
        }}
        rowKey={(record) => record.uuid}
        onChange={onChangePagination}
      />
      {shopStatus && (
        <ShopStatusModal
          data={shopStatus}
          handleCancel={() => setShopStatus(null)}
        />
      )}
      <CustomModal click={shopDelete} text={t('delete.shop')} />
    </Card>
  );
};

export default Shops;
