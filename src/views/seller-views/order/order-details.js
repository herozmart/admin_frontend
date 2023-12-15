import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Image,
  Tag,
  Space,
  Descriptions,
  Row,
  Col,
  Steps,
  Empty,
  Rate,
  Button,
} from 'antd';
import { CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import orderService from '../../../services/seller/order';
import getImage from '../../../helpers/getImage';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../../redux/slices/menu';
import OrderStatusModal from './orderStatusModal';
import OrderDeliveryman from './orderDeliveryman';
import { fetchSellerDeliverymans } from '../../../redux/slices/deliveryman';
import { useTranslation } from 'react-i18next';
import numberToPrice from '../../../helpers/numberToPrice';
import AllOrderStatusModal from './allOrderStatus';
import { allStatuses } from '../../../constants/OrderStatus';
const { Step } = Steps;
export default function SellerOrderDetails() {
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const data = activeMenu.data;
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDeliveryDetails, setOrderDeliveryDetails] = useState(null);
  const [allOrderModal, setAllOrderModal] = useState(false);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('shop.name'),
      dataIndex: 'shop',
      key: 'shop',
      render: (shop, row) => shop.translation?.title,
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status, row) => (
        <Space>
          {status == 'new' ? (
            <Tag color='blue'>
              {t(allStatuses.find((item) => item.id == status)?.label)}
            </Tag>
          ) : status == 'canceled' ? (
            <Tag color='error'>
              {t(allStatuses.find((item) => item.id == status)?.label)}
            </Tag>
          ) : (
            <Tag color='cyan'>
              {t(allStatuses.find((item) => item.id == status)?.label)}
            </Tag>
          )}
          {status === 'new' && (
            <EditOutlined onClick={() => setOrderDetails(row)} />
          )}
        </Space>
      ),
    },
    {
      title: t('delivery.type'),
      dataIndex: 'delivery_type',
      key: 'delivery_type',
      render: (delivery_type) => delivery_type?.translation?.title,
    },
    {
      title: t('delivery.date.&.time'),
      dataIndex: 'delivery',
      key: 'delivery',
      render: (delivery, row) => (
        <div>
          {row.delivery_date} {row.delivery_time}
        </div>
      ),
    },
    {
      title: t('amount'),
      dataIndex: 'price',
      key: 'price',
      render: (price, row) =>
        numberToPrice(price + (row.coupon?.price ?? 0), defaultCurrency.symbol),
    },
    {
      title: t('cashback'),
      dataIndex: 'cash_back',
      key: 'cash_back',
      render: (cash_back, row) =>
        numberToPrice(cash_back, defaultCurrency.symbol),
    },
    {
      title: t('shop.tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: (tax) => numberToPrice(tax, defaultCurrency.symbol),
    },
    // {
    //   title: t('delivery.fee'),
    //   dataIndex: 'delivery_fee',
    //   key: 'delivery_fee',
    //   render: (delivery_fee) =>
    //     numberToPrice(delivery_fee, defaultCurrency.symbol),
    // },
    {
      title: t('coupon'),
      dataIndex: 'coupon',
      key: 'coupon',
      render: (coupon) => numberToPrice(coupon?.price, defaultCurrency.symbol),
    },
    // {
    //   title: t('payment.status'),
    //   dataIndex: 'tax',
    //   key: 'tax',
    //   render: (tax, row) =>
    //     row.transaction ? (
    //       <div>
    //         {row.transaction?.status === 'progress' ? (
    //           <Tag color='gold'>{t(row.transaction?.status)}</Tag>
    //         ) : row.transaction?.status === 'rejected' ? (
    //           <Tag color='error'>{t(row.transaction?.status)}</Tag>
    //         ) : (
    //           <Tag color='cyan'>{t(row.transaction?.status)}</Tag>
    //         )}
    //       </div>
    //     ) : (
    //       '-'
    //     ),
    // },
  ];

  const handleCloseModal = () => {
    setOrderDetails(null);
    setOrderDeliveryDetails(null);
  };

  function fetchOrder() {
    setLoading(true);
    orderService
      .getById(id)
      .then(({ data }) => {
        const currency = data.currency;
        const user = data.user;
        const id = data.id;
        const price = data.price;
        const cashback = data.cash_back;
        const createdAt = data.created_at;
        const status = data.status;
        const total_delivery_fee = data.total_delivery_fee;
        const transaction = data.transaction;
        const note = data.note;
        const deliveryman = data.deliveryman;
        const details = data.details.map((item) => ({
          ...item,
          title: item.shop?.translation?.title,
        }));
        dispatch(
          setMenuData({
            activeMenu,
            data: {
              details,
              currency,
              user,
              id,
              createdAt,
              price,
              cashback,
              status,
              total_delivery_fee,
              transaction,
              note,
              deliveryman,
            },
          })
        );
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchOrder();
      dispatch(fetchSellerDeliverymans());
    }
  }, [activeMenu.refetch]);

  function getImageFromStock(stock) {
    const stockImage = stock.extras.find((item) => item.group.type === 'image');
    if (!!stockImage) {
      return stockImage.value;
    }
    return stock?.product?.img;
  }

  const expandedRowRender = (row) => {
    const columns = [
      {
        title: t('id'),
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: t('product.name'),
        dataIndex: 'stock',
        key: 'stock',
        render: (stock) => stock?.product?.translation?.title,
      },
      {
        title: t('image'),
        dataIndex: 'img',
        key: 'img',
        render: (img, row) => (
          <Image
            src={getImage(getImageFromStock(row.stock))}
            alt='product'
            width={100}
            height='auto'
            className='rounded'
            preview
            placeholder
            key={img + row.id}
          />
        ),
      },
      {
        title: t('price'),
        dataIndex: 'origin_price',
        key: 'origin_price',
        render: (origin_price) =>
          numberToPrice(origin_price, defaultCurrency.symbol),
      },
      {
        title: t('quantity'),
        dataIndex: 'quantity',
        key: 'quantity',
      },
      {
        title: t('discount'),
        dataIndex: 'discount',
        key: 'discount',
        render: (discount, row) =>
          numberToPrice(discount / row.quantity, defaultCurrency.symbol),
      },
      {
        title: t('tax'),
        dataIndex: 'tax',
        key: 'tax',
        render: (tax, row) =>
          numberToPrice(tax / row.quantity, defaultCurrency.symbol),
      },
      {
        title: t('total.price'),
        dataIndex: 'total_price',
        key: 'total_price',
        render: (total_price) =>
          numberToPrice(total_price, defaultCurrency.symbol),
      },
    ];
    const dataSource = row.order_stocks;

    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowKey={(record) => record.id}
      />
    );
  };

  const calculateSellerTotal = (details) => {
    const item = details[0];
    const totalPrice = item.price + item.tax + item.delivery_fee;
    return numberToPrice(totalPrice, defaultCurrency.symbol);
  };
  return (
    <>
      <Row gutter={24}>
        <Col span={24}>
          <Card>
            {data?.status === 'canceled' ? (
              <Steps className='order-statuses' current={0}>
                <Step
                  key={'canceled'}
                  icon={<CloseCircleOutlined />}
                  title={t('canceled')}
                />
              </Steps>
            ) : (
              <Steps
                className='order-statuses'
                current={
                  allStatuses.findIndex((item) => item.id == data?.status) || 0
                }
              >
                {allStatuses
                  .filter((item) => item.id !== 'canceled')
                  .map((item, key) => {
                    return (
                      <Step
                        key={item.id}
                        icon={item.icon}
                        title={t(item?.label)}
                      />
                    );
                  })}
              </Steps>
            )}
          </Card>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={6}>
          <Card title={t('client')} style={{ height: '95%' }} loading={loading}>
            <Descriptions>
              <Descriptions.Item label={t('client_id')} span={3}>
                #{data?.user?.id}
              </Descriptions.Item>
              <Descriptions.Item label={t('gender')} span={3}>
                {data?.user?.gender}
              </Descriptions.Item>
              <Descriptions.Item label={t('client')} span={3}>
                {data?.user?.firstname || ''} {data?.user?.lastname || ''}
              </Descriptions.Item>
              <Descriptions.Item label={t('phone')} span={3}>
                {data?.user?.phone}
              </Descriptions.Item>
              <Descriptions.Item label={t('email')} span={3}>
                {data?.user?.email}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={6}>
          <Card title={t('order')} style={{ height: '95%' }} loading={loading}>
            <Descriptions>
              <Descriptions.Item label={t('created.at')} span={3}>
                {data?.createdAt}
              </Descriptions.Item>
              <Descriptions.Item label={t('status')} span={3}>
                {t(allStatuses.find((item) => item.id == data?.status)?.label)}
              </Descriptions.Item>
              <Descriptions.Item label={t('total.amount')} span={3}>
                {numberToPrice(data?.price, defaultCurrency.symbol)}
              </Descriptions.Item>
              <Descriptions.Item label={t('total.delivery.fee')} span={3}>
                {numberToPrice(
                  data?.total_delivery_fee,
                  defaultCurrency.symbol
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('cashback')} span={3}>
                {numberToPrice(data?.cashback, defaultCurrency.symbol)}
              </Descriptions.Item>
              <Descriptions.Item label={t('coupon')} span={3}>
                {numberToPrice(data?.coupon, defaultCurrency.symbol)}
              </Descriptions.Item>
              <Descriptions.Item label={t('review')} span={3}>
                {data?.note}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title={t('payment')}
            style={{ height: '95%' }}
            loading={loading}
          >
            <Descriptions>
              <Descriptions.Item label={t('created.at')} span={3}>
                {data?.transaction?.created_at}
              </Descriptions.Item>
              <Descriptions.Item label={t('updated.at')} span={3}>
                {data?.transaction?.updated_at}
              </Descriptions.Item>
              <Descriptions.Item label={t('payment.type')} span={3}>
                {t(data?.transaction?.payment_system?.tag)}
              </Descriptions.Item>
              <Descriptions.Item label={t('amount')} span={3}>
                {numberToPrice(
                  data?.transaction?.price,
                  defaultCurrency.symbol
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('description')} span={3}>
                {data?.transaction?.status_description}
              </Descriptions.Item>
              <Descriptions.Item label={t('status')} span={3}>
                <Tag>{data?.transaction?.status}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            title={t('deliveryman')}
            style={{ height: '95%' }}
            loading={loading}
          >
            {data?.deliveryman ? (
              <Descriptions>
                <Descriptions.Item label={t('name')} span={3}>
                  {`${data?.deliveryman?.firstname}  ${data?.deliveryman?.lastname}`}
                </Descriptions.Item>
                <Descriptions.Item label={t('phone')} span={3}>
                  {data?.deliveryman?.phone}
                </Descriptions.Item>
                <Descriptions.Item label={t('email')} span={3}>
                  {data?.deliveryman?.email}
                </Descriptions.Item>
                <Descriptions.Item label={t('gender')} span={3}>
                  {data?.deliveryman?.gender}
                </Descriptions.Item>
                <Descriptions.Item label={t('rating')} span={3}>
                  <Rate
                    allowHalf
                    disabled
                    defaultValue={
                      Number(data?.deliveryman?.review?.rating) || 0
                    }
                    value={Number(data?.deliveryman?.review?.rating) || 0}
                  />
                </Descriptions.Item>
                <Descriptions.Item label={t('review')} span={3}>
                  {data?.deliveryman?.review?.comment || ''}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty />
            )}
          </Card>
        </Col>
      </Row>
      <Card title={`${t('order.details')} ${data?.id ? `#${data?.id}` : ''}`}>
        <Table
          columns={columns}
          dataSource={activeMenu.data?.details || []}
          expandable={{
            expandedRowRender,
            defaultExpandedRowKeys: ['0'],
          }}
          loading={loading}
          rowKey={(record) => record.id}
          pagination={false}
          scroll={{ x: true }}
        />
        {allOrderModal && (
          <AllOrderStatusModal
            orderDetails={data?.details?.[0]}
            handleCancel={() => setAllOrderModal(false)}
            visible={allOrderModal}
          />
        )}
        {orderDetails && (
          <OrderStatusModal
            orderDetails={orderDetails}
            handleCancel={handleCloseModal}
          />
        )}
        {orderDeliveryDetails && (
          <OrderDeliveryman
            orderDetails={orderDeliveryDetails}
            handleCancel={handleCloseModal}
          />
        )}
      </Card>
    </>
  );
}
