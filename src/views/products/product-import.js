import React, { useMemo, useState } from 'react';
import { Button, Card } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Dragger from 'antd/lib/upload/Dragger';
import { InboxOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import productService from '../../services/product';
import { setMenuData } from '../../redux/slices/menu';
import { fetchProducts } from '../../redux/slices/product';
import { export_url } from '../../configs/app-global';
export default function ProductImport() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu, menuItems } = useSelector(
    (state) => state.menu,
    shallowEqual
  );
  const shop_id = useMemo(() => activeMenu.data.value, [activeMenu.data]);
  const data = useMemo(
    () => menuItems.find((item) => item.name === 'products'),
    [menuItems]
  );
  const { shop } = data || {};
  const createFile = (file) => {
    return {
      uid: file.name,
      name: file.name,
      status: 'done',
      url: file.name,
      created: true,
    };
  };

  const beforeUpload = (file) => {
    const isXls =
      file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!isXls) {
      toast.error(`${file.name} is not valid file`);
      return false;
    }
  };

  const handleUpload = ({ file, onSuccess }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('shop_id', shop?.value || shop_id);
    productService.import(formData).then((data) => {
      toast.success(t('add.brands'));
      dispatch(
        setMenuData({
          activeMenu,
          data: { ...activeMenu.data, file: createFile(file) },
        })
      );
      onSuccess('ok');
      dispatch(fetchProducts());
    });
  };

  return (
    <Card
      title={t('import')}
      extra={
        <Button>
          <a href={export_url + 'import/products.xlsx'}>
            {t('download.example')}
          </a>
        </Button>
      }
    >
      <Dragger
        name='file'
        multiple={false}
        maxCount={1}
        customRequest={handleUpload}
        defaultFileList={activeMenu?.data.file ? [activeMenu?.data.file] : null}
        beforeUpload={beforeUpload}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          Click or drag file to this area to upload
        </p>
        <p className='ant-upload-hint'>
          Import Products from file to this area
        </p>
      </Dragger>
    </Card>
  );
}
