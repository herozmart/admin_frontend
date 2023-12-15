import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Modal,
  Row,
  Select,
  Spin,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { setCartData } from '../../../../redux/slices/cart';
import orderService from '../../../../services/seller/order';
import transactionService from '../../../../services/transaction';
import shopService from '../../../../services/shop';
import { getCartData } from '../../../../redux/selectors/cartSelector';

export default function DeliveryModalAdmin({
  visibility,
  handleCancel,
  handleSave,
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const { cartShops, total, coupons, currency, currentBag } = useSelector(
    (state) => state.cart,
    shallowEqual
  );
  const data = useSelector((state) => getCartData(state.cart));
  const { currencies } = useSelector((state) => state.currency, shallowEqual);
  const { myShop } = useSelector((state) => state.myShop, shallowEqual);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const orderCreate = (body) => {
    const payment = {
      payment_sys_id: data.paymentType.value,
    };
    setLoading(true);
    orderService
      .create(body)
      .then(({ data }) => createTransaction(data.id, payment))
      .catch(() => setLoading(false));
  };

  function createTransaction(id, data) {
    transactionService
      .create(id, data)
      .then((res) => handleSave(res.data.id))
      .finally(() => setLoading(false));
  }

  const onFinish = (values) => {
    console.log('values => ', values);
    const deliveryList = values.deliveries;
    const list = deliveryList.map((item) => ({
      delivery_type_id: item.delivery,
      delivery_address_id: data.address?.value,
      delivery_date: moment(item.delivery_date).format('YYYY-MM-DD'),
      delivery_time: item.delivery_time,
      delivery_fee: data.deliveries.find((el) => el.id === item.delivery)
        ?.price,
    }));
    const deliveryPrice = list.reduce(
      (total, item) => (total += item.delivery_fee),
      0
    );
    const shops = [
      {
        ...list[0],
        shop_id: cartShops[0].shop_id,
        tax: total.order_tax,
        coupon: coupons[0] ? coupons[0].coupon : '',
        products: cartShops.map((product) => ({
          id: product.id,
          price: product.price,
          qty: product.qty,
          tax: product.tax,
          discount: product.discount,
          total_price: product.total_price,
        })),
      },
    ];
    const totalPrice = deliveryPrice + total.order_total;
    const body = {
      shops,
      user_id: data.user.value,
      total: totalPrice,
      currency_id: currency.id,
      rate: currencies.find((item) => item.id === currency.id)?.rate,
    };
    console.log('shops => ', shops);
    console.log('values => ', values);
    console.log('body => ', body);
    orderCreate(body);
  };

  useEffect(() => {
    if (cartShops.length) {
      form.setFieldsValue({
        deliveries: cartShops.map((item) => ({
          shop_id: item.id,
          delivery: '',
          delivery_date: '',
          delivery_time: '',
        })),
      });
    }
  }, [cartShops]);

  function getShopDeliveries(ids) {
    setLoading(true);
    const params = formatShopIds(ids);
    shopService
      .getShopDeliveries(params)
      .then((res) =>
        dispatch(setCartData({ deliveries: res.data, bag_id: currentBag }))
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (cartShops.length) {
      getShopDeliveries([cartShops[0].shop_id]);
    }
  }, [cartShops]);

  function formatShopIds(list) {
    const result = list.map((item, index) => ({
      [`shops[${index}]`]: item,
    }));
    return Object.assign({}, ...result);
  }

  function getHours(shop) {
    let hours = [];
    const timeFrom = moment(shop.open_time, 'HH:mm').hour();
    const timeTo = moment(shop.close_time, 'HH:mm').hour();
    if (timeFrom === timeTo) {
      for (let index = 0; index < 24; index++) {
        const hour = {
          label: moment(index, 'HH').format('HH:mm'),
          value: moment(index, 'HH').format('HH:mm'),
        };
        hours.push(hour);
      }
      return hours;
    }
    for (let index = timeFrom + 1; index < timeTo; index++) {
      const hour = {
        label: moment(index, 'HH').format('HH:mm'),
        value: moment(index, 'HH').format('HH:mm'),
      };
      hours.push(hour);
    }
    return hours;
  }

  function formatDeliveries(list) {
    return list.map((item) => ({
      label: item.translation?.title,
      value: item.id,
    }));
  }

  return (
    <Modal
      visible={visibility}
      title={t('shipping.info')}
      onCancel={handleCancel}
      footer={[
        <Button type='primary' onClick={() => form.submit()}>
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
      className='large-modal'
    >
      <Form form={form} layout='vertical' onFinish={onFinish}>
        {loading && (
          <div className='loader'>
            <Spin />
          </div>
        )}
        <Form.List name='deliveries' className='d-flex'>
          {(fields) => {
            return (
              <Row gutter={12}>
                {fields.map((field, index) => (
                  <Col span={12} key={field.key}>
                    <Card
                      title={`${cartShops[index]?.translation?.title} ${t(
                        'shop'
                      )}`}
                      type='inner'
                      size='small'
                    >
                      <Row gutter={12}>
                        <Col span={24}>
                          <Form.Item
                            name={[index, 'delivery']}
                            label={t('delivery')}
                            rules={[
                              { required: true, message: t('required.field') },
                            ]}
                          >
                            <Select
                              placeholder={t('select.delivery')}
                              options={formatDeliveries(data.deliveries)}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Row gutter={12}>
                            <Col span={12}>
                              <Form.Item
                                name={[index, 'delivery_date']}
                                label={t('delivery.date')}
                                rules={[
                                  {
                                    required: true,
                                    message: t('required.field'),
                                  },
                                ]}
                              >
                                <DatePicker
                                  className='w-100'
                                  disabledDate={(current) =>
                                    moment().add(-1, 'days') >= current
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                label={`${t('delivery.time')} (${t('up.to')})`}
                                name={[index, 'delivery_time']}
                                rules={[
                                  {
                                    required: true,
                                    message: t('required.field'),
                                  },
                                ]}
                              >
                                <Select options={getHours(myShop)} />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            );
          }}
        </Form.List>
      </Form>
    </Modal>
  );
}
