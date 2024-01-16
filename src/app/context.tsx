import { createContext } from "react";
import { DbInfo, UserInfo } from "./data/api";

export const UserInfoContext = createContext<UserInfo | null>(null);
export const DbInfoContext = createContext<DbInfo | null>(null);
