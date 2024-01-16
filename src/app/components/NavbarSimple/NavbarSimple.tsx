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
  IconFlame,
} from "@tabler/icons-react";
import classes from "./NavbarSimple.module.css";
import React, { useContext } from "react";
import { DbInfoContext, UserInfoContext } from "../../context";
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

interface NavbarProps {
  onClick: any;
}

export function NavbarSimple(props: NavbarProps) {
  const pathname = usePathname();
  const dbInfo = useContext(DbInfoContext);
  const userInfo = useContext(UserInfoContext);

  const links = data.map((item) => (
    <Link
      className={classes.link}
      data-active={pathname === item.link || undefined}
      href={item.link}
      key={item.label}
      onClick={props.onClick}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <>
      <div className={classes.navbarMain}>{links}</div>
      <div>
        {dbInfo == null ||
          (userInfo == null && (
            <Center>
              <Loader size="xs"></Loader>
            </Center>
          ))}
        {dbInfo != null && userInfo != null && (
          <>
            <Flex align="center" justify="left" mb={10}>
              <IconDatabase
                className={classes.linkIcon}
                color={"rgb(21, 170, 191)"}
                stroke={1.5}
                size={5}
              />
              <Text span={true} size="s">
                <strong>pgEdge {dbInfo.nearest.toUpperCase()}</strong>{" "}
                <em>({dbInfo.nodes[dbInfo.nearest].latency}ms)</em>
              </Text>
            </Flex>
            <Flex align="center" justify="left">
              <IconFlame
                className={classes.linkIcon}
                color={"orange"}
                stroke={1.5}
                size={5}
              />
              <Text span={true} size="s">
                <strong>Cloudflare® {userInfo.colo}</strong>{" "}
                <em>({userInfo.colo_latency}ms)</em>
              </Text>
            </Flex>
          </>
        )}
      </div>
      <div className={classes.footer}>
        <a
          href="https://github.com/pgedge/pgedge-northwind"
          className={classes.link}
        >
          <IconGitBranch className={classes.linkIcon} stroke={1.5} />
          <span>Github</span>
        </a>
      </div>
    </>
  );
}
