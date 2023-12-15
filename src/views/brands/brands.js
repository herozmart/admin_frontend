import React, { useContext, useEffect, useState } from 'react';
import '../../assets/scss/components/product-categories.scss';
import {DeleteOutlined, EditOutlined, PlusCircleOutlined} from '@ant-design/icons';
import {Button, Card, Image, Space, Table, Tag} from 'antd';
import { toast } from 'react-toastify';
import {export_url, IMG_URL} from '../../configs/app-global';
import GlobalContainer from '../../components/global-container';
import '../../assets/scss/components/brand.scss';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import brandService from '../../services/brand';
import { fetchBrands } from '../../redux/slices/brand';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../components/delete-button';

const Brands = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `brand/${row.id}`,
        id: 'brand_edit',
        name: t('edit.brand'),
      })
    );
    navigate(`/brand/${row.id}`);
  };

  const goToAddBrand = () => {
    dispatch(
        addMenu({
          id: 'brand/add',
          url: 'brand/add',
          name: t('add.brand'),
        })
    );
    navigate('/brand/add');
  };

  const goToImport = () => {
    dispatch(
        addMenu({
          url: `catalog/brands/import`,
          id: 'brand_import',
          name: t('import.brand'),
        })
    );
    navigate(`/catalog/brands/import`);
  };
  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      render: (img, row) => {
        return (
          <Image
            src={img ? IMG_URL + img : 'https://via.placeholder.com/150'}
            alt='img_gallery'
            width={100}
            height='auto'
            className='rounded'
            preview
            placeholder
            key={img + row.id}
          />
        );
      },
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      render: (active, row) =>
        active ? (
          <Tag color='cyan'>{t('active')}</Tag>
        ) : (
          <Tag color='yellow'>{t('inactive')}</Tag>
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
            <DeleteButton
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
  const [loadingBtn, setLoadingBtn] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { brands, meta, loading } = useSelector(
    (state) => state.brand,
    shallowEqual
  );

  const brandDelete = () => {
    setLoadingBtn(true);
    brandService
      .delete(id)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchBrands({}));
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchBrands({}));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchBrands({ perPage: pageSize, page: current }));
  };

  const excelExport = () => {
    setDownloading(true);
    brandService
        .export()
        .then((res) => {
          const body = export_url + res.data.file_name;
          window.location.href = body;
        })
        .finally(() => setDownloading(false));
  };

  return (
      <Card
          title={t('brands')}
          extra={
            <Space>
              <Button
                  type='primary'
                  icon={<PlusCircleOutlined />}
                  onClick={goToAddBrand}
              >
                {t('add.brands')}
              </Button>
              <Button onClick={excelExport} loading={downloading}>
                {t('export')}
              </Button>
              <Button onClick={goToImport}>{t('import')}</Button>
            </Space>
          }
      >
      <Table
        columns={columns}
        dataSource={brands}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
      <CustomModal
        click={brandDelete}
        text={t('delete.brand')}
        loading={loadingBtn}
      />
      </Card>
  );
};

export default Brands;
