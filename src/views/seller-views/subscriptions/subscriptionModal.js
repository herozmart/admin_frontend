import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Modal, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import subscriptionService from '../../../services/seller/subscriptions';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { fetchRestPayments } from '../../../redux/slices/payment';
import Loading from '../../../components/loading';
import { WalletOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { fetchMyShop } from '../../../redux/slices/myShop';

export default function SellerSubscriptionModal({ modal, handleCancel }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { payments, loading } = useSelector(
    (state) => state.payment,
    shallowEqual
  );
  const { seller } = useSelector((state) => state.myShop.myShop, shallowEqual);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [paymentType, setPaymentType] = useState({});

  const handleOk = () => {
    console.log('ok');
  };

  useEffect(() => {
    if (!payments.length) {
      dispatch(fetchRestPayments());
    }
  }, []);

  const handleSubmit = () => {
    if (!paymentType.id) {
      toast.warning(t('please.select.payment.type'));
      return;
    }
    if (paymentType.tag === 'wallet' && seller?.wallet?.price < modal.price) {
      toast.warning(t('insufficient.balance'));
      return;
    }
    setLoadingBtn(true);
    subscriptionService
      .attach(modal.id)
      .then(({ data }) => transactionCreate(data.id))
      .error(() => setLoadingBtn(false));
  };

  function transactionCreate(id) {
    const payload = {
      payment_sys_id: paymentType.id,
    };
    subscriptionService
      .transactionCreate(id, payload)
      .then(() => {
        handleCancel();
        toast.success(t('successfully.purchased'));
        dispatch(fetchMyShop());
      })
      .finally(() => setLoadingBtn(false));
  }

  const selectPayment = (type) => {
    setPaymentType(type);
  };

  return (
    <Modal
      visible={!!modal}
      title={t('purchase.subscription')}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button
          type='primary'
          onClick={handleSubmit}
          loading={loadingBtn}
          key='save-btn'
        >
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel} key='cancel-btn'>
          {t('cancel')}
        </Button>,
      ]}
    >
      {!loading ? (
        <Row gutter={12}>
          {payments
            .filter((item) => item.tag !== 'cash')
            .map((item) => (
              <Col span={8}>
                <Card
                  className={`payment-card ${
                    paymentType.tag === item.tag ? 'active' : ''
                  }`}
                  onClick={() => selectPayment(item)}
                >
                  {item.tag === 'wallet' ? (
                    <div className='payment-icon'>
                      <WalletOutlined />
                    </div>
                  ) : (
                    <div className='payment-icon' />
                  )}
                  <div className='font-weight-bold mt-2'>
                    {t(item.translation?.title)}
                  </div>
                </Card>
              </Col>
            ))}
        </Row>
      ) : (
        <Loading />
      )}
    </Modal>
  );
}
