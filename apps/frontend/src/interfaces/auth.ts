export interface User {
    id: string
    name: string
    email: string
    role: string
}

export interface AuthState {
    isAuthenticated: boolean
    user: User | null
    login(email: string, passwd: string, remember: string): Promise<void>
    logout(): void
}
