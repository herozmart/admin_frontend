import moment from 'moment';
import React, { createContext, useState } from 'react';

export const ReportContext = createContext(undefined);

export const ReportContextProvider = ({ children }) => {
  const options = [
    {
      value: 'day',
      label: 'Day',
    },
    {
      value: 'month',
      label: 'Month',
    },
    {
      value: 'year',
      label: 'Year',
    },
  ];
  const filterOptions = [
    {
      value: `${moment().format('YYYY-MM-DD')},${moment().format(
        'YYYY-MM-DD'
      )}`,
      label: 'Today',
    },
    {
      value: `${moment().subtract(1, 'days').format('YYYY-MM-DD')},${moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD')}`,
      label: 'Yesterday',
    },
    {
      value: `${moment()
        .subtract(1, 'week')
        .startOf('week')
        .format('YYYY-MM-DD')},${moment()
        .subtract(1, 'week')
        .endOf('week')
        .format('YYYY-MM-DD')}`,
      label: 'Last week',
    },
    {
      value: `${moment()
        .subtract(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DD')},${moment()
        .subtract(1, 'month')
        .endOf('month')
        .format('YYYY-MM-DD')}`,
      label: 'Last month',
    },
    {
      value: `${moment()
        .subtract(1, 'year')
        .startOf('year')
        .format('YYYY-MM-DD')},${moment()
        .subtract(1, 'year')
        .endOf('year')
        .format('YYYY-MM-DD')}`,
      label: 'Last year',
    },
  ];
  const [date_from, setDateFrom] = useState(
    moment().subtract(1, 'months').format('YYYY-MM-DD')
  );
  const [date_to, setDateTo] = useState(moment().format('YYYY-MM-DD'));
  const [by_time, setByTime] = useState('day');
  const [chart, setChart] = useState('items_sold');
  const [chart_type, setChartType] = useState('line');
  const [sellers, setSellers] = useState([]);
  const [shops, setShops] = useState([]);

  const handleByTime = (value) => {
    setByTime(value);
  };
  const handleChart = (value) => {
    setChart(value);
  };
  const handleDateRange = (dates, dateStrings) => {
    if (dates) {
      setDateFrom(dateStrings[0]);
      setDateTo(dateStrings[1]);
    } else {
      console.log('Clear');
    }
  };

  return (
    <ReportContext.Provider
      value={{
        options,
        handleByTime,
        date_from,
        setDateFrom,
        date_to,
        setDateTo,
        by_time,
        setByTime,
        chart,
        setChart,
        handleChart,
        chart_type,
        setChartType,
        handleDateRange,
        filterOptions,
        sellers,
        setSellers,
        shops,
        setShops,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};
