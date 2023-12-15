import React from 'react';
import { Button, Card } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Dragger from 'antd/lib/upload/Dragger';
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { setMenuData } from '../../redux/slices/menu';
import categoryService from '../../services/category';
import { fetchCategories } from '../../redux/slices/category';
import { api_url, export_url } from '../../configs/app-global';

export default function CategoryImport() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

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
    categoryService.import(formData).then((data) => {
      toast.success(t('add.brands'));
      dispatch(setMenuData({ activeMenu, data: createFile(file) }));
      onSuccess('ok');
      dispatch(fetchCategories());
    });
  };

  return (
    <Card
      title={t('import')}
      extra={
        <a href={`${export_url}/import/category.xlsx`} target='_blank'>
          <Button size='small' icon={<DownloadOutlined />}>
            Download example
          </Button>
        </a>
      }
    >
      <Dragger
        name='file'
        multiple={false}
        maxCount={1}
        customRequest={handleUpload}
        defaultFileList={activeMenu?.data ? [activeMenu?.data] : null}
        beforeUpload={beforeUpload}
      >
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className='ant-upload-text'>
          Click or drag file to this area to upload
        </p>
        <p className='ant-upload-hint'>
          Import Categories from file to this area
        </p>
      </Dragger>
    </Card>
  );
}
