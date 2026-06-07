import { useState } from "react"
import type { ComponentProps, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "@/store/authstore"

export function LoginForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const navigate = useNavigate()
  const loginUser = useAuthStore((state) => state.loginUser)
  const registerUser = useAuthStore((state) => state.registerUser)
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginValues, setLoginValues] = useState({
    email: "",
    password: "",
  })
  const [signUpValues, setSignUpValues] = useState({
    fullName: "",
    shopName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })

  

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")

    const email = loginValues.email.trim()
    const password = loginValues.password.trim()

    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }

    const result = await loginUser(email, password)

    if (!result.success) {
      setError(result.error ?? "Invalid login credentials. Please check your email and password.")
      return
    }

    navigate("/dashboard")
  }

  const handleSignUpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")

    const { fullName, shopName, email, phoneNumber, password, confirmPassword } = signUpValues

    if (!fullName.trim() || !shopName.trim() || !email.trim() || !phoneNumber.trim() || !password || !confirmPassword) {
      setError("Please complete all sign up fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    const result = await registerUser({
      fullName: fullName.trim(),
      shopName: shopName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      password,
    })

    if (!result.success) {
      setError(result.error ?? "Unable to register user.")
      return
    }

    setMessage("Sign up successful. Please log in with your email and password.")
    setMode("login")
    setLoginValues({ email: email.trim(), password: "" })
    setSignUpValues({
      fullName: "",
      shopName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    })
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setMessage("")

    const result = await signInWithGoogle()
    if (!result.success) {
      setError(result.error ?? "Google login failed.")
      return
    }

    navigate("/dashboard")
  }

  return (
    <div className={cn("flex flex-col items-center gap-6", className)} {...props}>
      <Card className="overflow-hidden w-96">
        <CardContent className="max-w-lg">
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    Login to your account
                  </p>
                </div>
                {error ? (
                  <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}
                {message ? (
                  <div className="rounded-3xl border border-emerald-400/20 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {message}
                  </div>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={loginValues.email}
                    onChange={(event) =>
                      setLoginValues((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="loginPassword">Password</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="loginPassword"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginValues.password}
                      onChange={(event) =>
                        setLoginValues((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </Field>
                <Field>
                  <Button type="submit" className="cursor-pointer">Login</Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
                <Field className="">
                  <Button variant="outline" type="button" onClick={handleGoogleSignIn} className="cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">Login with Google</span>
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup")
                      setError("")
                      setMessage("")
                    }}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Sign up
                  </button>
                </FieldDescription>
              </FieldGroup>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Create your account</h1>
                  <p className="text-balance text-muted-foreground">
                    Register with your business details
                  </p>
                </div>
                {error ? (
                  <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input
                    id="fullName"
                    value={signUpValues.fullName}
                    onChange={(event) =>
                      setSignUpValues((prev) => ({
                        ...prev,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="John Doe"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="shopName">Shop Name</FieldLabel>
                  <Input
                    id="shopName"
                    value={signUpValues.shopName}
                    onChange={(event) =>
                      setSignUpValues((prev) => ({
                        ...prev,
                        shopName: event.target.value,
                      }))
                    }
                    placeholder="My Store"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="signUpEmail">Email</FieldLabel>
                  <Input
                    id="signUpEmail"
                    type="email"
                    value={signUpValues.email}
                    onChange={(event) =>
                      setSignUpValues((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={signUpValues.phoneNumber}
                    onChange={(event) =>
                      setSignUpValues((prev) => ({
                        ...prev,
                        phoneNumber: event.target.value,
                      }))
                    }
                    placeholder="03451234567"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="signUpPassword">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="signUpPassword"
                      type={showSignUpPassword ? "text" : "password"}
                      value={signUpValues.password}
                      onChange={(event) =>
                        setSignUpValues((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSignUpPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={signUpValues.confirmPassword}
                      onChange={(event) =>
                        setSignUpValues((prev) => ({
                          ...prev,
                          confirmPassword: event.target.value,
                        }))
                      }
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </Field>
                <Field>
                  <Button type="submit">Sign Me Up</Button>
                </Field>
                <FieldDescription className="text-center">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login")
                      setError("")
                      setMessage("")
                    }}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    Login
                  </button>
                </FieldDescription>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
