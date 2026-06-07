import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { auth, db } from "../../lib/firebase"
import { FirebaseError } from "firebase/app"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  updatePassword,
} from "firebase/auth"
import { doc, setDoc, updateDoc } from "firebase/firestore"

type LoginRecord = {
  id: string
  date: string
  time: string
  location: string
  device: string
  ipAddress: string
  status: "Success" | "Failed"
  action: "Login" | "Password Change"
}

type AuthUser = {
  id: string
  firebaseUid?: string
  fullName: string
  shopName: string
  shopLogo?: string
  email: string
  phoneNumber: string
  password: string
  createdAt: string
  loginHistory: LoginRecord[]
  address?: string
  businessType?: string
  taxNumber?: string
  currency?: string
  businessAddress?: string
  avatar?: string
}

interface AuthStore {
  currentUser: AuthUser | null
  users: AuthUser[]
  registerUser: (user: Omit<AuthUser, "id" | "createdAt" | "loginHistory">) => Promise<{ success: boolean; error?: string }>
  loginUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  changePassword: (id: string, currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  getUser: (id: string) => AuthUser | undefined
  updateUser: (id: string, update: Partial<Omit<AuthUser, "id" | "createdAt" | "loginHistory">>) => Promise<{ success: boolean; error?: string }>
  deleteUser: (id: string) => { success: boolean; error?: string }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      // Helper function to detect device info
      const getDeviceInfo = (): { device: string; ipAddress: string; location: string } => {
        const ua = navigator.userAgent
        let device = "Unknown Device"
        let location = "Unknown Location"

        if (/Windows NT 10\.0|Windows NT 11\.0/.test(ua)) {
          if (/Chrome/.test(ua)) device = "Chrome on Windows"
          else if (/Firefox/.test(ua)) device = "Firefox on Windows"
          else if (/Edg/.test(ua)) device = "Edge on Windows"
          else device = "Windows"
        } else if (/Macintosh/.test(ua)) {
          if (/Chrome/.test(ua)) device = "Chrome on macOS"
          else if (/Firefox/.test(ua)) device = "Firefox on macOS"
          else if (/Safari/.test(ua)) device = "Safari on macOS"
          else device = "macOS"
        } else if (/iPhone|iPad/.test(ua)) {
          if (/Safari/.test(ua)) device = "Safari on iOS"
          else device = "iOS"
        } else if (/Android/.test(ua)) {
          if (/Chrome/.test(ua)) device = "Chrome on Android"
          else device = "Android"
        } else if (/Linux/.test(ua)) {
          if (/Chrome/.test(ua)) device = "Chrome on Linux"
          else if (/Firefox/.test(ua)) device = "Firefox on Linux"
          else device = "Linux"
        }

        // Try to get IP from localStorage (simulated)
        const ipAddress = localStorage.getItem("userIpAddress") || "192.168.1.100"

        // Get approximate location from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (timezone.includes("Karachi") || timezone.includes("Asia/Karachi")) {
          location = "Karachi, Pakistan"
        } else if (timezone.includes("Lahore") || timezone.includes("Islamabad")) {
          location = "Lahore, Pakistan"
        } else if (timezone.includes("Dhaka")) {
          location = "Dhaka, Bangladesh"
        } else if (timezone.includes("Asia/Kolkata")) {
          location = "India"
        } else {
          location = timezone.replace(/_/g, " ")
        }

        return { device, ipAddress, location }
      }

      return {
        currentUser: null,
        users: [],

        registerUser: async (user) => {
          const normalizedEmail = user.email.trim().toLowerCase()
          const normalizedPhone = user.phoneNumber.trim()
          const existingUser = get().users.find(
            (existing) =>
              existing.email.toLowerCase() === normalizedEmail ||
              existing.phoneNumber === normalizedPhone,
          )

          if (existingUser) {
            return {
              success: false,
              error: existingUser.email.toLowerCase() === normalizedEmail
                ? "An account with this email already exists."
                : "An account with this phone number already exists.",
            }
          }

          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              normalizedEmail,
              user.password,
            )

            if (userCredential.user && user.fullName.trim()) {
              await updateProfile(userCredential.user, {
                displayName: user.fullName.trim(),
              })
            }

            const newUser: AuthUser = {
              id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              firebaseUid: userCredential.user.uid,
              fullName: user.fullName.trim(),
              shopName: user.shopName.trim(),
              shopLogo: user.shopLogo || "",
              email: normalizedEmail,
              phoneNumber: normalizedPhone,
              password: user.password,
              createdAt: new Date().toISOString(),
              loginHistory: [],
              address: user.address || "",
              businessType: user.businessType || "retail",
              taxNumber: user.taxNumber || "",
              currency: user.currency || "PKR",
              businessAddress: user.businessAddress || "",
            }

            await setDoc(doc(db, "users", userCredential.user.uid), {
              firebaseUid: userCredential.user.uid,
              fullName: newUser.fullName,
              shopName: newUser.shopName,
              shopLogo: newUser.shopLogo,
              email: newUser.email,
              phoneNumber: newUser.phoneNumber,
              createdAt: newUser.createdAt,
              loginHistory: newUser.loginHistory,
              address: newUser.address,
              businessType: newUser.businessType,
              taxNumber: newUser.taxNumber,
              currency: newUser.currency,
              businessAddress: newUser.businessAddress,
              avatar: newUser.shopLogo,
            })

            set((state) => ({
              users: [...state.users, newUser],
            }))

            return { success: true }
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unable to register user."
            return { success: false, error: message }
          }
        },

        loginUser: async (email, password) => {
          const normalizedEmail = email.trim().toLowerCase()

          let userCredential
          try {
            userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password)
          } catch (error: unknown) {
            let message = "Check your email or password."

            if (error instanceof FirebaseError && error.code) {
              switch (error.code) {
                case "auth/wrong-password":
                case "auth/user-not-found":
                case "auth/invalid-credential":
                  message = "Check your email or password."
                  break
                case "auth/invalid-email":
                  message = "Invalid email address."
                  break
                case "auth/too-many-requests":
                  message = "Too many attempts. Try again later."
                  break
                default:
                  message = error.message || message
              }
            } else if (error instanceof Error) {
              message = error.message
            }

            return { success: false, error: message }
          }

          const matchedUser = get().users.find(
            (user) => user.email.toLowerCase() === normalizedEmail,
          )

          const now = new Date()
          const date = now.toISOString().split("T")[0]
          const time = now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          const { device, ipAddress, location } = getDeviceInfo()
          const loginRecord: LoginRecord = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            date,
            time,
            location,
            device,
            ipAddress,
            status: "Success",
            action: "Login",
          }

          if (!matchedUser) {
            const firebaseUser = userCredential.user
            const newUser: AuthUser = {
              id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              firebaseUid: firebaseUser.uid,
              fullName: firebaseUser.displayName || "",
              shopName: "",
              shopLogo: firebaseUser.photoURL || "",
              email: normalizedEmail,
              phoneNumber: firebaseUser.phoneNumber || "",
              password,
              createdAt: new Date().toISOString(),
              loginHistory: [loginRecord],
              address: "",
              businessType: "retail",
              taxNumber: "",
              currency: "PKR",
              businessAddress: "",
            }

            await setDoc(doc(db, "users", firebaseUser.uid), {
              firebaseUid: firebaseUser.uid,
              fullName: newUser.fullName,
              shopName: newUser.shopName,
              shopLogo: newUser.shopLogo,
              email: newUser.email,
              phoneNumber: newUser.phoneNumber,
              createdAt: newUser.createdAt,
              loginHistory: newUser.loginHistory,
              address: newUser.address,
              businessType: newUser.businessType,
              taxNumber: newUser.taxNumber,
              currency: newUser.currency,
              businessAddress: newUser.businessAddress,
              avatar: newUser.shopLogo,
            })

            set((state) => ({ users: [...state.users, newUser], currentUser: newUser }))
            return { success: true }
          }

          const updatedUser = {
            ...matchedUser,
            loginHistory: [loginRecord, ...matchedUser.loginHistory].slice(0, 50),
          }

          const users = get().users
          const userIndex = users.findIndex((u) => u.id === matchedUser.id)
          const nextUsers = users.map((u, idx) => (idx === userIndex ? updatedUser : u))

          set({ users: nextUsers, currentUser: updatedUser })
          return { success: true }
        },

        signInWithGoogle: async () => {
          const provider = new GoogleAuthProvider()

          try {
            const result = await signInWithPopup(auth, provider)
            const user = result.user
            const email = user.email?.toLowerCase() || ""

            if (!email) {
              return { success: false, error: "Unable to get email from Google account." }
            }

            const matchedUser = get().users.find((existing) => existing.email.toLowerCase() === email)
            const now = new Date()
            const date = now.toISOString().split("T")[0]
            const time = now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
            const { device, ipAddress, location } = getDeviceInfo()
            const loginRecord: LoginRecord = {
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              date,
              time,
              location,
              device,
              ipAddress,
              status: "Success",
              action: "Login",
            }

            if (matchedUser) {
              const updatedUser = {
                ...matchedUser,
                loginHistory: [loginRecord, ...matchedUser.loginHistory].slice(0, 50),
              }
              const users = get().users
              const userIndex = users.findIndex((u) => u.id === matchedUser.id)
              const nextUsers = users.map((u, idx) => (idx === userIndex ? updatedUser : u))
              set({ users: nextUsers, currentUser: updatedUser })
              return { success: true }
            }

            const newUser: AuthUser = {
              id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              firebaseUid: user.uid,
              fullName: user.displayName || "Google User",
              shopName: "",
              shopLogo: user.photoURL || "",
              email,
              phoneNumber: user.phoneNumber || "",
              password: "",
              createdAt: new Date().toISOString(),
              loginHistory: [loginRecord],
              address: "",
              businessType: "retail",
              taxNumber: "",
              currency: "PKR",
              businessAddress: "",
            }

            await setDoc(doc(db, "users", user.uid), {
              firebaseUid: user.uid,
              fullName: newUser.fullName,
              shopName: newUser.shopName,
              shopLogo: newUser.shopLogo,
              email: newUser.email,
              phoneNumber: newUser.phoneNumber,
              createdAt: newUser.createdAt,
              loginHistory: newUser.loginHistory,
              address: newUser.address,
              businessType: newUser.businessType,
              taxNumber: newUser.taxNumber,
              currency: newUser.currency,
              businessAddress: newUser.businessAddress,
              avatar: newUser.shopLogo,
            })

            const users = get().users
            set({ users: [...users, newUser], currentUser: newUser })
            return { success: true }
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Google sign-in failed."
            return { success: false, error: message }
          }
        },

        logout: () => set({ currentUser: null }),

        getUser: (id) => get().users.find((user) => user.id === id),

        updateUser: async (id, update) => {
          const users = get().users
          const index = users.findIndex((user) => user.id === id)

          if (index === -1) {
            return { success: false, error: "User not found." }
          }

          const updatedUser = {
            ...users[index],
            ...update,
            email: update.email ? update.email.trim().toLowerCase() : users[index].email,
            phoneNumber: update.phoneNumber ? update.phoneNumber.trim() : users[index].phoneNumber,
          }

          if (update.password) {
            const { device, ipAddress, location } = getDeviceInfo()
            const now = new Date()
            const date = now.toISOString().split("T")[0]
            const time = now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
            const passwordChangeRecord: LoginRecord = {
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              date,
              time,
              location,
              device,
              ipAddress,
              status: "Success",
              action: "Password Change",
            }

            updatedUser.loginHistory = [passwordChangeRecord, ...users[index].loginHistory].slice(0, 50)
          }

          const nextUsers = users.map((user, idx) => (idx === index ? updatedUser : user))
          set({ users: nextUsers })

          if (updatedUser.firebaseUid) {
            const updateData: Record<string, unknown> = {
              fullName: updatedUser.fullName,
              shopName: updatedUser.shopName,
              shopLogo: updatedUser.shopLogo,
              email: updatedUser.email,
              phoneNumber: updatedUser.phoneNumber,
              address: updatedUser.address,
              businessType: updatedUser.businessType,
              taxNumber: updatedUser.taxNumber,
              currency: updatedUser.currency,
              businessAddress: updatedUser.businessAddress,
              avatar: updatedUser.shopLogo,
            }
            if (updatedUser.loginHistory) {
              updateData.loginHistory = updatedUser.loginHistory
            }
            await updateDoc(doc(db, "users", updatedUser.firebaseUid), updateData)
          }

          if (get().currentUser?.id === id) {
            set({ currentUser: updatedUser })
          }

          return { success: true }
        },

        changePassword: async (id, currentPassword, newPassword) => {
          const users = get().users
          const index = users.findIndex((user) => user.id === id)

          if (index === -1) {
            return { success: false, error: "User not found." }
          }

          const user = users[index]

          try {
            // Re-authenticate by signing in with the current password
            await signInWithEmailAndPassword(auth, user.email, currentPassword)

            // Update the Firebase Auth password for the currently signed-in user
            if (auth.currentUser) {
              await updatePassword(auth.currentUser, newPassword)
            }

            // Build password change record and update local store
            const { device, ipAddress, location } = getDeviceInfo()
            const now = new Date()
            const date = now.toISOString().split("T")[0]
            const time = now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })

            const passwordChangeRecord: LoginRecord = {
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              date,
              time,
              location,
              device,
              ipAddress,
              status: "Success",
              action: "Password Change",
            }

            const updatedUser: AuthUser = {
              ...user,
              password: newPassword,
              loginHistory: [passwordChangeRecord, ...user.loginHistory].slice(0, 50),
            }

            const nextUsers = users.map((u, idx) => (idx === index ? updatedUser : u))
            set({ users: nextUsers })

            // Update Firestore with any metadata and loginHistory
            if (updatedUser.firebaseUid) {
              await updateDoc(doc(db, "users", updatedUser.firebaseUid), {
                fullName: updatedUser.fullName,
                shopName: updatedUser.shopName,
                shopLogo: updatedUser.shopLogo,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address,
                businessType: updatedUser.businessType,
                taxNumber: updatedUser.taxNumber,
                currency: updatedUser.currency,
                businessAddress: updatedUser.businessAddress,
                avatar: updatedUser.shopLogo,
                loginHistory: updatedUser.loginHistory,
              })
            }

            if (get().currentUser?.id === id) {
              set({ currentUser: updatedUser })
            }

            return { success: true }
          } catch (error: unknown) {
            let message = "Unable to change password."

            if (error instanceof FirebaseError && error.code) {
              switch (error.code) {
                case "auth/wrong-password":
                case "auth/invalid-credential":
                case "auth/user-mismatch":
                  message = "Current password is incorrect."
                  break
                case "auth/requires-recent-login":
                  message = "Please sign in again and try changing your password."
                  break
                case "auth/weak-password":
                  message = "New password is too weak. Choose a stronger password."
                  break
                default:
                  message = error instanceof Error ? error.message : message
              }
            } else if (error instanceof Error) {
              message = error.message
            }

            return { success: false, error: message }
          }
        },

        deleteUser: (id) => {
          const users = get().users
          const exists = users.some((user) => user.id === id)

          if (!exists) {
            return { success: false, error: "User not found." }
          }

          const nextUsers = users.filter((user) => user.id !== id)
          set({ users: nextUsers })

          if (get().currentUser?.id === id) {
            set({ currentUser: null })
          }

          return { success: true }
        },
      }
    },
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
