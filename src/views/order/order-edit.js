import React, { useEffect, useState } from 'react';
import { Form, PageHeader, Row, Col, Button, Spin, Space } from 'antd';
import '../../assets/scss/page/order-add.scss';
import UserInfo from './user-info';
import DeliveryInfo from './delivery-info';
import ProductInfo from './product-info';
import PreviewInfo from './preview-info';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import orderService from '../../services/order';
import moment from 'moment';
import {
  clearOrder,
  setOrderCurrency,
  setOrderData,
  setOrderItems,
} from '../../redux/slices/order';
import { useNavigate, useParams } from 'react-router-dom';
import getImageFromStock from '../../helpers/getImageFromStock';
import { disableRefetch, removeFromMenu } from '../../redux/slices/menu';
import { fetchOrders } from '../../redux/slices/orders';
import { useTranslation } from 'react-i18next';
import transactionService from '../../services/transaction';
import calculateTotalPrice from '../../helpers/calculateTotalPrice';
import DeliveryInfoAdmin from './delivery-info-admin';
import exportService from '../../services/export';
import download from 'downloadjs';
import { DownloadOutlined, SaveOutlined } from '@ant-design/icons';

export default function OrderEdit() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingBtn, setLoadingBtn] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { orderShops, data, total, coupons } = useSelector(
    (state) => state.order,
    shallowEqual
  );
  const { currencies } = useSelector((state) => state.currency, shallowEqual);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { delivery } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual
  );

  useEffect(() => {
    return () => {
      const formData = form.getFieldsValue(true);
      const data = {
        ...formData,
        deliveries: formData.deliveries.map((item) => ({
          ...item,
          delivery_date: item.delivery_date
            ? moment(item.delivery_date).format('YYYY-MM-DD')
            : undefined,
        })),
      };
      dispatch(setOrderData(data));
    };
  }, []);

  console.log('data => ', data);

  function formatUser(user) {
    return {
      label: user?.firstname + ' ' + user?.lastname,
      value: user.id,
    };
  }
  function formatAddress(item) {
    if (!item) return null;
    return {
      label: item.address,
      value: item.id,
    };
  }
  function formatPayment(item) {
    if (!item) return null;
    return {
      label: item.translation?.title,
      value: item.id,
    };
  }
  function formatDelivery(list) {
    return list.map((item) => ({
      delivery: {
        label: item.delivery_type.translation.title,
        value: item.delivery_type.id,
      },
      delivery_date: item.delivery_date,
      delivery_time: item.delivery_time,
      shop_id: item.delivery_type.shop_id,
      delivery_fee: item.delivery_fee,
    }));
  }

  function fetchOrder() {
    setLoading(true);
    orderService
      .getById(id)
      .then((res) => {
        const order = res.data;
        dispatch(setOrderCurrency(order.currency));
        dispatch(setOrderData({ deliveries: formatDelivery(order.details) }));
        const items = order.details.flatMap((item) =>
          item.order_stocks.map((el) => ({
            ...el.stock.product,
            ...el.stock,
            quantity: el.quantity,
            stock: el.stock,
            img: getImageFromStock(el.stock) || el.stock.product.img,
            product: undefined,
          }))
        );
        dispatch(setOrderItems(items));
        form.setFieldsValue({
          user: formatUser(order.user),
          currency_id: order.currency.id,
          address: formatAddress(order.details[0].delivery_address),
          payment_type: formatPayment(
            order.details[0].transaction?.payment_system
          ),
          note: order.note,
        });
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchOrder();
    }
  }, [activeMenu.refetch]);

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => {
        setOrderId(res.data.id);
        dispatch(clearOrder());
      })
      .finally(() => setLoadingBtn(false));
  }

  const orderUpdate = (data) => {
    const payment = {
      payment_sys_id: data.payment_type,
    };
    setLoadingBtn(true);
    orderService
      .update(id, data)
      .then((res) => createTransaction(res.data.id, payment))
      .catch(() => setLoadingBtn(false));
  };

  const onFinish = (values) => {
    const deliveryList = values.deliveries;
    const list = deliveryList.map((item) => ({
      delivery_type_id: item.delivery.value,
      shop_id: item.shop_id,
      delivery_address_id: values.address.value,
      delivery_date: moment(item.delivery_date).format('YYYY-MM-DD'),
      delivery_time: item.delivery_time,
      delivery_fee:
        delivery === '1'
          ? activeMenu.data
              ?.find((el) => el.id === item.shop_id)
              .deliveries.find((el) => el.id === item.delivery.value)?.price
          : activeMenu.data?.find((el) => el.id === item.delivery.value)?.price,
    }));
    const deliveryPrice = list.reduce(
      (total, item) => (total += item.delivery_fee),
      0
    );
    const shops = orderShops.map((item) => ({
      ...list.find((el) => el.shop_id === item.id),
      tax: calculateTotalPrice(item).shopTax,
      coupon: coupons.find((el) => el.shop_id === item.id)?.coupon,
      products: item.products.map((product) => ({
        id: product.id,
        price: product.price,
        qty: product.qty,
        tax: product.tax,
        discount: product.discount,
        total_price: product.total_price,
      })),
    }));
    const totalPrice = deliveryPrice + total.order_total;
    const body = {
      shops,
      user_id: values.user?.value,
      total: totalPrice,
      currency_id: values.currency_id,
      rate: currencies.find((item) => item.id === values.currency_id)?.rate,
      payment_type: values.payment_type.value,
      note: values.note,
      delivery_id: list?.delivery_type_id,
    };
    orderUpdate(body);
  };

  const handleCloseInvoice = () => {
    setOrderId(null);
    const nextUrl = 'orders';
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    navigate(`/${nextUrl}`);
    dispatch(fetchOrders());
  };

  function getInvoiceFile(id) {
    setDownloading(true);
    exportService
      .orderExport(id)
      .then((res) => {
        download(res, `invoice_${id}.pdf`, 'application/pdf');
      })
      .finally(() => setDownloading(false));
  }
  return (
    <>
      <PageHeader
        title={t('edit.order')}
        extra={
          <Space>
            <Button
              loading={downloading}
              onClick={() => getInvoiceFile(id)}
              icon={<DownloadOutlined />}
            >
              {t('download')}
            </Button>
            <Button
              type='primary'
              icon={<SaveOutlined />}
              loading={loadingBtn}
              onClick={() => form.submit()}
              disabled={!orderShops.length}
            >
              {t('save')}
            </Button>
          </Space>
        }
      />
      <Form
        name='order-form'
        form={form}
        layout='vertical'
        onFinish={onFinish}
        className='order-add'
        initialValues={{
          user: data.user || null,
          address: data.address || null,
          currency_id: data.currency.id,
          payment_type: data.payment_type || null,
          deliveries: data.deliveries.map((item) => ({
            ...item,
            delivery_date: moment(item.delivery_date),
          })),
          note: data.note,
        }}
      >
        <Row gutter={24} hidden={loading}>
          <Col span={16}>
            <ProductInfo form={form} />
          </Col>
          <Col span={8}>
            <UserInfo form={form} />
            {delivery === '1' ? (
              <DeliveryInfo form={form} />
            ) : (
              <DeliveryInfoAdmin form={form} />
            )}
          </Col>
        </Row>
        {loading && (
          <div className='loader'>
            <Spin />
          </div>
        )}
      </Form>
      {orderId ? (
        <PreviewInfo orderId={orderId} handleClose={handleCloseInvoice} />
      ) : (
        ''
      )}
    </>
  );
}
