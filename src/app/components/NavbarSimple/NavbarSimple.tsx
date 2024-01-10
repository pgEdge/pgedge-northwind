import { useState } from 'react';
import { Group, Code, Title } from '@mantine/core';
import {
  IconSwitchHorizontal,
  IconLogout,
  IconSearch,
  IconHome,
  IconDashboard,
  IconFileDatabase,
  IconShoppingCartStar,
  IconShoppingCart,
  IconBriefcase,
  IconUser,
  IconGitBranch
} from '@tabler/icons-react';
import classes from './NavbarSimple.module.css';

const data = [
  { link: '', label: 'Home', icon: IconHome },
  { link: '', label: 'Dashboard', icon: IconDashboard },
  { link: '', label: 'Suppliers', icon: IconFileDatabase },
  { link: '', label: 'Products', icon: IconShoppingCartStar },
  { link: '', label: 'Orders', icon: IconShoppingCart },
  { link: '', label: 'Employees', icon: IconBriefcase },
  { link: '', label: 'Customers', icon: IconUser },
  { link: '', label: 'Search', icon: IconSearch },
];

export function NavbarSimple() {
  const [active, setActive] = useState('Billing');

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <Title order={4} className={classes.title}>
            Northwind Traders
          </Title>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="https://github.com/pgedge/pgedge-northwind-traders" className={classes.link}>
          <IconGitBranch className={classes.linkIcon} stroke={1.5} />
          <span>Github</span>
        </a>
      </div>
    </nav>
  );
}