import {
  Card,
  Col,
  Row,
  Space,
  Typography,
  Table,
  Tag,
  Button,
  Spin,
  Image,
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import SearchInput from '../../../components/search-input';
import { CloudDownloadOutlined } from '@ant-design/icons';
import ReportService from '../../../services/seller/reports';
import { disableRefetch } from '../../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ReportChart from '../../../components/report/chart';
import { ReportContext } from '../../../context/report';
import FilterColumns from '../../../components/filter-column';
import {
  fetchReportProduct,
  fetchReportProductChart,
  ReportProductCompare,
} from '../../../redux/slices/report-seller/products';
import useDidUpdate from '../../../helpers/useDidUpdate';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import QueryString from 'qs';
import { IMG_URL } from '../../../configs/app-global';
import FilterByDate from '../../../components/report/filter';
import { getReportValue } from '../../../helpers/getReportPrice';
import { t } from 'i18next';
const { Text, Title } = Typography;

const ReportProducts = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [chart, handleChart] = useState('items_sold');

  const category_id = QueryString.parse(location.search, [])['?category_id'];
  const product_id = QueryString.parse(location.search, [])['?product_id'];
  const { date_from, date_to, by_time, sellers, shops } =
    useContext(ReportContext);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    loading,
    chartData: reportData,
    productList,
    error,
  } = useSelector((state) => state.productReport, shallowEqual);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [extrasLoader, setExtrasLoader] = useState(false);
  const [search, setSearch] = useState('');
  const [extrasData, setExtrasData] = useState([]);
  const [expandId, setId] = useState(null);
  const expandedRowRender = (row) => {
    const columns = [
      {
        title: 'Extras name',
        dataIndex: 'Extras name',
        key: 'Extras name',
        render: (_, data) => (
          <Space>
            {data.stock_extras?.length ? (
              data.stock_extras.map((item, key) => (
                <>
                  {key === 0 && row.translation_title}
                  {item.group.type === 'image' ? (
                    <Image
                      width={40}
                      height={40}
                      src={IMG_URL + item.value}
                      placeholder
                      style={{ borderRadius: 4, marginTop: 2 }}
                    />
                  ) : item.group.type === 'color' ? (
                    <div
                      className='d-block'
                      style={{
                        backgroundColor: item.value,
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <>{item.value}</>
                  )}
                </>
              ))
            ) : (
              <>{row.translation_title}</>
            )}
          </Space>
        ),
      },
      {
        title: 'Item sold',
        dataIndex: 'items_sold',
        key: 'items_sold',
      },
      {
        title: 'Net sales',
        dataIndex: 'net_sales',
        key: 'net_sales',
      },
      {
        title: 'Orders',
        dataIndex: 'orders_count',
        key: 'orders_count',
      },
      {
        title: 'Status',
        dataIndex: 'Status',
        key: 'Status',
        render: (_, data) => <>{data.status}</>,
      },
      {
        title: 'Stock',
        dataIndex: 'quantity',
        key: 'quantity',
      },
    ];
    return (
      <Table
        columns={columns}
        dataSource={extrasData || []}
        pagination={false}
        loading={extrasLoader}
      />
    );
  };
  const [columns, setColumns] = useState([
    {
      title: 'Product title',
      dataIndex: 'translation_title',
      key: 'translation_title',
      render: (_, data) => {
        return (
          <Link to={`/seller/report/products?product_id=${data.id}`}>
            {data?.translation_title}
          </Link>
        );
      },
      is_show: true,
    },
    {
      title: 'Bar code',
      dataIndex: 'bar_code',
      key: 'bar_code',
      is_show: true,
      render: (_, data) => {
        return <>{data?.bar_code || '-'}</>;
      },
    },
    {
      title: 'Item sold',
      dataIndex: 'items_sold',
      key: 'items_sold',
      sorter: (a, b) => a.items_sold - b.items_sold,
      is_show: true,
    },
    {
      title: 'Net sales',
      dataIndex: 'net_sales',
      key: 'net_sales',
      sorter: (a, b) => a.net_sales - b.net_sales,
      is_show: true,
      render: (_, data) => {
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            {getReportValue(
              reportData?.defaultCurrency?.symbol,
              data?.net_sales,
              true
            )}
          </div>
        );
      },
    },
    {
      title: 'Orders',
      key: 'orders_count',
      dataIndex: 'orders_count',
      is_show: true,
    },
    {
      title: 'Category',
      key: 'category',
      dataIndex: 'category',
      render: (_, data) => {
        if (data?.category?.paren_recursive?.translation_title)
          return (
            <>
              {`${data?.category?.paren_recursive?.translation_title} > `}
              <Link
                to={`/seller/report/products?category_id=${data.category_id}`}
              >
                {data?.category?.translation_title}
              </Link>
            </>
          );
        else
          return (
            <Link
              to={`/seller/report/products?category_id=${data.category_id}`}
            >
              {data?.category?.translation_title}
            </Link>
          );
      },
      is_show: true,
    },
    {
      title: 'Variations',
      key: 'variations',
      dataIndex: 'variations',
      is_show: true,
    },
    {
      title: 'Status',
      key: 'active',
      dataIndex: 'active',
      render: (_, data) => {
        const status = Boolean(data?.active);
        return (
          <Tag color={status ? 'green' : 'red'} key={data.id}>
            {status ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
      is_show: true,
    },
    {
      title: 'Stock',
      key: 'stocks_total',
      dataIndex: 'stocks_total',
      is_show: true,
    },
  ]);
  const chart_type = [
    {
      value: 'items_sold',
      label: 'Item sold',
      qty: 'itemsSold',
      isPrice: false,
    },
    { value: 'net_sales', label: 'Net Sales', qty: 'netSales', isPrice: true },
    {
      value: 'orders_count',
      label: 'Orders',
      qty: 'ordersCount',
      isPrice: false,
    },
  ];
  const fetchReport = () => {
    const params = {
      date_from,
      date_to,
      by_time,
      chart,
      sellers,
      shops,
    };
    if (category_id) params.categories = [category_id];
    if (product_id) params.products = [product_id];
    dispatch(fetchReportProductChart(params));
  };
  const fetchProduct = (page, perPage) => {
    const params = {
      date_from,
      date_to,
      by_time,
      page,
      perPage,
      search: search || null,
      sellers,
      shops,
    };
    if (category_id) params.categories = [category_id];
    if (product_id) params.products = [product_id];
    dispatch(fetchReportProduct(params));
  };
  useEffect(() => {
    if (activeMenu.refetch) {
      fetchProduct();
      fetchReport();
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);
  useDidUpdate(() => {
    fetchProduct();
  }, [date_to, search, category_id, product_id, sellers, shops, date_from]);
  useDidUpdate(() => {
    fetchReport();
  }, [
    date_to,
    by_time,
    chart,
    category_id,
    product_id,
    sellers,
    shops,
    date_from,
  ]);

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    fetchProduct(page, perPage);
  };
  const excelExport = () => {
    setDownloading(true);
    ReportService.getReportProductList({
      date_from,
      date_to,
      by_time,
      sellers,
      shops,
      export: 'excel',
      categories: category_id ? [category_id] : null,
      products: product_id ? [product_id] : null,
    })
      .then((res) => {
        const body = res.data.link;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
  };
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const Compare = () => {
    const params = {
      date_from,
      date_to,
      by_time,
      chart,
      ids: selectedRowKeys,
      sellers,
      shops,
    };
    dispatch(ReportProductCompare(params));
  };
  const clear = () => {
    setSelectedRowKeys([]);
    fetchProduct();
    fetchReport();
    navigate(`/seller/report/products`);
  };
  const onExpand = (expanded, record) => {
    if (expanded) {
      setExtrasLoader(true);
      setExtrasData([]);
      setId(record.id);
      ReportService.getExtrasReport(record.id, { date_from, date_to })
        .then((res) => {
          setExtrasData(res.data);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setExtrasLoader(false);
        });
    } else {
      setExtrasData([]);
      setId(null);
    }
  };

  const filteredColumns = columns?.filter((item) => item.is_show);
  return (
    <Spin size='large' spinning={loading}>
      <FilterByDate />
      <Row gutter={24} className='report-products'>
        {chart_type?.map((item) => (
          <Col
            span={8}
            key={item.label}
            onClick={() => handleChart(item.value)}
          >
            <Card className={chart === item.value && 'active'}>
              <Row className='mb-5'>
                <Col>
                  <Text>{t(item.label)}</Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Title level={2}>
                    {getReportValue(
                      reportData?.defaultCurrency?.symbol,
                      reportData[item.qty],
                      item.isPrice
                    )}
                  </Title>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
      <ReportChart reportData={reportData} chart_data='quantities_sum' />
      <Card>
        <Row
          gutter={24}
          className='align-items-center justify-content-between mb-4'
        >
          <Col span={3}>
            <Title level={2} className='mb-0'>
              {t('Products')}
            </Title>
          </Col>
          <Col span={15}>
            <SearchInput
              style={{ width: '100%' }}
              handleChange={(e) => setSearch(e)}
            />
          </Col>
          <Col span={6} className='d-flex justify-content-end'>
            <Space>
              <Button
                color='geekblue'
                onClick={Compare}
                disabled={Boolean(!selectedRowKeys.length)}
              >
                {t('Compare')}
              </Button>
              <Button onClick={clear}>{t('Clear')}</Button>
              <Button
                icon={<CloudDownloadOutlined />}
                loading={downloading}
                onClick={excelExport}
              >
                {t('Download')}
              </Button>
              <FilterColumns columns={columns} setColumns={setColumns} />
            </Space>
          </Col>
        </Row>
        <Table
          expandable={
            filteredColumns?.length
              ? {
                  expandedRowRender,
                  defaultExpandedRowKeys: ['0'],
                  expandedRowKeys: [expandId],
                }
              : null
          }
          rowSelection={filteredColumns?.length ? rowSelection : null}
          columns={filteredColumns}
          dataSource={productList.data || []}
          rowKey={(row) => row.id}
          loading={loading}
          pagination={{
            pageSize: productList?.per_page,
            page: productList?.current_page || 1,
            total: productList?.total,
            defaultCurrent: 1,
          }}
          onChange={onChangePagination}
          onExpand={(expanded, record) => onExpand(expanded, record)}
          scroll={{
            x: 1500,
          }}
        />
      </Card>
    </Spin>
  );
};

export default ReportProducts;
