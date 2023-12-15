import React, { useContext, useEffect, useState } from 'react';
import '../../../assets/scss/components/product-categories.scss';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Table,
  Image,
  Card,
  Space,
  Row,
  Col,
  Tabs,
  Tag,
  Switch,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { export_url, IMG_URL } from '../../../configs/app-global';
import { Context } from '../../../context/context';
import CustomModal from '../../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  addMenu,
  disableRefetch,
  setMenuData,
} from '../../../redux/slices/menu';
import productService from '../../../services/seller/product';
import { fetchSellerProducts } from '../../../redux/slices/product';
import { useTranslation } from 'react-i18next';
import formatSortType from '../../../helpers/formatSortType';
import useDidUpdate from '../../../helpers/useDidUpdate';
import SearchInput from '../../../components/search-input';
import { DebounceSelect } from '../../../components/search';
import brandService from '../../../services/rest/brand';
import categoryService from '../../../services/rest/category';
import DeleteButton from '../../../components/delete-button';
import { AsyncTreeSelect } from '../../../components/async-tree-select-category';
const roles = ['all', 'published', 'pending', 'unpublished'];
const { TabPane } = Tabs;
const ProductCategories = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const goToEdit = (row) => {
    dispatch(
      addMenu({
        id: 'product-edit',
        url: `seller/product/${row.uuid}`,
        name: t('edit.product'),
      })
    );
    navigate(`/seller/product/${row.uuid}`);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      sorter: true,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      render: (img) => {
        return (
          <Image
            width={100}
            src={IMG_URL + img}
            placeholder
            style={{ borderRadius: 4 }}
          />
        );
      },
    },
    {
      title: t('name'),
      dataIndex: 'name',
    },
    {
      title: t('category'),
      dataIndex: 'category_name',
    },
    {
      title: t('active'),
      dataIndex: 'active',
      is_show: true,
      render: (active, row) => {
        return <Switch disabled={true} checked={active} />;
      },
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <div>
          {status === 'published' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'unpublished' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
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
            <DeleteButton
              icon={<DeleteOutlined />}
              onClick={() => {
                setIsModalVisible(true);
                setUUID(row.uuid);
                setIsDelete(true);
              }}
            />
          </Space>
        );
      },
    },
  ];
  const [uuid, setUUID] = useState(false);
  const { setIsModalVisible } = useContext(Context);
  const [isDelete, setIsDelete] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [role, setRole] = useState('all');
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { products, meta, loading, params } = useSelector(
    (state) => state.product,
    shallowEqual
  );
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
  const data = activeMenu.data;
  const immutable = activeMenu.data?.role || role;

  const paramsData = {
    search: data?.search,
    brand_id: data?.brand?.value,
    category_id: data?.category?.value,
    sort: data?.sort,
    column: data?.column,
    perPage: data?.perPage,
    page: data?.page,
    status:
      immutable === 'deleted_at'
        ? undefined
        : immutable === 'all'
        ? undefined
        : immutable,
    deleted_at: immutable === 'deleted_at' ? immutable : undefined,
  };
  const productDelete = () => {
    setLoadingBtn(true);
    productService
      .delete(uuid)
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchSellerProducts(params));
      })
      .finally(() => setLoadingBtn(false));
  };
  const productDeleteAll = () => {
    const ids = selectedRows?.map((item) => item.id);
    setLoadingBtn(true);
    productService
      .deleteAll({ productIds: ids })
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchSellerProducts(params));
      })
      .finally(() => setLoadingBtn(false));
  };
  const handleActive = () => {
    setLoadingBtn(true);
    productService
      .setActive(uuid)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchSellerProducts(params));
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({ activeMenu, data: { perPage, page, column, sort } })
    );
  }

  useDidUpdate(() => {
    dispatch(fetchSellerProducts(paramsData));
  }, [activeMenu.data]);

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSellerProducts(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const goToAddProduct = () => {
    dispatch(
      addMenu({
        id: 'product-add',
        url: 'seller/product/add',
        name: t('add.product'),
      })
    );
    navigate('/seller/product/add');
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        id: 'seller-product-import',
        url: `seller/product/import`,
        name: t('product.import'),
      })
    );
    navigate(`/seller/product/import`);
  };

  async function fetchBrands(search) {
    const params = {
      shop_id: myShop?.id,
      search,
    };
    return brandService.getAll(params).then(({ data }) =>
      data.map((item) => ({
        label: item.title,
        value: item.id,
      }))
    );
  }

  async function fetchCategories(search) {
    const params = { search };
    return categoryService.getAll(params).then((res) =>
      res.data.map((item) => ({
        title: item.translation?.title,
        value: item.id,
        key: item.id,
        disabled: item.children?.length > 0 ? true : false,
        children: item.children?.map((el) => ({
          title: el.translation?.title,
          value: el.id,
          key: el.id,
          children: el.children?.map((three) => ({
            title: three.translation?.title,
            value: three.id,
            key: three.id,
          })),
        })),
      }))
    );
  }

  const handleFilter = (item, name) => {
    dispatch(
      setMenuData({
        activeMenu,
        data: { ...activeMenu.data, [name]: item },
      })
    );
  };

  const excelExport = () => {
    setDownloading(true);
    const { brand, category, search } = activeMenu.data || {};
    const body = {
      shop_id: myShop?.id,
      brand_id: brand?.value,
      category_id: category?.value,
      search,
    };
    productService
      .export(body)
      .then((res) => {
        const body = export_url + res.data.file_name;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
  };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };
  return (
    <React.Fragment>
      <Card>
        <Row gutter={24}>
          <Col span={17}>
            <Space size='middle' wrap>
              <SearchInput
                placeholder={t('search')}
                handleChange={(search) => handleFilter(search, 'search')}
              />
              <AsyncTreeSelect
                placeholder={t('select.category')}
                fetchOptions={fetchCategories}
                style={{ minWidth: 250 }}
                onChange={(category) => handleFilter(category, 'category')}
                value={activeMenu.data?.category}
              />
              <DebounceSelect
                placeholder={t('select.brand')}
                fetchOptions={fetchBrands}
                style={{ minWidth: 250 }}
                onChange={(brand) => handleFilter(brand, 'brand')}
                value={activeMenu.data?.brand}
              />
            </Space>
          </Col>
          <Col span={7} className='d-flex justify-content-end'>
            <Space wrap>
              <Button type='primary' onClick={goToAddProduct}>
                {t('add.product')}
              </Button>
              <Button onClick={excelExport} loading={downloading}>
                {t('export')}
              </Button>
              <Button onClick={goToImport}>{t('import')}</Button>
              <Button
                onClick={productDeleteAll}
                disabled={!selectedRows?.length}
              >
                {t('delete.all')}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      <Card title={t('products')}>
        <Tabs
          className='mt-3'
          activeKey={immutable}
          onChange={(key) => {
            handleFilter({ role: key, page: 1 });
            setRole(key);
          }}
          type='card'
        >
          {roles.map((item) => (
            <TabPane tab={t(item)} key={item} />
          ))}
        </Tabs>
        <Table
          rowSelection={rowSelection}
          loading={loading}
          columns={columns}
          dataSource={products}
          pagination={{
            pageSize: params.perPage,
            page: params.page,
            total: meta.total,
            defaultCurrent: params.page,
          }}
          onChange={onChangePagination}
          rowKey={(record) => record.id}
        />
        <CustomModal
          click={isDelete ? productDelete : handleActive}
          text={isDelete ? t('delete.product') : t('set.active.product')}
          loading={loadingBtn}
        />
      </Card>
    </React.Fragment>
  );
};

export default ProductCategories;
