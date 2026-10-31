import { createContext } from "react";
import type { AuthState } from "../interfaces/auth";

export const AuthContext = createContext<AuthState | undefined>(undefined);