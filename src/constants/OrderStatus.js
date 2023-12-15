import {
  BorderlessTableOutlined,
  CarOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';

export const allStatuses = [
  { id: 'new', label: 'New', icon: <BorderlessTableOutlined /> },
  { id: 'ready', label: 'Ready', icon: <FileDoneOutlined /> },
  { id: 'on_a_way', label: 'On the way', icon: <CarOutlined /> },
  { id: 'delivered', label: 'Delivered to customer', icon: <CheckOutlined /> },
  { id: 'canceled', label: 'Canceled', icon: <CloseCircleOutlined /> },
];
