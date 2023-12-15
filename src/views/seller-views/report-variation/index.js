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
import { disableRefetch } from '../../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ReportChart from '../../../components/report/chart';
import { ReportContext } from '../../../context/report';
import FilterColumns from '../../../components/filter-column';
import {
  fetchVariationProduct,
  fetchVariationProductChart,
  VariationProductCompare,
} from '../../../redux/slices/report-seller/variation';
import useDidUpdate from '../../../helpers/useDidUpdate';
import { useLocation, useNavigate } from 'react-router-dom';
import QueryString from 'qs';
import { IMG_URL } from '../../../configs/app-global';
import { getReportValue } from '../../../helpers/getReportPrice';
import FilterByDate from '../../../components/report/filter';
import { t } from 'i18next';
const { Text, Title } = Typography;

const ReportVariation = () => {
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
  } = useSelector((state) => state.variationReport, shallowEqual);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [columns, setColumns] = useState([
    {
      title: 'Product title',
      dataIndex: 'translation_title',
      key: 'translation_title',
      render: (_, data) => (
        <Space>
          {data.stock_extras?.length ? (
            data.stock_extras.map((item, key) => (
              <>
                {key === 0 && data.translation_title}
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
            <>{data.translation_title}</>
          )}
        </Space>
      ),
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
              reportData?.defaultCurrency?.symbol || '$',
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
      title: 'Variations',
      key: 'variations',
      dataIndex: 'variations',
      is_show: true,
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      is_show: true,
    },
    {
      title: 'Stock',
      key: 'quantity',
      dataIndex: 'quantity',
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
    dispatch(fetchVariationProductChart(params));
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
    if (category_id) params.categories = [category_id];
    if (product_id) params.products = [product_id];
    dispatch(fetchVariationProduct(params));
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
  }, [date_to, category_id, product_id, sellers, shops, date_from]);
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
    dispatch(VariationProductCompare(params));
  };
  const clear = () => {
    setSelectedRowKeys([]);
    fetchProduct();
    fetchReport();
    navigate(`/seller/report/variation`);
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
            <Title level={2} className='mb-0'>
              {t('Variation')}
            </Title>
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
          scroll={{
            x: 1500,
          }}
        />
      </Card>
    </Spin>
  );
};

export default ReportVariation;
