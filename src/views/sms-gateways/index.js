import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, Switch, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { Context } from '../../context/context';
import CustomModal from '../../components/modal';
import smsService from '../../services/smsGateways';
import SmsEditModal from './smsEditModal';
import { useTranslation } from 'react-i18next';
import TwilioModal from './twilioModal';

export default function SmsGateways() {
  const { t } = useTranslation();
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(null);
  const { setIsModalVisible } = useContext(Context);

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
    },
    {
      title: t('title'),
      dataIndex: 'title',
    },
    {
      title: t('from'),
      dataIndex: 'from',
    },
    {
      title: t('type'),
      dataIndex: 'type',
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => {
        return (
          <Switch
            onChange={() => {
              setIsModalVisible(true);
              setId(row.id);
            }}
            checked={active}
          />
        );
      },
    },
    {
      title: t('options'),
      dataIndex: 'options',
      render: (data, row) => (
        <Button
          type='primary'
          icon={<EditOutlined />}
          onClick={() => setModal(row)}
        />
      ),
    },
  ];

  function fetchSmsGateways() {
    setLoading(true);
    smsService
      .get()
      .then((res) => setData(res.data))
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchSmsGateways();
  }, []);

  const updateStatus = () => {
    setLoadingBtn(true);
    smsService
      .setActive(id)
      .then(() => {
        fetchSmsGateways();
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  return (
    <Card title={t('sms.gateway')}>
      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={data}
        pagination={false}
        loading={loading}
      />
      <CustomModal
        click={updateStatus}
        text={t('set.active.sms.gateway')}
        loading={loadingBtn}
      />
      {modal && modal.type === 'twilio' && (
        <TwilioModal
          modal={modal}
          handleCancel={() => setModal(null)}
          refetch={fetchSmsGateways}
        />
      )}
      {modal && modal.type !== 'twilio' && (
        <SmsEditModal
          modal={modal}
          handleCancel={() => setModal(null)}
          refetch={fetchSmsGateways}
        />
      )}
    </Card>
  );
}
