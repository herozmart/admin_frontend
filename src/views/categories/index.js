import React, { useContext, useEffect, useState } from 'react';
import '../../assets/scss/components/product-categories.scss';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Button, Card, Image, Space, Table, Tag } from 'antd';
import { export_url, IMG_URL } from '../../configs/app-global';
import { Context } from '../../context/context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import GlobalContainer from '../../components/global-container';
import CustomModal from '../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import categoryService from '../../services/category';
import { fetchCategories } from '../../redux/slices/category';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../components/delete-button';

const Categories = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `category/${row.uuid}`,
        id: 'category_edit',
        name: t('edit.category'),
      })
    );
    navigate(`/category/${row.uuid}`);
  };

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        id: 'category-add',
        url: 'category/add',
        name: t('add.category'),
      })
    );
    navigate('/category/add');
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        url: `catalog/categories/import`,
        id: 'category_import',
        name: t('import.category'),
      })
    );
    navigate(`/catalog/categories/import`);
  };

  const columns = [
    {
      title: t('name'),
      dataIndex: 'name',
      width: '25%',
      key: 'name',
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
            className='rounded'
            preview
            placeholder
            key={img + row.id}
          />
        );
      },
    },
    {
      title: t('status'),
      dataIndex: 'active',
      key: 'active',
      render: (active, row) =>
        active ? (
          <Tag color='cyan'> {t('active')}</Tag>
        ) : (
          <Tag color='yellow'>{t('inactive')}</Tag>
        ),
    },
    {
      title: t('child.categories'),
      dataIndex: 'children',
      key: 'children',
      render: (children) => children?.length,
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
                setId(row.uuid);
                setType(false);
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
  const [alias, setAlias] = useState(false);
  const [type, setType] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { categories, meta, loading } = useSelector(
    (state) => state.category,
    shallowEqual
  );

  const categoryDelete = () => {
    setLoadingBtn(true);
    categoryService
      .delete(id)
      .then(() => {
        dispatch(fetchCategories({}));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const handleActive = () => {
    setLoadingBtn(true);
    categoryService
      .setActive(alias)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchCategories({}));
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchCategories({}));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchCategories({ perPage: pageSize, page: current }));
  };

  const excelExport = () => {
    setDownloading(true);
    categoryService
      .export()
      .then((res) => {
        const body = export_url + res.data.file_name;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
  };

  console.log('categories', categories);

  return (
    <Card
      title={t('categories')}
      extra={
        <Space>
          <Button
            type='primary'
            icon={<PlusCircleOutlined />}
            onClick={goToAddCategory}
          >
            {t('add.category')}
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
        dataSource={categories}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.key}
        onChange={onChangePagination}
        loading={loading}
      />
      <CustomModal
        click={type ? handleActive : categoryDelete}
        text={type ? t('set.active.category') : t('delete.category')}
        loading={loadingBtn}
      />
    </Card>
  );
};

export default Categories;
