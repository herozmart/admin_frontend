import React, { useContext, useEffect, useState } from 'react';
import { Button, Image, Space, Switch, Table } from 'antd';
import { IMG_URL } from '../../configs/app-global';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import GlobalContainer from '../../components/global-container';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import bannerService from '../../services/banner';
import { fetchBanners } from '../../redux/slices/banner';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const Banners = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `banner/${row.id}`,
        id: 'banner_edit',
        name: t('edit.banner'),
      })
    );
    navigate(`/banner/${row.id}`);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      render: (img) => {
        return (
          <Image
            src={img ? IMG_URL + img : 'https://via.placeholder.com/150'}
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
          <Button
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
  const { banners, meta, loading } = useSelector(
    (state) => state.banner,
    shallowEqual
  );

  const bannerDelete = () => {
    setLoadingBtn(true);
    bannerService
      .delete(id)
      .then(() => {
        dispatch(fetchBanners());
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    bannerService
      .setActive(activeId)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchBanners());
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchBanners());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchBanners({ perPage: pageSize, page: current }));
  };

  return (
    <GlobalContainer
      headerTitle={t('banners')}
      navLInkTo={'/banner/add'}
      buttonTitle={t('add.banner')}
    >
      <Table
        columns={columns}
        dataSource={banners}
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
        click={type ? handleActive : bannerDelete}
        text={type ? t('set.active.banner') : t('delete.banner')}
        loading={loadingBtn}
      />
    </GlobalContainer>
  );
};

export default Banners;
