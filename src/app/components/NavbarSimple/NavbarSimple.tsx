import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconSearch,
  IconHome,
  IconDashboard,
  IconFileDatabase,
  IconShoppingCartStar,
  IconShoppingCart,
  IconBriefcase,
  IconUser,
  IconGitBranch,
  IconDatabase,
} from "@tabler/icons-react";
import classes from "./NavbarSimple.module.css";
import React, { useContext } from "react";
import { DbInfoContext } from "../../context";
import { Text, Loader, Flex, Center } from "@mantine/core";

const data = [
  { link: "/", label: "Home", icon: IconHome },
  { link: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { link: "/suppliers", label: "Suppliers", icon: IconFileDatabase },
  { link: "/products", label: "Products", icon: IconShoppingCartStar },
  { link: "/orders", label: "Orders", icon: IconShoppingCart },
  { link: "employees", label: "Employees", icon: IconBriefcase },
  { link: "/customers", label: "Customers", icon: IconUser },
  //   { link: '/search', label: 'Search', icon: IconSearch },
];

export function NavbarSimple() {
  const pathname = usePathname();
  const dbInfo = useContext(DbInfoContext);

  const links = data.map((item) => (
    <Link
      className={classes.link}
      data-active={pathname === item.link || undefined}
      href={item.link}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <>
      <div className={classes.navbarMain}>{links}</div>
      <div>
        {dbInfo == null && (
          <Center>
            <Loader size="xs"></Loader>
          </Center>
        )}
        {dbInfo != null && (
          <Flex align="center" justify="center">
            <IconDatabase
              className={classes.linkIcon}
              color={"green"}
              stroke={1.5}
              size={5}
            />
            <Text span={true} size="s">
              <strong>pgedge-{dbInfo.nearest}</strong>{" "}
              <em>({dbInfo.nodes[dbInfo.nearest].latency}ms)</em>
            </Text>
          </Flex>
        )}
      </div>
      <div className={classes.footer}>
        <a
          href="https://github.com/pgedge/pgedge-northwind-traders"
          className={classes.link}
        >
          <IconGitBranch className={classes.linkIcon} stroke={1.5} />
          <span>Github</span>
        </a>
      </div>
    </>
  );
}
