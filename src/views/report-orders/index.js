import {
  Card,
  Col,
  Row,
  Space,
  Typography,
  Table,
  Tag,
  Spin,
  Menu,
  Dropdown,
  Select,
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ReportChart from '../../components/report/chart';
import { ReportContext } from '../../context/report';
import FilterColumns from '../../components/filter-column';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  fetchOrderProduct,
  fetchOrderProductChart,
} from '../../redux/slices/report/order';
import useDidUpdate from '../../helpers/useDidUpdate';
import { getReportValue } from '../../helpers/getReportPrice';
import FilterByDate from '../../components/report/filter';
import moment from 'moment';
const { Text, Title } = Typography;
const ReportOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [chart, handleChart] = useState('orders');
  const { date_from, date_to, by_time, sellers, shops } =
    useContext(ReportContext);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    loading,
    chartData: reportData,
    productList: reportProducts,
    error,
  } = useSelector((state) => state.orderReport, shallowEqual);
  const [status, setStatus] = useState('all');
  const [columns, setColumns] = useState([
    {
      title: 'Creater at',
      dataIndex: 'created_at',
      key: 'date',
      is_show: true,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (_, data) => moment(data?.created_at).format('MMMM Do YYYY'),
    },
    {
      title: 'Order #',
      dataIndex: 'id',
      key: 'id',
      is_show: true,
      render: (_, data) => <a onClick={() => goToShow(data)}>#{data.id}</a>,
    },
    {
      title: 'Status',
      dataIndex: 'items_sold',
      key: 'items_sold',
      is_show: true,
      render: (_, data) => <Tag>{data.status}</Tag>,
    },
    {
      title: 'Customer',
      dataIndex: 'user_firstname',
      key: 'user_firstname',
      is_show: true,
      render: (_, data) => (
        <>{`${data.user_firstname} ${data.user_last_name || ''}`}</>
      ),
    },
    {
      title: 'Customer type',
      key: 'user_active',
      dataIndex: 'user_active',
      is_show: true,
      render: (_, data) => {
        const status = Boolean(data?.user_active);
        return (
          <Tag color={status ? 'green' : 'red'} key={data.id}>
            {status ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
    },
    {
      width: 400,
      title: 'Product(s)',
      key: 'category',
      dataIndex: 'category',
      is_show: true,
      render: (_, data) => {
        const allProduct = data.order_details.flatMap((item) => item.products);
        if (allProduct?.length > 1) {
          return (
            <>
              {allProduct?.[0]?.stock?.countable?.translation?.title}{' '}
              <Dropdown
                overlay={
                  <Menu>
                    {allProduct?.map((item) => (
                      <Menu.Item>
                        {item.stock?.countable?.translation?.title}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
              >
                <Tag style={{ cursor: 'pointer' }}>{`+ ${
                  allProduct.length - 1
                } more`}</Tag>
              </Dropdown>{' '}
            </>
          );
        } else {
          return <>{allProduct?.[0]?.stock?.countable?.translation?.title}</>;
        }
      },
    },
    {
      title: 'Item sold',
      key: 'item_sold',
      dataIndex: 'item_sold',
      is_show: true,
    },
    // {
    //   title: 'Coupon(s)',
    //   key: 'status',
    //   dataIndex: 'status',
    //   is_show: true,
    // },
    {
      title: 'Net sales',
      key: 'price',
      dataIndex: 'price',
      is_show: true,
      sorter: (a, b) => a.net_sales - b.net_sales,
      render: (_, data) => {
        return (
          <>
            {getReportValue(
              reportData?.defaultCurrency?.symbol || '$',
              data?.net_sales,
              true
            )}
          </>
        );
      },
    },
  ]);

  const performance = [
    {
      label: 'Orders',
      value: 'orders',
      qty: 'ordersCount',
      isPrice: false,
    },
    {
      label: 'Net sales',
      value: 'net_sales',
      qty: 'netSalesSum',
      isPrice: true,
    },
    {
      label: 'Average order value',
      value: 'avg_order_value',
      qty: 'netSalesAvg',
      isPrice: true,
    },
    // {
    //   label: 'Average items per values',
    //   value: 'items_Sold',
    //   qty: 'itemsSold',
    //   isPrice: false,
    // },
  ];

  const options = [
    { value: 'all', label: 'All status' },
    { value: 'open', label: 'Open' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' },
  ];

  const goToShow = (row) => {
    dispatch(
      addMenu({
        url: `order/details/${row.id}`,
        id: 'order_details',
        name: t('order.details'),
      })
    );
    navigate(`/order/details/${row.id}`);
  };

  const fetchReport = () => {
    dispatch(
      fetchOrderProductChart({
        date_from,
        date_to,
        by_time,
        chart,
        status,
        sellers,
        shops,
        order_status: status,
      })
    );
  };

  const fetchProduct = (page, perPage) => {
    dispatch(
      fetchOrderProduct({
        date_from,
        date_to,
        by_time,
        chart,
        page,
        perPage,
        order_status: status,
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
  }, [date_to, status, sellers, shops, date_from]);

  useDidUpdate(() => {
    fetchReport();
  }, [date_to, by_time, chart, status, sellers, shops, date_from]);

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    fetchProduct(page, perPage);
  };

  const handleSelector = (e) => {
    setStatus(e);
  };

  return (
    <Spin size='large' spinning={loading}>
      <FilterByDate />
      <Row gutter={24} className='report-products'>
        {performance?.map((item, key) => (
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
                <Col span={18}>
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
      <ReportChart reportData={reportData} chart_data='price_avg' />
      <Row gutter={24}>
        <Col span={24}>
          <Card>
            <Row gutter={24} className='align-items-center mb-4'>
              <Col span={20}>
                <Space>
                  <Title level={2} className='mb-0'>
                    {t('Orders')}
                  </Title>
                  {/* <Tag color='geekblue'>Compare</Tag> */}
                </Space>
              </Col>
              <Col span={4} className='d-flex justify-content-end'>
                <Space>
                  <Select
                    style={{ width: 150 }}
                    onChange={handleSelector}
                    options={options}
                    defaultValue={'all'}
                  />
                  <FilterColumns columns={columns} setColumns={setColumns} />
                </Space>
              </Col>
            </Row>
            <Table
              columns={columns?.filter((item) => item.is_show)}
              dataSource={reportProducts.data || []}
              rowKey={(row) => row.id}
              loading={loading}
              pagination={{
                pageSize: reportProducts?.per_page,
                page: reportProducts?.current_page || 1,
                total: reportProducts?.total,
                defaultCurrent: 1,
              }}
              onChange={onChangePagination}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default ReportOrder;
