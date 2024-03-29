import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconDashboard,
  IconShoppingCart,
  IconDatabase,
  IconFlame,
  IconBrandGithub,
  IconUsersGroup,
  IconUsers,
  IconPackages,
  IconTruckDelivery,
  IconAdjustments,
  IconCaretDown,
  IconCaretUp,
  IconArrowsLeftRight,
  IconCheck,
} from "@tabler/icons-react";
import React, { useContext, useState, useEffect } from "react";
import { Text, Loader, Flex, Center, Select, Button, useCombobox, Combobox } from "@mantine/core";
import { DbInfoContext, UserInfoContext } from "../../context";
import classes from "./NavbarSimple.module.css";
import { Router } from "next/router";


const data = [
  { link: "/", label: "Home", icon: IconHome },
  { link: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { link: "/suppliers", label: "Suppliers", icon: IconTruckDelivery },
  { link: "/products", label: "Products", icon: IconPackages },
  { link: "/orders", label: "Orders", icon: IconShoppingCart },
  { link: "/employees", label: "Employees", icon: IconUsers },
  { link: "/customers", label: "Customers", icon: IconUsersGroup },
];

interface NavbarProps {
  onClick: any;
}

export function NavbarSimple(props: NavbarProps) {
  const pathname = usePathname();
  const dbInfo = useContext(DbInfoContext);
  const userInfo = useContext(UserInfoContext);
  const [selectedNode, setSelectedNode] = useState<string>('');
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  useEffect(() => {
    setSelectedNode(sessionStorage.getItem('selectedNode') || selectedNode || dbInfo?.nearest || '')
  }, [dbInfo]);

  const nodes = dbInfo?.nodes ? Object.keys(dbInfo?.nodes) : [];
  nodes.unshift("Nearest")

  const options = nodes.map((item) => (
    <Combobox.Option value={item} key={item}>
      <Flex align="center" justify="left">
        <IconDatabase
          size={16}
          style={{ marginRight: 5 }}
          strokeWidth={2}
          color={'#79c3d2'}
        />

        <Text span={true} fw={500} size="xs">
          <em>pgEdge {item === "Nearest" ? item : item.toUpperCase()}</em>{" "}
        </Text>
        {
          item === selectedNode ?
            <IconCheck
              size={16}
              style={{ marginLeft: 'auto' }}
              strokeWidth={2}
              color={'green'}
            /> : null
        }
      </Flex>
    </Combobox.Option>
  ));

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
                <strong>pgEdge {selectedNode.toUpperCase() || dbInfo.nearest.toUpperCase()}</strong>{" "}
                <em>({dbInfo.nodes[selectedNode || dbInfo.nearest].latency}ms)</em>
              </Text>


              <Combobox
                store={combobox}
                width={180}
                position="top-start"
                withArrow
                withinPortal={false}
                onOptionSubmit={(val) => {
                  if (val === 'Nearest') {
                    sessionStorage.removeItem('selectedNode');
                  } else {
                    setSelectedNode(val);
                    sessionStorage.setItem('selectedNode', val);
                  }
                  combobox.closeDropdown();
                  window.location.reload();
                }}
              >
                <Combobox.Target>
                  <Button variant="default" size="xs" w={35} ml={10} p={0}
                    style={{ borderRadius: '5px', cursor: 'pointer' }}
                    onClick={() => combobox.toggleDropdown()}
                  >
                    <IconArrowsLeftRight
                      style={{ marginRight: 0, padding: 0 }}
                      size={20}
                      strokeWidth={2}
                      color={'black'}
                    />
                  </Button>
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>{options}</Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
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
          target="_blank"
        >
          <IconBrandGithub className={classes.linkIcon} stroke={1.5} />
          <span>Github</span>
        </a>
      </div>
    </>
  );
}
