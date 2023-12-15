import React, { useState, useEffect, useContext } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Row,
  Select,
  Switch,
} from 'antd';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LanguageList from '../../components/language-list';
import TextArea from 'antd/es/input/TextArea';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { removeFromMenu, setMenuData } from '../../redux/slices/menu';
import categoryService from '../../services/category';
import ImageUploadSingle from '../../components/image-upload-single';
import { fetchCategories } from '../../redux/slices/category';
import { useTranslation } from 'react-i18next';
import { AsyncTreeSelect } from '../../components/async-tree-select-category';
import CustomModal from '../../components/modal';
import { Context } from '../../context/context';

const CategoryAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { currentTheme } = useSelector(
    (state) => state.theme.theme,
    shallowEqual
  );

  const { setIsModalVisible } = useContext(Context);
  const [image, setImage] = useState(activeMenu.data?.image || null);
  const [form] = Form.useForm();
  const parent_id = Form.useWatch('parent_id', form);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState(null);
  const [positionError, setPositionError] = useState('');

  const { defaultLang, languages } = useSelector(
    (state) => state.formLang,
    shallowEqual
  );

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

  const onFinish = (values) => {
    setLoadingBtn(true);
    const body = {
      ...values,
      type: 1,
      active: values.active ? 1 : 0,
      keywords: values.keywords.join(','),
      parent_id: values.parent_id?.value || 0,
      'images[0]': image?.name,
    };
    const nextUrl = 'catalog/categories';
    categoryService
      .create(body)
      .then(() => {
        toast.success(t('successfully.created'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchCategories());
        navigate(`/${nextUrl}`);
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };

  const onFinishFailed = (values) => console.log(values);

  async function fetchUserCategoryList() {
    const params = { perPage: 100 };
    return categoryService.getAll(params).then((res) =>
      res.data.map((item) => ({
        title: item.translation?.title,
        value: item.id,
        key: item.id,
        children: item.children?.map((el) => ({
          title: el.translation?.title,
          value: el.id,
          key: el.id,
          children: el.children?.map((three) => ({
            title: three.translation?.title,
            value: three.id,
            key: three.id,
            disabled: true,
          })),
        })),
      }))
    );
  }

  const checkPosition = (position) => {
    categoryService
      .checkPosition({ position })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
        setIsModalVisible(true);
        setPositionError(error.response.data.message);
      });
  };

  const handleOk = () => {
    console.log('clicked ok');
    setIsModalVisible(false);
  };
  const handleNo = () => {
    console.log('clicked no');
    form.resetFields(['position']);
    setIsModalVisible(false);
  };

  return (
    <Card title={t('add.category')} extra={<LanguageList />}>
      <Form
        name='basic'
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          active: true,
          ...activeMenu.data,
        }}
        form={form}
        onFinishFailed={onFinishFailed}
      >
        <Row gutter={24}>
          <Col span={12}>
            <Row gutter={24}>
              <Col span={24}>
                {languages.map((item, index) => (
                  <Form.Item
                    key={item.title + index}
                    label={t('name')}
                    name={`title[${item.locale}]`}
                    help={
                      error
                        ? error[`title.${defaultLang}`]
                          ? error[`title.${defaultLang}`][0]
                          : null
                        : null
                    }
                    validateStatus={error ? 'error' : 'success'}
                    rules={[
                      {
                        required: item.locale === defaultLang,
                        message: t('required'),
                      },
                    ]}
                    hidden={item.locale !== defaultLang}
                  >
                    <Input placeholder={t('name')} />
                  </Form.Item>
                ))}
              </Col>
              <Col span={24}>
                <Form.Item
                  label={t('keywords')}
                  name='keywords'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <Select mode='tags' style={{ width: '100%' }}></Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={t('parent.category')}
                  name='parent_id'
                  rules={[{ required: false, message: t('required') }]}
                >
                  <AsyncTreeSelect fetchOptions={fetchUserCategoryList} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={t('position')}
                  name='position'
                  rules={[
                    {
                      required: false,
                      message: t('required'),
                    },
                  ]}
                >
                  <Select
                    onChange={(value) => checkPosition(value)}
                    disabled={parent_id}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
                      <Select.Option value={id}>{id}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                {languages.map((item, index) => (
                  <Form.Item
                    key={item.locale + index}
                    label={t('description')}
                    name={`description[${item.locale}]`}
                    rules={[
                      {
                        required: item.locale === defaultLang,
                        message: t('required'),
                      },
                    ]}
                    hidden={item.locale !== defaultLang}
                  >
                    <TextArea rows={4} />
                  </Form.Item>
                ))}
              </Col>
              <Col span={4}>
                <Form.Item
                  label={t('image')}
                  name='image'
                  rules={[{ required: true, message: t('required') }]}
                >
                  <ImageUploadSingle
                    type='categories'
                    image={image}
                    setImage={setImage}
                    form={form}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item
                  label={t('active')}
                  name='active'
                  valuePropName='checked'
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <p>{t('category.positioning.example')}</p>
            {currentTheme === 'dark' ? (
              <Image
                src='/category-position.png'
                width={'100%'}
                height={'100%'}
              />
            ) : (
              <Image src='/category-grid.png' width={'100%'} height={'100%'} />
            )}
          </Col>
        </Row>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('submit')}
        </Button>
      </Form>

      <CustomModal
        click={handleOk}
        text={positionError}
        loading={false}
        no={handleNo}
      />
    </Card>
  );
};
export default CategoryAdd;
