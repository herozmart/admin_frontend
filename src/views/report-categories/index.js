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
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import SearchInput from '../../components/search-input';
import { CloudDownloadOutlined } from '@ant-design/icons';
import ReportService from '../../services/reports';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ReportChart from '../../components/report/chart';
import { ReportContext } from '../../context/report';
import FilterColumns from '../../components/filter-column';
import {
  fetchReportProduct,
  fetchReportProductChart,
  ReportProductCompare,
} from '../../redux/slices/report/categories';
import useDidUpdate from '../../helpers/useDidUpdate';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getReportValue } from '../../helpers/getReportPrice';
import FilterByDate from '../../components/report/filter';
const { Text, Title } = Typography;
const ReportProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [chart, handleChart] = useState('items_sold');
  const { date_from, date_to, by_time, sellers, shops } =
    useContext(ReportContext);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    loading,
    chartData: reportData,
    productList,
    error,
  } = useSelector((state) => state.categoryReport, shallowEqual);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState('');
  const goToProductReport = (row) => {
    dispatch(
      addMenu({
        url: `report/products`,
        id: 'report.products',
        name: t('report.products'),
      })
    );
    navigate(`/report/products?category_id=${row.id}`);
  };
  const [columns, setColumns] = useState([
    {
      title: 'Category',
      key: 'category',
      dataIndex: 'category',
      render: (_, data) => {
        if (data?.paren_recursive?.translation_title)
          return (
            <>
              {`${data?.paren_recursive?.translation_title} > `}
              <a onClick={() => goToProductReport(data)}>
                {data?.translation_title}
              </a>
            </>
          );
        else
          return (
            <a onClick={() => goToProductReport(data)}>
              {data?.translation_title}
            </a>
          );
      },
      is_show: true,
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
              reportData?.defaultCurrency?.symbol || '$',
              data?.net_sales,
              true
            )}
          </div>
        );
      },
    },
    {
      title: 'Products',
      key: 'products_count',
      dataIndex: 'products_count',
      render: (_, data) => {
        return (
          <a onClick={() => goToProductReport(data)}>{data.products_count}</a>
        );
      },
      is_show: true,
    },
    {
      title: 'Orders',
      key: 'orders_count',
      dataIndex: 'orders_count',
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
    dispatch(
      fetchReportProductChart({
        date_from,
        date_to,
        by_time,
        chart,
        sellers,
        shops,
      })
    );
  };
  const fetchProduct = (page, perPage) => {
    dispatch(
      fetchReportProduct({
        date_from,
        date_to,
        by_time,
        chart,
        page,
        perPage,
        search,
        sellers,
        shops,
      })
    );
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
  }, [date_to, search, sellers, shops, date_from]);
  useDidUpdate(() => {
    fetchReport();
  }, [date_to, by_time, chart, sellers, shops, date_from]);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    fetchProduct(page, perPage);
  };
  const excelExport = () => {
    setDownloading(true);
    ReportService.getCategoriesProducts({
      date_from,
      date_to,
      by_time,
      chart,
      search,
      sellers,
      shops,
      export: 'excel',
    })
      .then((res) => {
        const body = res.data.link;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
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
    // navigate(`/report/categories`);
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
                      reportData?.defaultCurrency?.symbol || '$',
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
            <Space>
              <Title level={2} className='mb-0'>
                {t('Categories')}
              </Title>
            </Space>
          </Col>
          <Col span={9}>
            <SearchInput
              style={{ width: '100%' }}
              handleChange={(e) => setSearch(e)}
            />
          </Col>
          <Col span={12} className='d-flex justify-content-end'>
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
        />
      </Card>
    </Spin>
  );
};

export default ReportProducts;
