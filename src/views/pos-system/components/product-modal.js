import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Descriptions,
  Form,
  Image,
  Modal,
  Row,
  Space,
} from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import getImage from '../../../helpers/getImage';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import numberToPrice from '../../../helpers/numberToPrice';
import { toast } from 'react-toastify';
import getImageFromStock from '../../../helpers/getImageFromStock';
import { getExtras, sortExtras } from '../../../helpers/getExtras';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../../../redux/slices/cart';
import numberToQuantity from '../../../helpers/numberToQuantity';

export default function ProductModal({ extrasModal: data, setExtrasModal }) {
  const { t } = useTranslation();
  const [currentStock, setCurrentStock] = useState(data.stock);
  const [counter, setCounter] = useState(data.quantity || data.min_qty);
  const [extras, setExtras] = useState([]);
  const [stock, setStock] = useState([]);
  const [showExtras, setShowExtras] = useState(null);
  const [extrasIds, setExtrasIds] = useState([]);

  const { currentBag, currency } = useSelector(
    (state) => state.cart,
    shallowEqual
  );
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  console.log('data => ', data);
  console.log('current stock => ', currentStock);
  console.log('showExtras => ', showExtras);
  console.log('extrasIds => ', extrasIds);

  useEffect(() => {
    if (showExtras?.stock) {
      setCurrentStock({ ...showExtras.stock, extras: extrasIds });
    }
  }, [showExtras]);

  useEffect(() => {
    const myData = sortExtras(data);
    setExtras(myData.extras);
    setStock(myData.stock);
    setShowExtras(getExtras('', myData.extras, myData.stock));
    getExtras('', myData.extras, myData.stock).extras?.forEach((element) => {
      setExtrasIds((prev) => [...prev, element[0]]);
    });
  }, [data]);

  const handleExtrasClick = (e) => {
    const index = extrasIds.findIndex(
      (item) => item.extra_group_id === e.extra_group_id
    );
    let array = extrasIds;
    if (index > -1) array = array.slice(0, index);
    array.push(e);
    const nextIds = array.map((item) => item.id).join(',');
    var extrasData = getExtras(nextIds, extras, stock);
    setShowExtras(extrasData);
    extrasData.extras?.forEach((element) => {
      const index = extrasIds.findIndex((item) =>
        element[0].extra_group_id != e.extra_group_id
          ? item.extra_group_id === element[0].extra_group_id
          : item.extra_group_id === e.extra_group_id
      );
      if (element[0].level >= e.level) {
        var itemData =
          element[0].extra_group_id != e.extra_group_id ? element[0] : e;
        if (index == -1) array.push(itemData);
        else {
          array[index] = itemData;
        }
      }
    });
    setExtrasIds(array);
  };

  const handleOk = () => {
    console.log('ok');
  };

  const handleCancel = () => {
    setExtrasModal(false);
  };

  const onFinish = (values) => {
    const orderItem = {
      ...data,
      stock: currentStock,
      quantity: counter,
      id: currentStock.id,
      img: getImageFromStock(currentStock) || data.img,
      bag_id: currentBag,
    };
    if (orderItem.quantity > currentStock.quantity) {
      toast.warning(
        `${t('you.cannot.order.more.than')} ${currentStock.quantity}`
      );
      return;
    }
    dispatch(addToCart(orderItem));
    setExtrasModal(null);
  };

  function addCounter() {
    if (counter === currentStock?.quantity) {
      return;
    }
    if (counter === data.max_qty) {
      return;
    }
    setCounter((prev) => prev + 1);
  }

  function reduceCounter() {
    if (counter === 1) {
      return;
    }
    if (counter <= data.min_qty) {
      return;
    }
    setCounter((prev) => prev - 1);
  }

  return (
    <Modal
      visible={!!data}
      title={data.translation?.title}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key='add-product' type='primary' onClick={() => form.submit()}>
          {t('add')}
        </Button>,
        <Button key='cancel-product' type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{ stock: data.stock?.id }}
      >
        <Row gutter={24}>
          <Col span={8}>
            <Image
              src={getImage(getImageFromStock(currentStock) || data.img)}
              alt={data.translation?.title}
              height={200}
              style={{ objectFit: 'contain' }}
            />
          </Col>
          <Col span={16}>
            <Descriptions title={data.translation?.title}>
              <Descriptions.Item label={t('price')} span={3}>
                <div className={currentStock?.discount ? 'strike' : ''}>
                  {numberToPrice(currentStock?.price, currency.symbol)}
                </div>
                {currentStock?.discount ? (
                  <div className='ml-2 font-weight-bold'>
                    {numberToPrice(currentStock?.total_price, currency.symbol)}
                  </div>
                ) : (
                  ''
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('in.stock')} span={3}>
                {numberToQuantity(currentStock?.quantity, data.unit)}
              </Descriptions.Item>
              <Descriptions.Item label={t('tax')} span={3}>
                {numberToPrice(currentStock?.tax, currency.symbol)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
        {showExtras?.extras?.map((item, idx) => (
          <div key={`shop-${idx}`} className='extra-group'>
            <Space key={'extra-group' + idx} className='extras-select'>
              {item.map((el) => {
                if (el.group.type === 'color') {
                  return (
                    <span
                      className={`extras-color-wrapper ${
                        !!extrasIds.find((extra) => extra.id === el.id)
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => handleExtrasClick(el)}
                    >
                      <i
                        className='extras-color'
                        style={{ backgroundColor: el.value }}
                      />
                    </span>
                  );
                } else if (el.group.type === 'text') {
                  return (
                    <span
                      className={`extras-text rounded ${
                        !!extrasIds.find((extra) => extra.id === el.id)
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => handleExtrasClick(el)}
                    >
                      {el.value}
                    </span>
                  );
                }
                return (
                  <span
                    className={`extras-image rounded ${
                      !!extrasIds.find((extra) => extra.id === el.id)
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleExtrasClick(el)}
                  >
                    <img src={getImage(el.value)} alt='extra' />
                  </span>
                );
              })}
            </Space>
          </div>
        ))}
        <Row gutter={12} className='mt-3'>
          <Col span={24}>
            <Space>
              <Button
                type='primary'
                icon={<MinusOutlined />}
                onClick={reduceCounter}
              />
              {counter}
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={addCounter}
              />
            </Space>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
