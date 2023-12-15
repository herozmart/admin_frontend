import React, { useEffect, useState } from 'react';
import { Button, Form, Card, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../assets/scss/components/shops-add.scss';
import ShopAddData from './shop-add-data';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  disableRefetch,
  removeFromMenu,
  setMenuData,
} from '../../redux/slices/menu';
import LanguageList from '../../components/language-list';
import shopService from '../../services/shop';
import { IMG_URL } from '../../configs/app-global';
import moment from 'moment';
import { fetchShops } from '../../redux/slices/shop';
import { useTranslation } from 'react-i18next';
import getDefaultLocation from '../../helpers/getDefaultLocation';

const ShopsAdd = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { uuid } = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const { settings } = useSelector(
    (state) => state.globalSettings,
    shallowEqual
  );

  const [location, setLocation] = useState(getDefaultLocation(settings));
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [logoImage, setLogoImage] = useState(
    activeMenu?.data?.logo_img || null
  );
  const [backImage, setBackImage] = useState(
    activeMenu?.data?.background_img || null
  );

  useEffect(() => {
    return () => {
      const data = form.getFieldsValue(true);
      data.open_time = JSON.stringify(data.open_time);
      data.close_time = JSON.stringify(data.close_time);
      dispatch(setMenuData({ activeMenu, data }));
    };
  }, []);

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
      [`address[${item.locale}]`]: translations.find(
        (el) => el.locale === item.locale
      )?.address,
    }));
    return Object.assign({}, ...result);
  }

  const createImage = (name) => {
    return {
      name,
      url: IMG_URL + name,
    };
  };

  const fetchShop = (uuid) => {
    setLoading(true);
    shopService
      .getById(uuid)
      .then(({ data }) => {
        form.setFieldsValue({
          ...data,
          ...getLanguageFields(data),
          logo_image: createImage(data.logo_img),
          background_img: createImage(data.background_img),
          open_time: moment(data.open_time, 'HH:mm:ss'),
          close_time: moment(data.close_time, 'HH:mm:ss'),
          user: {
            value: data.seller?.id,
            label:
              (data.seller?.firstname || data.seller?.lastname) &&
              `${data.seller?.firstname || ''} ${data.seller?.lastname || ''}`,
          },
          recommended: data.mark === 'recommended',
        });
        setBackImage(createImage(data.background_img));
        setLogoImage(createImage(data.logo_img));
        setLocation({
          lat: Number(data.location?.latitude),
          lng: Number(data.location?.longitude),
        });
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
      'images[0]': logoImage?.name,
      'images[1]': backImage?.name,
      open_time: moment(values.open_time).format('HH:mm:ss'),
      close_time: moment(values.close_time).format('HH:mm:ss'),
      user_id: values.user.value,
      visibility: Number(values.visibility),
      location: location.lat + ',' + location.lng,
      user: undefined,
      mark: values.recommended ? 'recommended' : '',
    };

    const nextUrl = 'shops';
    if (!uuid) {
      shopService
        .create(body)
        .then(() => {
          toast.success('Successfully created');
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          navigate(`/${nextUrl}`);
          dispatch(fetchShops());
        })
        .finally(() => setLoadingBtn(false));
    } else {
      shopService
        .update(uuid, body)
        .then(() => {
          toast.success('Successfully created');
          dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
          navigate(`/${nextUrl}`);
          dispatch(fetchShops());
        })
        .finally(() => setLoadingBtn(false));
    }
  };

  useEffect(() => {
    if (activeMenu?.refetch && uuid) {
      fetchShop(uuid);
    }
  }, [activeMenu?.refetch]);

  const handleCancel = () => {
    const nextUrl = 'shops';
    dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
    navigate(`/${nextUrl}`);
  };

  const getInitialTimes = () => {
    if (!activeMenu.data?.open_time || !activeMenu.data?.close_time) {
      return {};
    }
    const open_time = JSON.parse(activeMenu.data?.open_time);
    const close_time = JSON.parse(activeMenu.data?.close_time);
    return {
      open_time: moment(open_time, 'HH:mm:ss'),
      close_time: moment(close_time, 'HH:mm:ss'),
    };
  };

  return (
    <Card
      title={uuid ? t('edit.shop') : t('add.shop')}
      extra={<LanguageList />}
      loading={loading}
    >
      <Form
        form={form}
        name='basic'
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          visibility: true,
          status: 'new',
          ...activeMenu.data,
          ...getInitialTimes(),
        }}
      >
        <ShopAddData
          logoImage={logoImage}
          setLogoImage={setLogoImage}
          backImage={backImage}
          setBackImage={setBackImage}
          form={form}
          location={location}
          setLocation={setLocation}
        />
        <Space>
          <Button type='primary' htmlType='submit' loading={loadingBtn}>
            {t('save')}
          </Button>
          <Button onClick={handleCancel}>{t('cancel')}</Button>
        </Space>
      </Form>
    </Card>
  );
};
export default ShopsAdd;
