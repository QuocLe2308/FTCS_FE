import { FormattedMessage } from 'react-intl';

import {
  TeamOutlined,
  IdcardOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  CarOutlined,
  NodeIndexOutlined,
  GiftOutlined,
  BankOutlined
} from '@ant-design/icons';

const icons = {
  TeamOutlined,
  IdcardOutlined,
  UserOutlined,
  DollarOutlined,
  CalendarOutlined,
  CarOutlined,
  NodeIndexOutlined,
  GiftOutlined,
  BankOutlined
};

const management = {
  id: 'management',
  title: <FormattedMessage id="management" />,
  icon: icons.TeamOutlined,
  type: 'group',
  children: [
    {
      id: 'driver',
      title: <FormattedMessage id="drivermanagement" />,
      type: 'item',
      url: '/management/driver',
      icon: icons.UserOutlined
    },
    {
      id: 'manager',
      title: <FormattedMessage id="managermanagement" />,
      type: 'item',
      url: '/management/manager',
      icon: icons.UserOutlined
    },
    {
      id: 'customer-management',
      title: <FormattedMessage id="customer-management" />,
      type: 'item',
      url: '/management/customer-management',
      icon: icons.UserOutlined
    },
    {
      id: 'payment',
      title: <FormattedMessage id="payment" />,
      type: 'item',
      url: '/management/payment',
      icon: icons.DollarOutlined
    },
    {
      id: 'bonus',
      title: <FormattedMessage id="bonus" />,
      type: 'item',
      url: '/management/bonus',
      icon: icons.DollarOutlined
    },
    {
      id: 'insurance',
      title: <FormattedMessage id="insurance" />,
      type: 'collapse',
      icon: icons.DollarOutlined,
      children: [
        {
          id: 'insurance-policy',
          title: <FormattedMessage id="insurance-policy" />,
          type: 'item',
          url: '/management/insurance/insurance-policy',
          icon: icons.DollarOutlined
        },
        {
          id: 'booking-type',
          title: <FormattedMessage id="booking-type" />,
          type: 'item',
          url: '/management/insurance/booking-type',
          icon: icons.DollarOutlined
        },
        {
          id: 'insurance-claim',
          title: <FormattedMessage id="insurance-claim" />,
          type: 'item',
          url: '/management/insurance/insurance-claim',
          icon: icons.DollarOutlined
        }
      ]
    },
    {
      id: 'price-management',
      title: <FormattedMessage id="pricing" />,
      type: 'collapse',
      icon: icons.DollarOutlined,
      children: [
        {
          id: 'holiday-surcharge',
          title: <FormattedMessage id="holidayrates" />,
          type: 'item',
          url: '/management/price-management/holiday-surcharge',
          icon: icons.CalendarOutlined
        },
        {
          id: 'pricing',
          title: <FormattedMessage id="basepricing" />,
          type: 'item',
          url: '/management/price-management/pricing',
          icon: icons.DollarOutlined
        }
      ]
    },
    {
      id: 'transportation-management',
      title: <FormattedMessage id="transportation" />,
      type: 'collapse',
      icon: icons.CarOutlined,
      children: [
        {
          id: 'transport-schedule',
          title: <FormattedMessage id="schedule" />,
          type: 'item',
          url: '/management/transport/schedule',
          icon: icons.CalendarOutlined
        },
        {
          id: 'transport-trip-booking',
          title: <FormattedMessage id="tripbooking" />,
          type: 'item',
          url: '/management/transport/trip-bookings',
          icon: icons.NodeIndexOutlined
        }
      ]
    },
    {
      id: 'voucher',
      title: <FormattedMessage id="vouchermanagement" />,
      type: 'item',
      url: '/management/voucher',
      icon: icons.GiftOutlined
    },
    {
      id: 'withdraw',
      title: <FormattedMessage id="withdrawmanagement" />,
      type: 'item',
      url: '/management/withdraw',
      icon: icons.BankOutlined
    }
  ]
};

export default management;
