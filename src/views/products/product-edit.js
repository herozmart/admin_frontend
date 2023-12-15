import React, { useEffect, useState } from 'react';
import '../../assets/scss/components/product-add.scss';
import { steps } from './steps';
import { Card, Spin, Steps } from 'antd';
import ProductProperty from './product-property';
import ProductFinish from './product-finish';
import ProductStock from './product-stock';
import ProductExtras from './product-extras';
import ProductsIndex from './products-index';
import LanguageList from '../../components/language-list';
import { useParams } from 'react-router-dom';
import productService from '../../services/product';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { disableRefetch, setMenuData } from '../../redux/slices/menu';
import { IMG_URL } from '../../configs/app-global';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from '../../helpers/useQueryParams';

const { Step } = Steps;

const ProductsEdit = () => {
  const { t } = useTranslation();
  const { uuid } = useParams();
  const queryParams = useQueryParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const dispatch = useDispatch();

  const current = Number(queryParams.values?.step || 0);
  const [loading, setLoading] = useState(activeMenu.refetch);
  const next = () => {
    const step = current + 1;
    queryParams.set('step', step);
  };
  const prev = () => {
    const step = current - 1;
    queryParams.set('step', step);
  };

  const createImages = (items) =>
    items.map((item) => ({
      uid: item.id,
      name: item.path,
      url: IMG_URL + item.path,
    }));

  const createSelectObject = (item) => {
    if (!item) return null;
    return {
      label: item.translation ? item.translation.title : item.title,
      value: item.id,
    };
  };

  function fetchProduct(uuid) {
    setLoading(true);
    productService
      .getById(uuid)
      .then((res) => {
        const data = {
          ...res.data,
          ...getLanguageFields(res.data),
          shop: createSelectObject(res.data.shop),
          category: createSelectObject(res.data.category),
          brand: createSelectObject(res.data.brand),
          unit: createSelectObject(res.data.unit),
          images: createImages(res.data.galleries),
          extras: [
            ...new Set(
              res.data.stocks[0]?.extras.map((el) => el.extra_group_id)
            ),
          ],
          stocks: res.data.stocks.map((stock) => ({
            ...stock,
            ...Object.assign(
              {},
              ...stock.extras.map((extra, idx) => ({
                [`extras[${idx}]`]: extra.id,
              }))
            ),
            quantity: stock.quantity || 0,
            extras: undefined,
          })),
          properties: res.data.properties.map((item, index) => ({
            id: index,
            [`key[${item.locale}]`]: item.key,
            [`value[${item.locale}]`]: item.value,
          })),
          translation: undefined,
          translations: undefined,
        };
        console.log('data => ', data);
        dispatch(setMenuData({ activeMenu, data }));
      })
      .finally(() => {
        setLoading(false);
        dispatch(disableRefetch(activeMenu));
      });
  }

  function getLanguageFields(data) {
    if (!data?.translations) {
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

  useEffect(() => {
    if (activeMenu.refetch) {
      fetchProduct(uuid);
    }
  }, [activeMenu.refetch]);

  const onChange = (step) => {
    dispatch(setMenuData({ activeMenu, data: { ...activeMenu.data, step } }));
    queryParams.set('step', step);
  };

  return (
    <Card title={t('edit.product')} extra={<LanguageList />} loading={loading}>
      <Steps current={current} onChange={onChange}>
        {steps.map((item) => (
          <Step title={t(item.title)} key={item.title} />
        ))}
      </Steps>
      <div className='steps-content'>
        {Boolean(steps[current].content === 'First-content') && (
          <ProductsIndex next={next} />
        )}
        {Boolean(steps[current].content === 'Second-content') && (
          <ProductExtras next={next} prev={prev} />
        )}
        {Boolean(steps[current].content === 'Third-content') && (
          <ProductStock next={next} prev={prev} />
        )}
        {Boolean(steps[current].content === 'Fourth-content') && (
          <ProductProperty next={next} prev={prev} />
        )}
        {Boolean(steps[current].content === 'Finish-content') && (
          <ProductFinish prev={prev} />
        )}
      </div>
    </Card>
  );
};
export default ProductsEdit;
