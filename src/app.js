import React, { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Navigate,
} from 'react-router-dom';
import Login from './views/login/login';
import AppLayout from './layout/app-layout';
import NotFound from './views/not-found';
import { ProtectedRoute } from './context/protected-route';
import { PathLogout } from './context/path-logout';
import GalleryLanguages from './views/gallery/gallery-languages';
import LanguageEdit from './views/languages/language-add';
import CategoryAdd from './views/categories/category-add';
import BrandsAdd from './views/brands/brands-add';
import ShopsAdd from './views/shops/shops-add';
import ProductsAdd from './views/products/products-add';
import Dashboard from './views/dashboard';
import Shops from './views/shops/shops';
import Brands from './views/brands/brands';
import PosSystem from './views/pos-system/pos-system';
import Products from './views/products/products';
import Languages from './views/languages/languages';
import LanguageAdd from './views/languages/language-add';
import Currencies from './views/currencies/currencies';
import Gallery from './views/gallery';
import SubscriptionsEdit from './views/subscriptions/subscriptions-edit';
import Subscriptions from './views/subscriptions/subscriptions';
import Categories from './views/categories';
import ExtrasPage from './views/products/Extras/extras-page';
import Settings from './views/settings/settings';
import GlobalSettings from './views/global-settings/global-settings';
import Order from './views/order/order';
import OrderDetails from './views/order/order-details';
import OrdersAdd from './views/order/orders-add';
import OrderEdit from './views/order/order-edit';
import Delivery from './views/delivery/delivery';
import DeliveryAdd from './views/delivery/delivery-add';
import User from './views/user/user';
import UserEdit from './views/user/user-edit';
import Admin from './views/user/admin';
import RoleList from './views/user/role-list';
import Deliveryman from './views/delivery/deliveryman';
import Banners from './views/banners/banners';
import BannerAdd from './views/banners/banner-add';
import Notification from './views/notification';
import NotificationAdd from './views/notification/notification-add';
import Chat from './views/chat/chat';
import GeneralSettings from './views/settings/generalSettings';
import Catalog from './views/catalog/catalog';
import DeliveryList from './views/delivery/delivery-list';
import Users from './views/user';
import Coupon from './views/coupons/Coupon';
import CouponAdd from './views/coupons/CouponAdd';
import MyShop from './views/my-shop';
import Translations from './views/translations';
import Tickets from './views/tickets';
import TicketAdd from './views/tickets/ticketAdd';
import Welcome from './views/welcome/welcome';
import SellerCategories from './views/seller-views/categories';
import SellerBrands from './views/seller-views/brands';
import CategoryEdit from './views/categories/category-edit';
import BrandsEdit from './views/brands/brands-edit';
import Backup from './views/backup';
import SystemInformation from './views/system-information';
import BannerEdit from './views/banners/banner-edit';
import ProductsEdit from './views/products/product-edit';
import Units from './views/units';
import UnitAdd from './views/units/unit-add';
import UnitEdit from './views/units/unit-edit';
import SellerProducts from './views/seller-views/products/products';
import MyShopEdit from './views/my-shop/edit';
import SellerInvites from './views/seller-views/invites';
import CurrencyEdit from './views/currencies/currency-edit';
import CurrencyAdd from './views/currencies/currencies-add';
import SellerDiscounts from './views/seller-views/discounts';
import DiscountEdit from './views/seller-views/discounts/discount-edit';
import DiscountAdd from './views/seller-views/discounts/discount-add';
import SellerProductAdd from './views/seller-views/products/products-add';
import SellerProductEdit from './views/seller-views/products/product-edit';
import Blogs from './views/blog';
import BlogAdd from './views/blog/blog-add';
import BlogEdit from './views/blog/blog-edit';
import NotificationEdit from './views/notification/notification-edit';
import Payments from './views/payments';
import UserAdd from './views/user/user-add';
import FAQ from './views/faq';
import FaqAdd from './views/faq/faq-add';
import FaqEdit from './views/faq/faq-edit';
import Transactions from './views/transactions';
import { WelcomeLayout } from './layout/welcome-layout';
import SmsGateways from './views/sms-gateways';
import { ToastContainer } from 'react-toastify';
import SellerDelivery from './views/seller-views/delivery/delivery';
import SellerDeliveryAdd from './views/seller-views/delivery/delivery-add';
import SellerDeliverymans from './views/seller-views/delivery/deliverymans';
import SellerPosSystem from './views/seller-views/pos-system/pos-system';
import SellerOrder from './views/seller-views/order/order';
import SellerOrderDetails from './views/seller-views/order/order-details';
import Terms from './views/privacy/terms';
import Policy from './views/privacy/policy';
import Reviews from './views/reviews';
import ProductReviews from './views/reviews/productReviews';
import OrderReviews from './views/reviews/orderReviews';
import Update from './views/update';
import i18n from './configs/i18next';
import informationService from './services/rest/information';
import PageLoading from './components/pageLoading';
import ShopUsers from './views/seller-views/user/shop-users';
import FirebaseConfig from './views/settings/firebaseConfig';
import Wallets from './views/wallet';
import SellerPayouts from './views/seller-views/payouts';
import PayoutRequests from './views/payout-requests';
import SocialSettings from './views/settings/socialSettings';
import SellerSubscriptions from './views/seller-views/subscriptions';
import DeliverymanOrders from './views/deliveryman-orders/order';
import DeliverymanOrderDetails from './views/deliveryman-orders/order-details';
import SellerLooks from './views/seller-views/looks';
import LookAdd from './views/seller-views/looks/look-add';
import LookEdit from './views/seller-views/looks/look-edit';
import Cashback from './views/cashback';
import Providers from './providers';
import BrandImport from './views/brands/brand-import';
import CategoryImport from './views/categories/category-import';
import ProductImport from './views/products/product-import';
import SellerProductImport from './views/seller-views/products/product-import';
import DeliveryOfCountry from './views/delivery-of-country';

//import report for admin
import Report from './views/report';
import Overview from './views/report-overview';
import ReportProducts from './views/report-products';
import ReportRevenue from './views/report-revenue';
import ReportOrders from './views/report-orders';
import ReportVariation from './views/report-variation';
import ReportCategories from './views/report-categories';
import ReportStock from './views/report-stock';
import ReportShops from './views/report-shop';

//import report for seller
import SellerReport from './views/seller-views/report';
import SellerOverview from './views/seller-views/report-overview';
import SellerReportProducts from './views/seller-views/report-products';
import SellerReportRevenue from './views/seller-views/report-revenue';
import SellerReportOrders from './views/seller-views/report-orders';
import SellerReportVariation from './views/seller-views/report-variation';
import SellerReportCategories from './views/seller-views/report-categories';
import SellerReportStock from './views/seller-views/report-stock';

const App = () => {
  const [loading, setLoading] = useState(false);

  function fetchTranslations() {
    const params = { lang: i18n.language };
    setLoading(true);
    informationService
      .translations(params)
      .then(({ data }) =>
        i18n.addResourceBundle(i18n.language, 'translation', data)
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchTranslations();
  }, []);

  return (
    <Providers>
      <Router>
        <Routes>
          <Route
            index
            path='/login'
            element={
              <PathLogout>
                <Login />
              </PathLogout>
            }
          />
          <Route
            path='/welcome'
            element={
              <WelcomeLayout>
                <Welcome />
              </WelcomeLayout>
            }
          />
          <Route
            path='/installation'
            element={
              <WelcomeLayout>
                <GlobalSettings />
              </WelcomeLayout>
            }
          />

          <Route
            path=''
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/*app  page*/}
            <Route path='/' element={<Navigate to='dashboard' />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='shops' element={<Shops />} />
            <Route path='pos-system' element={<PosSystem />} />
            <Route path='currencies' element={<Currencies />} />
            <Route path='gallery' element={<Gallery />} />
            <Route path='subscriptions' element={<Subscriptions />} />
            <Route path='orders' element={<Order />} />
            <Route path='banners' element={<Banners />} />
            <Route path='notifications' element={<Notification />} />
            <Route path='chat' element={<Chat />} />
            <Route path='coupons' element={<Coupon />} />
            <Route path='my-shop' element={<MyShop />} />
            <Route path='tickets' element={<Tickets />} />
            <Route path='blogs' element={<Blogs />} />
            <Route path='transactions' element={<Transactions />} />
            <Route path='wallets' element={<Wallets />} />
            <Route path='payout-requests' element={<PayoutRequests />} />
            <Route path='reviews' element={<Reviews />} />
            <Route path='reviews/product' element={<ProductReviews />} />
            <Route path='reviews/order' element={<OrderReviews />} />
            {/* settings */}
            <Route path='settings' element={<Settings />} />
            <Route path='settings/general' element={<GeneralSettings />} />
            <Route path='settings/languages' element={<Languages />} />
            <Route path='settings/translations' element={<Translations />} />
            <Route path='settings/backup' element={<Backup />} />
            <Route
              path='settings/system-information'
              element={<SystemInformation />}
            />
            <Route path='settings/payments' element={<Payments />} />
            <Route path='settings/faqs' element={<FAQ />} />
            <Route path='settings/sms-gateways' element={<SmsGateways />} />
            <Route path='settings/terms' element={<Terms />} />
            <Route path='settings/policy' element={<Policy />} />
            <Route path='settings/update' element={<Update />} />
            <Route path='settings/firebase' element={<FirebaseConfig />} />
            <Route path='settings/social' element={<SocialSettings />} />
            {/* Reports admin */}
            <Route path='report' element={<Report />} />
            <Route path='report/overview' element={<Overview />} />
            <Route path='report/products' element={<ReportProducts />} />
            <Route path='report/revenue' element={<ReportRevenue />} />
            <Route path='report/orders' element={<ReportOrders />} />
            <Route path='report/variation' element={<ReportVariation />} />
            <Route path='report/categories' element={<ReportCategories />} />
            <Route path='report/stock' element={<ReportStock />} />
            <Route path='report/shops' element={<ReportShops />} />
            {/* Reports seller */}
            <Route path='seller/report' element={<SellerReport />} />
            <Route path='seller/report/overview' element={<SellerOverview />} />
            <Route
              path='seller/report/products'
              element={<SellerReportProducts />}
            />
            <Route
              path='seller/report/revenue'
              element={<SellerReportRevenue />}
            />
            <Route
              path='seller/report/orders'
              element={<SellerReportOrders />}
            />
            <Route
              path='seller/report/variation'
              element={<SellerReportVariation />}
            />
            <Route
              path='seller/report/categories'
              element={<SellerReportCategories />}
            />
            <Route path='seller/report/stock' element={<SellerReportStock />} />
            {/* catalog */}
            <Route path='catalog' element={<Catalog />} />
            <Route path='catalog/products' element={<Products />} />
            <Route path='catalog/product/import' element={<ProductImport />} />
            <Route path='catalog/extras' element={<ExtrasPage />} />
            <Route path='catalog/categories' element={<Categories />} />
            <Route
              path='catalog/categories/import'
              element={<CategoryImport />}
            />
            <Route path='catalog/brands' element={<Brands />} />
            <Route path='catalog/brands/import' element={<BrandImport />} />
            <Route path='catalog/units' element={<Units />} />
            <Route path='seller/categories' element={<SellerCategories />} />
            <Route path='seller/brands' element={<SellerBrands />} />
            <Route path='seller/products' element={<SellerProducts />} />
            <Route path='seller/invites' element={<SellerInvites />} />
            <Route path='seller/discounts' element={<SellerDiscounts />} />
            <Route path='seller/product/add' element={<SellerProductAdd />} />
            <Route
              path='seller/product/:uuid'
              element={<SellerProductEdit />}
            />
            <Route
              path='seller/product/import'
              element={<SellerProductImport />}
            />
            <Route path='seller/delivery/list' element={<SellerDelivery />} />
            <Route
              path='seller/deliveries/add'
              element={<SellerDeliveryAdd />}
            />
            <Route path='seller/delivery/:id' element={<SellerDeliveryAdd />} />
            <Route
              path='seller/delivery/deliveryman'
              element={<SellerDeliverymans />}
            />
            <Route path='seller/pos-system' element={<SellerPosSystem />} />
            <Route path='seller/orders' element={<SellerOrder />} />
            <Route
              path='seller/order/details/:id'
              element={<SellerOrderDetails />}
            />
            {/* <Route path='seller/clients' element={<SellerClients />} /> */}
            <Route path='seller/shop-users' element={<ShopUsers />} />
            {/* <Route path='seller/user/add' element={<SellerUserAdd />} /> */}
            <Route path='seller/payouts' element={<SellerPayouts />} />
            <Route
              path='seller/subscriptions'
              element={<SellerSubscriptions />}
            />
            <Route path='seller/looks' element={<SellerLooks />} />
            <Route path='seller/looks/add' element={<LookAdd />} />
            <Route path='seller/looks/:id' element={<LookEdit />} />
            {/* delivery */}
            <Route path='delivery' element={<DeliveryList />} />
            <Route path='delivery/list' element={<Delivery />} />
            <Route path='delivery/deliveryman' element={<Deliveryman />} />
            <Route path='deliveryman/orders' element={<DeliverymanOrders />} />
            <Route
              path='deliveryman/order/details/:id'
              element={<DeliverymanOrderDetails />}
            />
            <Route path='cashback' element={<Cashback />} />
            {/* user */}
            <Route path='users' element={<Users />} />
            <Route path='users/user' element={<User />} />
            <Route path='users/admin' element={<Admin />} />
            <Route path='users/role' element={<RoleList />} />
            {/*app add for page*/}
            <Route path='shop/add' element={<ShopsAdd />} />
            <Route path='brand/add' element={<BrandsAdd />} />
            <Route path='category/add' element={<CategoryAdd />} />
            <Route path='product/add' element={<ProductsAdd />} />
            <Route path='language/add' element={<LanguageAdd />} />
            <Route path='currency/add' element={<CurrencyAdd />} />
            <Route path='order/add' element={<OrdersAdd />} />
            <Route path='deliveries/add' element={<DeliveryAdd />} />
            <Route path='user/add' element={<UserAdd />} />
            <Route path='banner/add' element={<BannerAdd />} />
            <Route path='notification/add' element={<NotificationAdd />} />
            <Route path='coupon/add' element={<CouponAdd />} />
            <Route path='ticket/add' element={<TicketAdd />} />
            <Route path='unit/add' element={<UnitAdd />} />
            <Route path='discount/add' element={<DiscountAdd />} />
            <Route path='blog/add' element={<BlogAdd />} />
            <Route path='faq/add' element={<FaqAdd />} />
            {/*app edit for page*/}
            <Route path='language/:id' element={<LanguageEdit />} />
            <Route path='category/:uuid' element={<CategoryEdit />} />
            <Route path='currency/:id' element={<CurrencyEdit />} />
            <Route path='brand/:id' element={<BrandsEdit />} />
            <Route path='shop/:uuid' element={<ShopsAdd />} />
            <Route path='product/:uuid' element={<ProductsEdit />} />
            <Route path='subscriptions/edit' element={<SubscriptionsEdit />} />
            <Route path='order/details/:id' element={<OrderDetails />} />
            <Route path='delivery/:id' element={<DeliveryAdd />} />
            <Route path='order/:id' element={<OrderEdit />} />
            <Route path='user/:uuid' element={<UserEdit />} />
            <Route path='banner/:id' element={<BannerEdit />} />
            <Route path='notification/:uuid' element={<NotificationEdit />} />
            <Route path='coupon/:id' element={<CouponAdd />} />
            <Route path='unit/:id' element={<UnitEdit />} />
            <Route path='my-shop/edit' element={<MyShopEdit />} />
            <Route path='discount/:id' element={<DiscountEdit />} />
            <Route path='blog/:uuid' element={<BlogEdit />} />
            <Route path='faq/:uuid' element={<FaqEdit />} />
            <Route path='gallery/:type' element={<GalleryLanguages />} />
            {/* delivery of country */}
            <Route
              path='/delivery-of-country'
              element={<DeliveryOfCountry />}
            />
          </Route>

          <Route path='*' element={<NotFound />} />
        </Routes>
        <ToastContainer
          className='antd-toast'
          position='top-right'
          autoClose={3000}
          hideProgressBar
          closeOnClick
          pauseOnHover
          draggable
        />
        {loading && <PageLoading />}
      </Router>
    </Providers>
  );
};
export default App;
