import React, { useEffect } from 'react';
import '../../../assets/scss/components/product-categories.scss';
import { Image, Table } from 'antd';
import GlobalContainer from '../../../components/global-container';
import { useTranslation } from 'react-i18next';
import getImage from '../../../helpers/getImage';
import { fetchSellerCategory } from '../../../redux/slices/category';
import { disableRefetch } from '../../../redux/slices/menu';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

export default function SellerCategories() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const columns = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
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
            className='rounded'
            preview
            placeholder
            key={img + row.id}
          />
        );
      },
    },
  ];
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { categories, meta, loading } = useSelector(
    (state) => state.category,
    shallowEqual
  );
  useEffect(() => {
    if (activeMenu.refetch) {
      dispatch(fetchSellerCategory({}));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    dispatch(fetchSellerCategory({ perPage: pageSize, page: current }));
  };

  return (
    <GlobalContainer headerTitle={t('categories')}>
      <Table
        columns={columns}
        dataSource={categories}
        pagination={{
          pageSize: meta.per_page,
          page: meta.current_page,
          total: meta.total,
        }}
        rowKey={(record) => record.key}
        onChange={onChangePagination}
        loading={loading}
      />
    </GlobalContainer>
  );
}
