import React, { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Space, Switch, Table } from 'antd';
import { toast } from 'react-toastify';
import GlobalContainer from '../../components/global-container';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addMenu, disableRefetch, setMenuData } from '../../redux/slices/menu';
import useDidUpdate from '../../helpers/useDidUpdate';
import formatSortType from '../../helpers/formatSortType';
import { useTranslation } from 'react-i18next';
import faqService from '../../services/faq';
import { fetchFaqs } from '../../redux/slices/faq';

export default function FAQ() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const goToEdit = (row) => {
    dispatch(
      addMenu({
        url: `faq/${row.uuid}`,
        id: `faq_${row.uuid}`,
        name: t('edit.faq'),
      })
    );
    navigate(`/faq/${row.uuid}`);
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: t('question'),
      dataIndex: 'translation',
      key: 'translation',
      render: (translation) => translation?.question,
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('created.at'),
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      render: (active, row) => (
        <Switch
          checked={active}
          onChange={() => {
            setId(row.uuid);
            setIsDelete(false);
            setIsModalVisible(true);
          }}
        />
      ),
    },
    {
      title: t('options'),
      key: 'options',
      dataIndex: 'options',
      render: (data, row) => {
        return (
          <Space>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => goToEdit(row)}
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                setId(row.uuid);
                setIsDelete(true);
                setIsModalVisible(true);
              }}
            />
          </Space>
        );
      },
    },
  ];

  const { setIsModalVisible } = useContext(Context);
  const [id, setId] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { faqs, meta, loading, params } = useSelector(
    (state) => state.faq,
    shallowEqual
  );

  const faqDelete = () => {
    setLoadingBtn(true);
    faqService
      .delete(id)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(fetchFaqs());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  const faqSetActive = () => {
    setLoadingBtn(true);
    faqService
      .setActive(id)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(fetchFaqs());
        setIsModalVisible(false);
      })
      .finally(() => setLoadingBtn(false));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchFaqs());
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    const data = activeMenu.data;
    const paramsData = {
      sort: data?.sort,
      column: data?.column,
      perPage: data?.perPage,
      page: data?.page,
    };
    dispatch(fetchFaqs(paramsData));
  }, [activeMenu.data]);

  function onChangePagination(pagination, filters, sorter) {
    const { pageSize: perPage, current: page } = pagination;
    const { field: column, order } = sorter;
    const sort = formatSortType(order);
    dispatch(
      setMenuData({ activeMenu, data: { perPage, page, column, sort } })
    );
  }

  return (
    <GlobalContainer
      headerTitle={t('faqs')}
      navLInkTo={'/faq/add'}
      buttonTitle={t('add.faq')}
    >
      <Table
        columns={columns}
        dataSource={faqs}
        pagination={{
          pageSize: params.perPage,
          page: params.page,
          total: meta.total,
          defaultCurrent: params.page,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
      <CustomModal
        click={isDelete ? faqDelete : faqSetActive}
        text={isDelete ? t('delete.faq') : t('set.active.faq')}
        loading={loadingBtn}
      />
    </GlobalContainer>
  );
}
