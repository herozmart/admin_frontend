import {
  Card,
  Col,
  Row,
  Space,
  Typography,
  Table,
  Divider,
  Dropdown,
  Menu,
  Switch,
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { addMenu, disableRefetch } from '../../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { ReportContext } from '../../../context/report';
import useDidUpdate from '../../../helpers/useDidUpdate';
import { fetchOverviewProduct } from '../../../redux/slices/report/overview';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getReportValue } from '../../../helpers/getReportPrice';

const { Text, Title } = Typography;
const LeaderBoard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { date_from, date_to, by_time, sellers, shops } =
    useContext(ReportContext);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { loading, productList } = useSelector(
    (state) => state.overviewReport,
    shallowEqual
  );
  const { defaultCurrency } = useSelector(
    (state) => state.currency,
    shallowEqual
  );
  const [leaderboards, setLeaderboards] = useState(['products', 'categories']);
  const goToShow = (uuid) => {
    dispatch(
      addMenu({
        url: `user/${uuid}`,
        id: 'user',
        name: t('edit.user'),
      })
    );
    navigate(`/user/${uuid}`);
  };
  const goToProduct = (id) => {
    dispatch(
      addMenu({
        url: `/report/products/${id}`,
        id: 'products',
        name: t('report.products'),
      })
    );
    navigate(`/report/products?product_id=${id}`);
  };
  const goToCategory = (id) => {
    dispatch(
      addMenu({
        url: `/report/products/${id}`,
        id: 'products',
        name: t('report.products'),
      })
    );
    navigate(`/report/products?category_id=${id}`);
  };
  const goToShop = (id) => {
    dispatch(
      addMenu({
        url: `/shop/${id}`,
        id: 'shop',
        name: t('edit.shop'),
      })
    );
    navigate(`/shop/${id}`);
  };
  function onChange(checked) {
    if (leaderboards.includes(checked.value)) {
      const newArray = leaderboards.filter((item) => item != checked.value);
      setLeaderboards(newArray);
    } else {
      setLeaderboards((prev) => [...prev, checked.value]);
    }
  }
  const leaderboardsType = [
    { value: 'products', label: 'Products' },
    { value: 'categories', label: 'Category' },
    { value: 'customers', label: 'Customers' },
    { value: 'shops', label: 'Shops' },
  ];
  const menuLeaderboards = (
    <Menu>
      {leaderboardsType?.map((item, key) => (
        <Menu.Item key={key}>
          <Space className='d-flex justify-content-between'>
            <Text>{item.label}</Text>
            <Switch
              checked={leaderboards.includes(item.value)}
              onClick={() => {
                onChange(item);
              }}
            />
          </Space>
        </Menu.Item>
      ))}
    </Menu>
  );
  const fetchProduct = (page, perPage) => {
    const params = {
      date_from,
      date_to,
      by_time,
      page,
      perPage,
      leaderboards: leaderboards,
      sellers,
      shops,
    };
    dispatch(fetchOverviewProduct(params));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchProduct();
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchProduct();
  }, [date_to, leaderboards, date_from, sellers, shops]);
  const columns = {
    products: [
      {
        title: '#',
        dataIndex: 'id',
        key: 'id',
        render: (_, data, index) => index + 1,
      },
      {
        title: 'Product',
        dataIndex: 'translation_title',
        key: 'translation_title',
        render: (_, data) => (
          <a onClick={() => goToProduct(data.id)}>{data.translation_title}</a>
        ),
      },
      {
        title: 'Items sold',
        dataIndex: 'items_sold',
        key: 'items_sold',
      },
      {
        title: 'Net sales',
        dataIndex: 'net_sales',
        key: 'net_sales',
        render: (_, data) => {
          return (
            <>{getReportValue(defaultCurrency.symbol, data?.net_sales, true)}</>
          );
        },
      },
    ],
    categories: [
      {
        title: '#',
        dataIndex: 'id',
        key: 'id',
        render: (_, data, index) => index + 1,
      },
      {
        title: 'Category',
        dataIndex: 'translation_title',
        key: 'translation_title',
        render: (_, data) => (
          <a onClick={() => goToCategory(data.id)}>{data.translation_title}</a>
        ),
      },
      {
        title: 'Items sold',
        dataIndex: 'items_sold',
        key: 'items_sold',
      },
      {
        title: 'Net sales',
        dataIndex: 'net_sales',
        key: 'net_sales',
        render: (_, data) => {
          return (
            <>{getReportValue(defaultCurrency.symbol, data?.net_sales, true)}</>
          );
        },
      },
    ],
    customers: [
      {
        title: '#',
        dataIndex: 'id',
        key: 'id',
        render: (_, data, index) => index + 1,
      },
      {
        title: 'Customer Name',
        dataIndex: 'firstname',
        key: 'firstname',
        render: (_, data) => (
          <a
            onClick={() => goToShow(data.uuid)}
          >{`${data.firstname} ${data.lastname}`}</a>
        ),
      },
      {
        title: 'Orders',
        dataIndex: 'orders_count',
        key: 'orders_count',
      },
      {
        title: 'Total Spend',
        dataIndex: 'total_spend',
        key: 'total_spend',
        render: (_, data) => {
          return (
            <>
              {getReportValue(defaultCurrency.symbol, data?.total_spend, true)}
            </>
          );
        },
      },
    ],
    shops: [
      {
        title: '#',
        dataIndex: 'id',
        key: 'id',
        render: (_, data, index) => index + 1,
      },
      {
        title: 'Shop',
        dataIndex: 'shop_translation_title',
        key: 'shop_translation_title',
        render: (_, data) => (
          <a onClick={() => goToShop(data.uuid)}>
            {data.shop_translation_title}
          </a>
        ),
      },
      {
        title: 'Item sold',
        dataIndex: 'items_sold',
        key: 'items_sold',
      },
      {
        title: 'Net sales',
        dataIndex: 'net_sales',
        key: 'net_sales',
        render: (_, data) => {
          return (
            <>{getReportValue(defaultCurrency.symbol, data?.net_sales, true)}</>
          );
        },
      },
    ],
  };
  return (
    <>
      <Row gutter={24} className='align-items-center'>
        <Col span={23}>
          <Divider orientation='left'>Leaderboards</Divider>
        </Col>
        <Col span={1}>
          <Dropdown overlay={menuLeaderboards}>
            <MoreOutlined style={{ fontSize: '26px' }} />
          </Dropdown>
        </Col>
      </Row>
      <Row gutter={24}>
        {leaderboardsType?.map((item) => {
          if (productList?.[item.value]) {
            return (
              <Col span={12}>
                <Card>
                  <Row
                    gutter={24}
                    className='align-items-center justify-content-between mb-4'
                  >
                    <Col span={24}>
                      <Title level={2} className='mb-0'>
                        {item.label}
                      </Title>
                    </Col>
                  </Row>
                  <Table
                    columns={columns[item.value]}
                    dataSource={productList?.[item.value] || []}
                    rowKey={(row) => row.id}
                    loading={loading}
                  />
                </Card>
              </Col>
            );
          }
        })}
      </Row>
    </>
  );
};

export default LeaderBoard;
