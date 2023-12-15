import { Alert, Col, Row } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import OrderChart from './orderChart';
import SalesChart from './salesChart';
import StatisticNumberWidget from './statisticNumberWidget';
import StatisticPriceWidget from './statisticPriceWidget';
import TopCustomers from './topCustomers';
import TopProducts from './topProducts';

export default function GeneralDashboard() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { counts } = useSelector(
    (state) => state.statisticsCount,
    shallowEqual
  );
  const { sum } = useSelector((state) => state.statisticsSum, shallowEqual);
  const { subscription } = useSelector(
    (state) => state.myShop.myShop,
    shallowEqual
  );

  return (
    <div>
      {subscription && user?.role === 'seller' && (
        <Alert
          message={
            <div>
              {t('your.current.subscription')}{' '}
              <span className='font-weight-bold'>{subscription.type}</span>{' '}
              {t('will.expire.at')} {subscription.expired_at}
            </div>
          }
          type='info'
        />
      )}
      <Row gutter={16} className='mt-3'>
        <Col flex='0 0 16.6%'>
          <StatisticNumberWidget
            title={t('in.progress.orders')}
            value={counts.progress_orders_count}
          />
        </Col>
        <Col flex='0 0 16.6%'>
          <StatisticNumberWidget
            title={t('cancelled.orders')}
            value={counts.cancel_orders_count}
          />
        </Col>
        <Col flex='0 0 16.6%'>
          <StatisticNumberWidget
            title={t('delivered.orders')}
            value={counts.delivered_orders_count}
          />
        </Col>
        <Col flex='0 0 16.6%'>
          <StatisticNumberWidget
            title={t('out.of.stock.products')}
            value={counts.products_out_of_count}
          />
        </Col>
        <Col flex='0 0 16.6%'>
          <StatisticNumberWidget
            title={t('total.products')}
            value={counts.products_count}
          />
        </Col>
        <Col flex='0 0 16.6%'>
          <StatisticNumberWidget
            title={t('order.reviews')}
            value={counts.reviews_count}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={24} md={24} lg={24} xl={6}>
          <StatisticPriceWidget
            title={t('total.earned')}
            value={sum.total_earned}
            subtitle={t('last.30.days')}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={6}>
          <StatisticPriceWidget
            title={t('delivery.earning')}
            value={sum.delivery_earned}
            subtitle={t('last.30.days')}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={6}>
          <StatisticPriceWidget
            title={t('total.order.tax')}
            value={sum.tax_earned}
            subtitle={t('last.30.days')}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={24} xl={6}>
          <StatisticPriceWidget
            title={t('total.comission')}
            value={sum.commission_earned}
            subtitle={t('last.30.days')}
          />
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={12}>
          <OrderChart />
        </Col>
        <Col span={12}>
          <TopCustomers />
        </Col>
        <Col span={12}>
          <TopProducts />
        </Col>
        <Col span={12}>
          <SalesChart />
        </Col>
      </Row>
    </div>
  );
}
