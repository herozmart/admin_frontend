import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/scss/components/sidebar.scss';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Divider, Menu, Modal, Space, Layout } from 'antd';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { clearMenu, setMenu } from '../redux/slices/menu';
import { useTranslation } from 'react-i18next';
import LangModal from './lang-modal';
import getSystemIcons from '../helpers/getSystemIcons';
import { clearUser } from '../redux/slices/auth';
import NotificationBar from './notificationBar';
import UserModal from './user-modal';
import getAvatar from '../helpers/getAvatar';
import { navCollapseTrigger } from '../redux/slices/theme';
import ThemeConfigurator from './theme-configurator';
import i18n from '../configs/i18next';
import { IMG_URL } from '../configs/app-global';
import { RiArrowDownSFill } from 'react-icons/ri';
import Scrollbars from 'react-custom-scrollbars';
const { Sider } = Layout;

const Sidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const { delivery } = useSelector(
    (state) => state.globalSettings.settings,
    shallowEqual
  );
  const { navCollapsed, direction } = useSelector(
    (state) => state.theme.theme,
    shallowEqual
  );
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [langModal, setLangModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const routes = useMemo(() => filterUserRoutes(user.urls), [user]);
  const active = routes?.find((item) => pathname.includes(item.url));
  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  console.log('user => ', user);

  const handleOk = () => {
    dispatch(clearUser());
    dispatch(clearMenu());
    setIsModalVisible(false);
    localStorage.removeItem('token');
    navigate('/login');
  };

  const addNewItem = (item) => {
    if (item.id === 'logout') {
      showModal();
      return;
    }
    const data = {
      ...item,
      icon: undefined,
      children: undefined,
      refetch: true,
    };
    dispatch(setMenu(data));
    navigate(`/${item.url}`);
  };

  function filterUserRoutes(routes) {
    let list = routes;
    if (delivery === '1' && user?.role !== 'seller') {
      list = routes?.filter((item) => item?.name !== 'delivery');
    }
    if (delivery === '0' && user?.role !== 'admin') {
      list = routes.filter((item) => item.name !== 'delivery');
    }
    return list;
  }

  const menuTrigger = (event) => {
    event.stopPropagation();
    dispatch(navCollapseTrigger());
  };

  return (
    <>
      <Sider
        dir={direction}
        className='navbar-nav side-nav'
        width={250}
        collapsed={navCollapsed}
        style={{ height: '100vh', top: 0, direction }}
      >
        <div
          className='sidebar-brand cursor-pointer'
          onClick={() => setUserModal(true)}
        >
          <img
            className='sidebar-logo'
            src={getAvatar(user.img)}
            alt={user.fullName}
          />
          <div className='sidebar-brand-text'>
            <h5 className='user-name fw-bold'>{user.fullName}</h5>
            <h6 className='user-status'>{user.role}</h6>
          </div>
          <div className='menu-collapse' onClick={menuTrigger}>
            <MenuFoldOutlined />
          </div>
        </div>

        {!navCollapsed ? (
          <Space className='mx-4 mt-2 d-flex justify-content-between'>
            <span className='icon-button' onClick={() => setLangModal(true)}>
              <img
                className='globalOutlined'
                src={
                  IMG_URL +
                  languages.find((item) => item.locale === i18n.language)?.img
                }
                alt={user.fullName}
              />
              <span className='default-lang'>{i18n.language}</span>
              <RiArrowDownSFill size={15} />
            </span>
            <span className='d-flex'>
              <ThemeConfigurator />
              <NotificationBar />
            </span>
          </Space>
        ) : (
          <div className='menu-unfold' onClick={menuTrigger}>
            <MenuUnfoldOutlined />
          </div>
        )}
        <Divider style={{ margin: '10px 0' }} />
        <Scrollbars
          autoHeight
          autoHide
          autoHeightMin={window.innerHeight > 969 ? '80vh' : '77vh'}
          autoHeightMax={window.innerHeight > 969 ? '80vh' : '77vh'}
        >
          <Menu
            theme='light'
            mode='inline'
            direction={direction}
            selectedKeys={[String(active?.id)]}
            items={routes?.map((item) => ({
              label: t(item.name),
              icon: getSystemIcons(item.icon),
              key: item.id,
              data: item,
            }))}
            onClick={({ item }) => addNewItem(item.props.data)}
          />
        </Scrollbars>
      </Sider>
      <Modal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
      >
        <LogoutOutlined
          style={{ fontSize: '25px', color: '#08c' }}
          theme='primary'
        />
        <span className='ml-2'>{t('leave.site')}</span>
      </Modal>

      {langModal && (
        <LangModal
          visible={langModal}
          handleCancel={() => setLangModal(false)}
        />
      )}
      {userModal && (
        <UserModal
          visible={userModal}
          handleCancel={() => setUserModal(false)}
        />
      )}
    </>
  );
};
export default Sidebar;
