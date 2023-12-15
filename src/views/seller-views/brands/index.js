import React, { useEffect, useState } from 'react';
import '../../../assets/scss/components/product-categories.scss';
import { Image, Table } from 'antd';
import GlobalContainer from '../../../components/global-container';
import '../../../assets/scss/components/brand.scss';
import brandService from '../../../services/rest/brand';
import { useTranslation } from 'react-i18next';
import getImage from '../../../helpers/getImage';

export default function Brands() {
  const { t } = useTranslation();
  const columns = [
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      render: (img, row) => {
        return (
          <Image
            src={getImage(img)}
            alt='img_gallery'
            width={100}
            height='auto'
            className='rounded'
            preview
            placeholder
            key={img + row.id}
          />
        );
      },
    },
  ];
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageCurrent, setPageCurrent] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBrands = () => {
    setLoading(true);
    const params = {
      perPage: pageSize,
      page: pageCurrent,
    };
    brandService
      .getAll(params)
      .then((res) => {
        setData(res.data);
        setTotal(res.meta.total);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBrands();
  }, [pageSize, pageCurrent]);

  const onChangePagination = (pageNumber) => {
    setPageSize(pageNumber.pageSize);
    setPageCurrent(pageNumber.current);
  };

  return (
    <GlobalContainer headerTitle={t('brands')}>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          pageSize: pageSize,
          page: pageCurrent,
          total: total,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
      />
    </GlobalContainer>
  );
}
