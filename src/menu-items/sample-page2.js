// This is example of menu item without group for horizontal layout. There will be no children.

// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { ChromeOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE ||============================== //

const samplePage = {
  id: 'sample-page2',
  title: <FormattedMessage id="sample-page" />,
  type: 'group',
  url: '/sample-page2',
  icon: icons.ChromeOutlined
};

export default samplePage;
