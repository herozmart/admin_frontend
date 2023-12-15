import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Select } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import orderService from '../../../services/seller/order';
import { setRefetch } from '../../../redux/slices/menu';
import { allStatuses } from '../../../constants/OrderStatus';

export default function OrderStatusModal({ orderDetails: data, handleCancel }) {
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState(allStatuses);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const statusIndex = allStatuses.findIndex(
      (item) => item.id == data?.status
    );
    let newStatuses = [
      allStatuses[statusIndex],
      allStatuses[statusIndex + 1],
      allStatuses[allStatuses.length - 1],
    ];
    if (
      data?.status == '10' ||
      data?.status == '11' ||
      data?.status == '12' ||
      data?.status == '13'
    ) {
      setDisabled(true);
    }
    // if (statusIndex == 0) {
    //   newStatuses = [allStatuses[7], allStatuses[allStatuses.length - 1]];
    // } else if (statusIndex == 7) {
    //   newStatuses = [allStatuses[8], allStatuses[allStatuses.length - 1]];
    // } else {
    //   setDisabled(true);
    // }
    if (statusIndex < 0) {
      newStatuses = [
        allStatuses[statusIndex + 1],
        allStatuses[allStatuses.length - 1],
      ];
    }
    setStatuses(newStatuses);
  }, [data]);

  const handleOk = () => {
    console.log('ok');
  };

  const onFinish = (values) => {
    setLoading(true);
    const params = { ...values };
    orderService
      .updateStatus(data.id, params)
      .then(() => {
        handleCancel();
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      visible={!!data}
      title={data.title}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button type='primary' onClick={() => form.submit()} loading={loading}>
          {t('save')}
        </Button>,
        <Button type='default' onClick={handleCancel}>
          {t('cancel')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        initialValues={{ status: data.status }}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={t('status')}
              name='status'
              rules={[
                {
                  required: true,
                  message: t('required'),
                },
              ]}
            >
              <Select disabled={disabled}>
                {statuses.map((item, idx) => (
                  <Select.Option key={item + idx} value={item?.id}>
                    {t(item.label)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
