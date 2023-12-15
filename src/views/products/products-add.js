import React from 'react';
import '../../assets/scss/components/product-add.scss';
import { steps } from './steps';
import { Card, Steps } from 'antd';
import ProductsIndex from './products-index';
import LanguageList from '../../components/language-list';
import { useTranslation } from 'react-i18next';

const { Step } = Steps;

const ProductsAdd = () => {
  const { t } = useTranslation();

  return (
    <Card title={t('add.product')} extra={<LanguageList />}>
      <Steps current={0}>
        {steps.map((item) => (
          <Step title={t(item.title)} key={item.title} />
        ))}
      </Steps>
      <div className='steps-content'>
        {steps[0].content === 'First-content' && <ProductsIndex />}
      </div>
    </Card>
  );
};
export default ProductsAdd;
