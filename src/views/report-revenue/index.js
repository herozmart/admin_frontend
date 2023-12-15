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
import { CloudDownloadOutlined } from '@ant-design/icons';
import ReportService from '../../services/reports';
import { disableRefetch } from '../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ReportChart from '../../components/report/chart';
import { ReportContext } from '../../context/report';
import FilterColumns from '../../components/filter-column';
import useDidUpdate from '../../helpers/useDidUpdate';
import {
  fetchRevenueProduct,
  fetchRevenueProductChart,
} from '../../redux/slices/report/revenue';
import { getReportValue } from '../../helpers/getReportPrice';
import FilterByDate from '../../components/report/filter';
import { t } from 'i18next';
const { Text, Title } = Typography;

const ReportRevenue = () => {
  const dispatch = useDispatch();
  const [chart, handleChart] = useState('total_price');
  const { date_from, date_to, by_time, sellers, shops } =
    useContext(ReportContext);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    loading,
    chartData: reportData,
    productList,
    error,
  } = useSelector((state) => state.revenueReport, shallowEqual);
  const [downloading, setDownloading] = useState(false);
  const [columns, setColumns] = useState([
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(b.date) - new Date(a.date),
      is_show: true,
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
      is_show: true,
    },
    {
      title: 'Shipping',
      dataIndex: 'shipping',
      key: 'shipping',
      is_show: true,
      render: (_, data) => {
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            {getReportValue(
              reportData?.defaultCurrency?.symbol || '$',
              data?.shipping,
              true
            )}
          </div>
        );
      },
    },
    {
      title: 'Returns',
      dataIndex: 'returns',
      key: 'returns',
      is_show: true,
      render: (_, data) => {
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            {getReportValue(
              reportData?.defaultCurrency?.symbol || '$',
              data?.returns,
              true
            )}
          </div>
        );
      },
    },
    {
      title: 'Taxes',
      key: 'taxes',
      dataIndex: 'taxes',
      is_show: true,
      render: (_, data) => {
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            {getReportValue(
              reportData?.defaultCurrency?.symbol || '$',
              data?.taxes,
              true
            )}
          </div>
        );
      },
    },
    {
      title: 'Total sales',
      key: 'total_sales',
      dataIndex: 'total_sales',
      is_show: true,
      render: (_, data) => {
        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            {getReportValue(
              reportData?.defaultCurrency?.symbol || '$',
              data?.total_sales,
              true
            )}
          </div>
        );
      },
    },
  ]);
  const chart_type = [
    {
      value: 'total_price',
      label: 'Total price',
      qty: 'totalPrice',
      isPrice: true,
    },
    {
      value: 'net_sales',
      label: 'Net sales',
      qty: 'netSalesSum',
      isPrice: true,
    },
    { value: 'tax_total', label: 'Total tax', qty: 'taxTotal', isPrice: true },
    {
      value: 'total_shipping_free',
      label: 'Shipping',
      qty: 'totalShippingFree',
      isPrice: true,
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
    dispatch(fetchRevenueProductChart(params));
  };
  const fetchProduct = (page, perPage) => {
    const params = {
      date_from,
      date_to,
      by_time,
      page,
      perPage,
      sellers,
      shops,
    };
    dispatch(fetchRevenueProduct(params));
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
  }, [date_to, sellers, shops, date_from]);
  useDidUpdate(() => {
    fetchReport();
  }, [date_to, by_time, chart, sellers, shops, date_from]);
  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    fetchProduct(page, perPage);
  };
  const excelExport = () => {
    setDownloading(true);
    ReportService.getRevenueProducts({
      date_from,
      date_to,
      by_time,
      chart,
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

  return (
    <Spin size='large' spinning={loading}>
      <FilterByDate />
      <Row gutter={24} className='report-products'>
        {chart_type?.map((item) => (
          <Col
            span={6}
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
            <Title level={2} className='mb-0'>
              {t('Revenue')}
            </Title>
          </Col>
          <Col span={6} className='d-flex justify-content-end'>
            <Space>
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
          columns={columns?.filter((item) => item.is_show)}
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
          scroll={{
            x: 1500,
          }}
        />
      </Card>
    </Spin>
  );
};

export default ReportRevenue;
