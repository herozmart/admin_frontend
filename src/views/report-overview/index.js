import { Card, Col, Row, Typography, Spin, Divider } from 'antd';
import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import LeaderBoard from './helper/leadersboard';
import ChartsOverview from './helper/charts';
import { getReportValue } from '../../helpers/getReportPrice';
import FilterByDate from '../../components/report/filter';
const { Text, Title } = Typography;

const ReportOverview = () => {
  const { t } = useTranslation();
  const { loading, chartData: reportData } = useSelector(
    (state) => state.overviewReport,
    shallowEqual
  );
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const chart_type = [
    {
      value: 'total_price',
      label: 'Total price',
      qty: 'totalPrice',
      isPrice: true,
    },
    {
      value: 'completed_orders_count',
      label: 'Completed orders',
      qty: 'completedOrdersCount',
      isPrice: false,
    },
    {
      value: 'canceled_orders',
      label: 'Canceled orders',
      qty: 'canceledOrders',
      isPrice: true,
    },
    {
      value: 'net_sales',
      label: 'Net sales',
      qty: 'netSalesSum',
      isPrice: true,
    },
    {
      value: 'net_sales_avg',
      label: 'Net sales avg',
      qty: 'netSalesAvg',
      isPrice: true,
    },
    { value: 'tax_total', label: 'Total tax', qty: 'taxTotal', isPrice: true },
    {
      value: 'items_sold',
      label: 'Items sold',
      qty: 'itemSold',
      isPrice: false,
    },
    {
      value: 'products_sold',
      label: 'Sold products',
      qty: 'productsSold',
      isPrice: false,
    },
  ];

  return (
    <Spin size='large' spinning={loading}>
      <FilterByDate />
      <Row gutter={24} className='align-items-center'>
        <Col span={24}>
          <Divider orientation='left'>{t('Performance')}</Divider>
        </Col>
      </Row>
      <Row gutter={24} className='report-products'>
        {chart_type?.map((item) => (
          <Col span={6} key={item.label}>
            <Card>
              <Row className='mb-5'>
                <Col>
                  <Text>{t(item.label)}</Text>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Title level={2}>
                    {getReportValue(
                      defaultCurrency?.symbol,
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
      <ChartsOverview chart_type={chart_type} />
      <LeaderBoard />
    </Spin>
  );
};

export default ReportOverview;
