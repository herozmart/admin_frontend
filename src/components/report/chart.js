import { Card, Col, Row, Space, Typography, Divider, Select } from 'antd';
import React, { useMemo } from 'react';
import { LineChartOutlined, BarChartOutlined } from '@ant-design/icons';
import ChartWidget from '../chart-widget';
import { COLORS } from '../../constants/ChartConstant';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { ReportContext } from '../../context/report';
const { Title } = Typography;

const ReportChart = ({
  reportData = {},
  navbar = true,
  title = 'Chart title',
}) => {
  const { by_time, options, handleByTime, chart_type, setChartType } =
    useContext(ReportContext);
  const { t } = useTranslation();
  const categories = useMemo(
    () => reportData?.chart?.map((item) => item.time),
    [reportData]
  );
  const chartData = useMemo(() => {
    if (Boolean(reportData?.charts)) {
      return reportData.charts.map((item) => {
        return {
          name: item?.translation?.title || '',
          data: item.chart?.map((item) => item.result),
        };
      });
    } else
      return [
        {
          name: t('orders'),
          data: reportData?.chart?.map((item) => item.result),
        },
      ];
  }, [reportData]);
  return (
    <Row gutter={24}>
      <Col span={24}>
        <Card>
          <Row gutter={24}>
            <Col span={12}>
              <Title level={3} className='mb-0'>
                {t(title)}
              </Title>
            </Col>
            {navbar && (
              <Col span={12} className='d-flex justify-content-end'>
                <Select
                  style={{ width: 100 }}
                  onChange={handleByTime}
                  options={options}
                  defaultValue={by_time}
                />
                <Divider type='vertical' style={{ height: '100%' }} />
                <Space>
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
                </Space>
              </Col>
            )}
          </Row>
          <Divider />
          <ChartWidget
            card={false}
            type={chart_type}
            series={chartData}
            xAxis={categories}
            height={280}
            customOptions={{
              colors: [
                COLORS[1],
                COLORS[2],
                COLORS[3],
                COLORS[4],
                COLORS[5],
                COLORS[6],
                COLORS[0],
              ],
              legend: {
                show: true,
              },
              stroke: {
                width: 2.5,
                curve: 'stepline',
              },
            }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ReportChart;
