import React, { useContext, useEffect, useState } from 'react';
import '../../assets/scss/components/product-categories.scss';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Table,
  Image,
  Card,
  Space,
  Switch,
  Tooltip,
  Tag,
  Tabs,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { export_url, IMG_URL } from '../../configs/app-global';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import productService from '../../services/product';
import { fetchProducts } from '../../redux/slices/product';
import useDidUpdate from '../../helpers/useDidUpdate';
import { DebounceSelect } from '../../components/search';
import brandService from '../../services/brand';
import categoryService from '../../services/category';
import shopService from '../../services/shop';
import SearchInput from '../../components/search-input';
import formatSortType from '../../helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import DeleteButton from '../../components/delete-button';
import { AsyncTreeSelect } from '../../components/async-tree-select-category';
import ProductStatusModal from './productStatusModal';
const { TabPane } = Tabs;
const roles = ['all', 'pending', 'published', 'unpublished'];

const ProductCategories = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const goToEdit = (row) => {
    dispatch(
      addMenu({
        id: `product-edit`,
        url: `product/${row.uuid}`,
        name: t('edit.product'),
      })
    );
    navigate(`/product/${row.uuid}`);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      sorter: (a, b) => a.id - b.id,
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
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setUUID(row.uuid);
              setIsDelete(false);
            }}
            checked={active}
          />
        );
      },
    },
    {
      title: t('status'),
      is_show: true,
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <div>
          {status === 'pending' ? (
            <Tag color='blue'>{t(status)}</Tag>
          ) : status === 'unpublished' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
          {!row.deleted_at ? (
            <EditOutlined onClick={() => setProductDetails(row)} />
          ) : (
            ''
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
  const [productDetails, setProductDetails] = useState(null);
  const [role, setRole] = useState('all');

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { products, meta, loading, params } = useSelector(
    (state) => state.product,
    shallowEqual
  );
  const immutable = activeMenu.data?.role || role;

  const data = activeMenu?.data;
  const paramsData = {
    search: data?.search,
    brand_id: data?.brand?.value,
    category_id: data?.category?.value,
    shop_id: data?.shop?.value,
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
    deleted_at: immutable === 'deleted_at' ? immutable : null,
  };
  const goToImport = () => {
    dispatch(
      addMenu({
        data: activeMenu.data.shop,
        id: 'product-import',
        url: `catalog/product/import`,
        name: t('product.import'),
      })
    );
    navigate(`/catalog/product/import`);
  };
  const productDelete = () => {
    setLoadingBtn(true);
    productService
      .delete(uuid)
      .then(() => {
        setIsModalVisible(false);
        toast.success(t('successfully.deleted'));
        dispatch(fetchProducts(params));
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
        dispatch(fetchProducts(params));
        setSelectedRows([]);
      })
      .finally(() => setLoadingBtn(false));
  };
  const handleActive = () => {
    setLoadingBtn(true);
    productService
      .setActive(uuid)
      .then(() => {
        setIsModalVisible(false);
        dispatch(fetchProducts(params));
        toast.success(t('successfully.updated'));
      })
      .finally(() => setLoadingBtn(false));
  };
  function onChangePagination(pagination, sorter) {
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
  useDidUpdate(() => {
    dispatch(fetchProducts(paramsData));
  }, [activeMenu.data]);

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchProducts(paramsData));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const excelExport = () => {
    setDownloading(true);
    const data = activeMenu.data;
    const body = {
      search: data?.search,
      brand_id: data?.brand?.value,
      category_id: data?.category?.value,
      shop_id: data?.shop?.value,
      sort: data?.sort,
      column: data?.column,
    };
    productService
      .export(body)
      .then((res) => {
        const body = export_url + res.data.file_name;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
  };

  const goToAddProduct = () => {
    dispatch(
      addMenu({
        id: 'product-add',
        url: 'product/add',
        name: t('add.product'),
      })
    );
    navigate('/product/add');
  };

  async function fetchBrands(search) {
    return brandService.search(search).then(({ data }) =>
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

  async function fetchShops(search) {
    const params = { search };
    return shopService.search(params).then(({ data }) =>
      data.map((item) => ({
        label: item.translation?.title,
        value: item.id,
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

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
  };

  return (
    <React.Fragment>
      <Card>
        <Space size='middle' wrap>
          <SearchInput
            placeholder={t('search')}
            handleChange={(search) => handleFilter(search, 'search')}
          />
          <DebounceSelect
            placeholder={t('select.shop')}
            fetchOptions={fetchShops}
            style={{ minWidth: 250 }}
            onChange={(shop) => handleFilter(shop, 'shop')}
            value={activeMenu.data?.shop}
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

          <Button type='primary' onClick={goToAddProduct}>
            {t('add.product')}
          </Button>
          <Tooltip title={t('select.shop')}>
            <Button
              onClick={excelExport}
              loading={downloading}
              disabled={!activeMenu?.data?.shop}
            >
              {t('export')}
            </Button>
          </Tooltip>
          <Tooltip title={t('select.shop')}>
            <Button onClick={goToImport} disabled={!activeMenu?.data?.shop}>
              {t('import')}
            </Button>
          </Tooltip>

          <Button onClick={productDeleteAll} disabled={!selectedRows?.length}>
            {t('delete.all')}
          </Button>
        </Space>
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
            pageSize: meta.per_page,
            page: meta.current_page,
            total: meta.total,
          }}
          onChange={onChangePagination}
          rowKey={(record) => record.id}
        />
        <CustomModal
          click={isDelete ? productDelete : handleActive}
          text={isDelete ? t('delete.product') : t('set.active.product')}
          loading={loadingBtn}
        />
        {productDetails && (
          <ProductStatusModal
            orderDetails={productDetails}
            handleCancel={() => setProductDetails(null)}
            paramsData={paramsData}
          />
        )}
      </Card>
    </React.Fragment>
  );
};

export default ProductCategories;
