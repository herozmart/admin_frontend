import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Row,
  Select,
  Spin,
  Switch,
} from 'antd';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import LanguageList from '../../components/language-list';
import TextArea from 'antd/es/input/TextArea';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import categoryService from '../../services/category';
import ImageUploadSingle from '../../components/image-upload-single';
import { IMG_URL } from '../../configs/app-global';
import { fetchCategories } from '../../redux/slices/category';
import { useTranslation } from 'react-i18next';
import { AsyncTreeSelect } from '../../components/async-tree-select-category';
import { Context } from '../../context/context';
import { useContext } from 'react';
import CustomModal from '../../components/modal';

const CategoryEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setIsModalVisible } = useContext(Context);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { currentTheme } = useSelector(
    (state) => state.theme.theme,
    shallowEqual
  );

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(activeMenu.data?.image || null);
  const [form] = Form.useForm();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState(null);
  const parent_id = Form.useWatch('parent_id', form);
  const [positionError, setPositionError] = useState('');

  const { uuid } = useParams();
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

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

  function getLanguageFields(data) {
    if (!data) {
      return {};
    }
    const { translations } = data;
    const result = languages.map((item) => ({
      [`title[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.title,
      [`description[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.description,
    }));
    return Object.assign({}, ...result);
  }

  const getCategory = (alias) => {
    setLoading(true);
    categoryService
      .getById(alias)
      .then((res) => {
        let category = res.data;
        const body = {
          ...category,
          ...getLanguageFields(category),
          image: createImage(category.img),
          keywords: category?.keywords?.split(','),
          product_type_id: {
            label: category.product_type_id?.name,
            value: category.product_type_id?.id,
            key: category.product_type_id?.id,
          },
          parent_id: category?.parent_id
            ? {
                label: category.parent?.translation?.title,
                value: category?.parent_id,
                key: category?.parent_id,
              }
            : null,
        };

        console.log(body);
        form.setFieldsValue(body);
        setImage(createImage(category.img));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  };

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
      .update(uuid, body)
      .then(() => {
        toast.success(t('successfully.updated'));
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        dispatch(fetchCategories());
        navigate(`/${nextUrl}`);
      })
      .catch((err) => setError(err.response.data.params))
      .finally(() => setLoadingBtn(false));
  };
  const checkPosition = (position) => {
    categoryService
      .checkPosition({ position, id: activeMenu.data?.id })
      .catch((error) => {
        console.log(error);
        setIsModalVisible(true);
        setPositionError(error.response.data.message);
      });
  };

  const onFinishFailed = (values) => console.log(values);

  useEffect(() => {
    if (activeMenu.refetch) {
      getCategory(uuid);
    }
  }, [activeMenu.refetch]);

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

  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleNo = () => {
    form.resetFields(['position']);
    setIsModalVisible(false);
  };

  return (
    <Card title={t('edit.category')} extra={<LanguageList />}>
      {!loading ? (
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
                      <Input />
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
                    rules={[{ required: false, message: t('required') }]}
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
                  <Form.Item label={t('image')}>
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
                <Image
                  src='/category-grid.png'
                  width={'100%'}
                  height={'100%'}
                />
              )}
            </Col>
          </Row>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('submit')}
          </Button>
        </Form>
      ) : (
        <div className='d-flex justify-content-center align-items-center py-5'>
          <Spin size='large' className='mt-5 pt-5' />
        </div>
      )}
      <CustomModal
        click={handleOk}
        text={positionError}
        loading={false}
        no={handleNo}
      />
    </Card>
  );
};
export default CategoryEdit;
