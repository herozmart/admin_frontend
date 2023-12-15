import {
  Card,
  Col,
  Row,
  Space,
  Typography,
  Table,
  Tag,
  Button,
  Select,
} from 'antd';
import React, { useContext } from 'react';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { useEffect } from 'react';
import ReportService from '../../services/reports';
import { addMenu, disableRefetch } from '../../redux/slices/menu';
import FilterColumns from '../../components/filter-column';
import { fetchStockProduct } from '../../redux/slices/report/stock';
import useDidUpdate from '../../helpers/useDidUpdate';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
const { Title } = Typography;
const ReportStock = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const options = [
    { value: null, label: 'All products' },
    { value: 'in_stock', label: 'In stock' },
    { value: 'low_stock', label: 'Low stock' },
    { value: 'out_of_stock', label: 'Out of stock' },
  ];
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const {
    loading,
    productList: reportProducts,
    error,
  } = useSelector((state) => state.stockReport, shallowEqual);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState(false);
  const goToProductReport = (row) => {
    dispatch(
      addMenu({
        url: `report/products`,
        id: 'report.products',
        name: t('report.products'),
      })
    );
    navigate(`/report/products?product_id=${row.id}`);
  };
  const [columns, setColumns] = useState([
    {
      title: 'Product title',
      dataIndex: 'product_translation_title',
      key: 'product_translation_title',
      render: (_, data) => {
        return (
          <a onClick={() => goToProductReport(data)}>
            {data?.product_translation_title}
          </a>
        );
      },
      is_show: true,
    },
    {
      title: 'Bar code',
      dataIndex: 'product_bar_code',
      key: 'product_bar_code',
      is_show: true,
      render: (_, data) => {
        return <>{data?.product_bar_code || '-'}</>;
      },
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, data) => <Tag key={data.id}>{data.status}</Tag>,
      is_show: true,
    },
    {
      title: 'Stock',
      key: 'stock',
      dataIndex: 'quantity',
      is_show: true,
    },
  ]);
  const fetchProduct = (page, perPage) => {
    dispatch(
      fetchStockProduct({
        page,
        perPage,
        status,
      })
    );
  };
  useDidUpdate(() => {
    fetchProduct();
  }, [status]);
  useEffect(() => {
    if (activeMenu.refetch) {
      fetchProduct();
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    fetchProduct(page, perPage);
  };
  const excelExport = () => {
    setDownloading(true);
    ReportService.getStocks({ export: 'excel', status })
      .then((res) => {
        const body = res.data.link;
        window.location.href = body;
      })
      .finally(() => setDownloading(false));
  };
  const handleSelector = (e) => {
    setStatus(e);
  };

  const filteredColumns = columns?.filter((item) => item.is_show);
  return (
    <>
      <Row gutter={24} className='mb-3'>
        <Col span={6}>
          <Select
            style={{ width: '100%' }}
            onChange={handleSelector}
            options={options}
            defaultValue={null}
          />
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <Card>
            <Row gutter={24} className='align-items-center mb-2'>
              <Col span={21}>
                <Title level={2} className='mb-0'>
                  {t('Stock')}
                </Title>
              </Col>
              <Col span={3}>
                <Space>
                  <FilterColumns columns={columns} setColumns={setColumns} />
                </Space>
              </Col>
            </Row>
            <Table
              rowSelection={filteredColumns?.length ? rowSelection : null}
              columns={filteredColumns}
              dataSource={reportProducts.data || []}
              rowKey={(row) => row.id}
              loading={loading}
              pagination={{
                pageSize: reportProducts?.per_page,
                page: reportProducts?.current_page || 1,
                total: reportProducts?.total,
                defaultCurrent: 1,
              }}
              onChange={onChangePagination}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ReportStock;
