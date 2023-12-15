import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Image,
  Tag,
  Button,
  Space,
  Descriptions,
  Row,
  Steps,
  Col,
  Empty,
  Rate,
} from 'antd';
import {
  BorderlessTableOutlined,
  EditOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import orderService from '../../services/order';
import getImage from '../../helpers/getImage';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import OrderStatusModal from './orderStatusModal';
import OrderDeliveryman from './orderDeliveryman';
import { fetchDeliverymans } from '../../redux/slices/deliveryman';
import { useTranslation } from 'react-i18next';
import numberToPrice from '../../helpers/numberToPrice';
import { clearOrder } from '../../redux/slices/order';
import AllOrderStatusModal from './allOrderStatus';
import { allStatuses } from '../../constants/OrderStatus';
const { Step } = Steps;
export default function OrderDetails() {
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { allShops: shops } = useSelector(
    (state) => state.allShops,
    shallowEqual
  );
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const data = activeMenu.data;
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [allOrderModal, setAllOrderModal] = useState(false);
  const [orderDeliveryDetails, setOrderDeliveryDetails] = useState(null);
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
            <Tag color='blue'>{t(status)}</Tag>
          ) : status == 'canceled' ? (
            <Tag color='error'>{t(status)}</Tag>
          ) : (
            <Tag color='cyan'>{t(status)}</Tag>
          )}
          {(data?.status === 'new' ||
            data?.status === 'ready' ||
            data?.status === 'on_a_way') &&
            (status === 'new' ||
              status === 'ready' ||
              status === 'on_a_way') && (
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
    // {
    //   title: t('delivery.date.&.time'),
    //   dataIndex: 'delivery',
    //   key: 'delivery',
    //   render: (delivery, row) => (
    //     <div>
    //       {row.delivery_date} {row.delivery_time}
    //     </div>
    //   ),
    // },
    {
      title: t('amount'),
      dataIndex: 'price',
      key: 'price',
      render: (price, row) =>
        numberToPrice(price + (row.coupon?.price ?? 0), defaultCurrency.symbol),
    },
    {
      title: t('shop.tax'),
      dataIndex: 'tax',
      key: 'tax',
      render: (tax) => numberToPrice(tax, defaultCurrency.symbol),
    },
    // {
    //   title: t('delivery.fee'),
    //   dataIndex: 'total_delivery_fee',
    //   key: 'total_delivery_fee',
    //   render: (_, data) => {
    //     console.log(data);
    //   },
    // },
    {
      title: t('coupon'),
      dataIndex: 'coupon',
      key: 'coupon',
      render: () => {
        const { coupon } = data || {};
        return numberToPrice(coupon?.price, defaultCurrency.symbol);
      },
    },
    // {
    //   title: t('payment.status'),
    //   dataIndex: 'transaction',
    //   key: 'transaction',
    //   render: () => {
    //     const status = data?.transaction?.status;
    //     return (
    //       <div>
    //         {status === 'progress' ? (
    //           <Tag color='gold'>{t(status)}</Tag>
    //         ) : status === 'rejected' ? (
    //           <Tag color='error'>{t(status)}</Tag>
    //         ) : (
    //           <Tag color='cyan'>{t(status)}</Tag>
    //         )}
    //       </div>
    //     );
    //   },
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
        const coupon = data.coupon;
        const createdAt = data.created_at;
        const status = data.status;
        const total_delivery_fee = data.total_delivery_fee;
        const transaction = data.transaction;
        const note = data.note;
        const deliveryman = data.deliveryman;
        const details = data.details.map((item) => ({
          title: shops.find((el) => el.id === item.shop_id)?.translation?.title,
          ...item,
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
              coupon,
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
      dispatch(fetchDeliverymans({ active: 1 }));
    }
  }, [activeMenu.refetch]);

  function getImageFromStock(stock) {
    const stockImage = stock.extras.find((item) => item.group.type === 'image');
    if (!!stockImage) {
      return stockImage.value;
    }
    return stock.product.img;
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

  const goToEdit = () => {
    dispatch(clearOrder());
    dispatch(
      addMenu({
        url: `order/${id}`,
        id: 'order_edit',
        name: t('edit.order'),
      })
    );
    navigate(`/order/${id}`);
  };
  console.log(data);
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
                {numberToPrice(data?.coupon?.price, defaultCurrency.symbol)}
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

      <Card
        title={`${t('order.details')} ${data?.id ? `#${data?.id}` : ''}`}
        extra={
          <Space>
            {(data?.status === 'new' ||
              data?.status === 'ready' ||
              data?.status === 'on_a_way') && (
              <Button
                type='primary'
                icon={<EditOutlined />}
                onClick={() => setAllOrderModal((prev) => !prev)}
              >
                {t('Status change')}
              </Button>
            )}
            {Boolean(
              data?.status === 'ready' || data?.status === 'on_the_way'
            ) && (
              <Button
                type='primary'
                icon={<EditOutlined />}
                onClick={() => setOrderDeliveryDetails(data)}
              >
                {t('add.deliveryman')}
              </Button>
            )}
            {/* <Button type='primary' icon={<EditOutlined />} onClick={goToEdit}>
              {t('edit')}
            </Button> */}
          </Space>
        }
      >
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
          scroll={{
            x: 1440,
          }}
        />
        {orderDetails && (
          <OrderStatusModal
            orderDetails={orderDetails}
            handleCancel={handleCloseModal}
          />
        )}
        {allOrderModal && (
          <AllOrderStatusModal
            orderDetails={data}
            handleCancel={() => setAllOrderModal(false)}
            visible={allOrderModal}
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
