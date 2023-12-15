import {
  Col,
  Row,
  Space,
  Typography,
  Divider,
  Dropdown,
  Select,
  Menu,
  Switch,
} from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import {
  BarChartOutlined,
  LineChartOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { disableRefetch } from '../../../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import ReportChart from '../../../../components/report/chart';
import { ReportContext } from '../../../../context/report';
import useDidUpdate from '../../../../helpers/useDidUpdate';
import { fetchOverviewProductChart } from '../../../../redux/slices/report-seller/overview';
const { Text } = Typography;
const ChartsOverview = ({ chart_type }) => {
  const dispatch = useDispatch();
  const {
    date_from,
    date_to,
    by_time,
    setChartType,
    options,
    handleByTime,
    sellers,
    shops,
  } = useContext(ReportContext);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { chartData: reportData } = useSelector(
    (state) => state.overviewReport,
    shallowEqual
  );
  const [charts, setCharts] = useState(['total_price', 'items_sold']);
  function onChange(checked) {
    if (charts.includes(checked.value)) {
      const newArray = charts.filter((item) => item != checked.value);
      setCharts(newArray);
    } else {
      setCharts((prev) => [...prev, checked.value]);
    }
  }
  const menu = (
    <Menu>
      {chart_type?.map((item, key) => (
        <Menu.Item key={key}>
          <Space className='d-flex justify-content-between'>
            <Text>{item.label}</Text>
            <Switch
              checked={charts.includes(item.value)}
              onClick={() => {
                onChange(item);
              }}
            />
          </Space>
        </Menu.Item>
      ))}
    </Menu>
  );
  const fetchReport = () => {
    const params = {
      date_from,
      date_to,
      by_time,
      charts,
      sellers,
      shops,
    };
    dispatch(fetchOverviewProductChart(params));
  };

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchReport();
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchReport();
  }, [date_to, by_time, charts, date_from, sellers, shops]);
  return (
    <>
      <Row gutter={24} className='align-items-center'>
        <Col span={19}>
          <Divider orientation='left'>Charts</Divider>
        </Col>
        <Col span={5} className='d-flex justify-content-end'>
          <Space size='large'>
            <Select
              style={{ width: 100 }}
              onChange={handleByTime}
              options={options}
              defaultValue={by_time}
            />
            <LineChartOutlined
              style={{
                fontSize: '22px',
                cursor: 'pointer',
                color: chart_type === 'line' ? 'green' : '',
              }}
              onClick={() => setChartType('line')}
            />
            <BarChartOutlined
              style={{
                fontSize: '22px',
                cursor: 'pointer',
                color: chart_type === 'bar' ? 'green' : '',
              }}
              onClick={() => setChartType('bar')}
            />
            <Dropdown overlay={menu}>
              <MoreOutlined style={{ fontSize: '26px' }} />
            </Dropdown>
          </Space>
        </Col>
      </Row>
      <Row gutter={24}>
        {chart_type.map(
          (item) =>
            reportData?.charts?.[item.value] && (
              <Col span={12} key={item.value}>
                <ReportChart
                  reportData={{ chart: reportData?.charts[item.value] }}
                  navbar={false}
                  title={item.label}
                />
              </Col>
            )
        )}
      </Row>
    </>
  );
};

export default ChartsOverview;
