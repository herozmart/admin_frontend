import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Image, Space, Switch, Table } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import GlobalContainer from '../../../components/global-container';
import CustomModal from '../../../components/modal';
import { Context } from '../../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../../redux/slices/menu';
import lookService from '../../../services/seller/look';
import { fetchLooks } from '../../../redux/slices/look';
import getImage from '../../../helpers/getImage';
import DeleteButton from '../../../components/delete-button';

export default function SellerLooks() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `seller/looks/${row.id}`,
        id: 'look_edit',
        name: t('edit.look'),
      })
    );
    navigate(`/seller/looks/${row.id}`);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('title'),
      dataIndex: 'translation',
      key: 'translation',
      render: (translation) => translation?.title,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      render: (img) => {
        return (
          <Image
            src={getImage(img)}
            alt='img_gallery'
            width={100}
            className='rounded'
            preview
            placeholder
          />
        );
      },
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => {
        return (
          <Switch
            key={row.id + active}
            onChange={() => {
              setIsModalVisible(true);
              setActiveId(row.id);
              setType(true);
            }}
            checked={active}
          />
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
      dataIndex: 'options',
      render: (data, row) => (
        <Space>
          <Button
            type='primary'
            icon={<EditOutlined />}
            onClick={() => goToEdit(row)}
          />
          <DeleteButton
            icon={<DeleteOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setId(row.id);
              setType(false);
            }}
          />
        </Space>
      ),
    },
  ];
  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [type, setType] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { looks, meta, loading } = useSelector(
    (state) => state.look,
    shallowEqual
  );

  const lookDelete = () => {
    setLoadingBtn(true);
    lookService
      .delete(id)
      .then(() => {
        dispatch(fetchLooks());
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    lookService
      .setActive(activeId)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchLooks());
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchLooks());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchLooks({ perPage: pageSize, page: current }));
  };

  return (
    <GlobalContainer
      headerTitle={t('looks')}
      navLInkTo={'/seller/looks/add'}
      buttonTitle={t('add.look')}
    >
      <Table
        columns={columns}
        dataSource={looks}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.id}
        loading={loading}
        onChange={onChangePagination}
      />
      <CustomModal
        click={type ? handleActive : lookDelete}
        text={type ? t('set.active.look') : t('delete.look')}
        loading={loadingBtn}
      />
    </GlobalContainer>
  );
}
