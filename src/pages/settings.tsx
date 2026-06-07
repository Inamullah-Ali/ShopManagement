
import { useState } from "react"
import { AlertCircle, Eye, EyeOff, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function Settings() {
  const [businessInfo, setBusinessInfo] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    website: "",
  })

  const [preferences, setPreferences] = useState({
    currency: "USD",
    timezone: "UTC",
    dateFormat: "MM/dd/yyyy",
    timeFormat: "12h",
    lowStockThreshold: "10",
    language: "English",
  })

  const [notifications, setNotifications] = useState({
    stockAlerts: true,
    lowStockEmails: true,
    saleSummaries: true,
    dailyReports: false,
    productUpdates: false,
    systemAlerts: true,
  })

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    ipWhitelist: false,
  })

  const [apiKey, setApiKey] = useState("sk_live_1234567890abcdef")
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const regenerateApiKey = () => {
    setApiKey(`sk_live_${Math.random().toString(36).substr(2, 20)}`)
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your shop configuration, preferences, and account settings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business information</CardTitle>
                <CardDescription>Update your shop details for invoices, reports, and contact.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="shopName">Shop name</Label>
                    <Input
                      id="shopName"
                      value={businessInfo.shopName}
                      onChange={(e) => setBusinessInfo((prev) => ({ ...prev, shopName: e.target.value }))}
                      placeholder="Your shop name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ownerName">Owner name</Label>
                    <Input
                      id="ownerName"
                      value={businessInfo.ownerName}
                      onChange={(e) => setBusinessInfo((prev) => ({ ...prev, ownerName: e.target.value }))}
                      placeholder="Owner or manager"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Business email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={businessInfo.email}
                      onChange={(e) => setBusinessInfo((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="owner@shop.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="123-456-7890"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Business address</Label>
                  <Input
                    id="address"
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street, City, Country"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    value={businessInfo.website}
                    onChange={(e) => setBusinessInfo((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourshop.com"
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button>Save business info</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Set defaults for currency, dates, timezone, and language.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Default currency</Label>
                    <Input
                      id="currency"
                      value={preferences.currency}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, currency: e.target.value }))}
                      placeholder="USD"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={preferences.timezone}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, timezone: e.target.value }))}
                      placeholder="UTC"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="dateFormat">Date format</Label>
                    <Input
                      id="dateFormat"
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, dateFormat: e.target.value }))}
                      placeholder="MM/dd/yyyy"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="timeFormat">Time format</Label>
                    <Input
                      id="timeFormat"
                      value={preferences.timeFormat}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, timeFormat: e.target.value }))}
                      placeholder="12h"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={preferences.language}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, language: e.target.value }))}
                      placeholder="English"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={preferences.lowStockThreshold}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, lowStockThreshold: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button>Save preferences</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification settings</CardTitle>
                <CardDescription>Control what email and in-app notifications you receive.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-start gap-4 rounded-lg border border-input p-4">
                  <Input
                    id="stockAlerts"
                    type="checkbox"
                    checked={notifications.stockAlerts}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, stockAlerts: e.target.checked }))}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Stock alerts</p>
                    <p className="text-sm text-muted-foreground">Alerts when inventory is low or out of stock.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-input p-4">
                  <Input
                    id="lowStockEmails"
                    type="checkbox"
                    checked={notifications.lowStockEmails}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, lowStockEmails: e.target.checked }))}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Low stock email notifications</p>
                    <p className="text-sm text-muted-foreground">Receive emails for low inventory items.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-input p-4">
                  <Input
                    id="saleSummaries"
                    type="checkbox"
                    checked={notifications.saleSummaries}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, saleSummaries: e.target.checked }))}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Daily sales summaries</p>
                    <p className="text-sm text-muted-foreground">Daily email with sales and revenue summary.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-input p-4">
                  <Input
                    id="dailyReports"
                    type="checkbox"
                    checked={notifications.dailyReports}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, dailyReports: e.target.checked }))}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Daily performance reports</p>
                    <p className="text-sm text-muted-foreground">Detailed daily reports of your shop performance.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-input p-4">
                  <Input
                    id="productUpdates"
                    type="checkbox"
                    checked={notifications.productUpdates}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, productUpdates: e.target.checked }))}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Product feature updates</p>
                    <p className="text-sm text-muted-foreground">News about new features and improvements.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-input p-4">
                  <Input
                    id="systemAlerts"
                    type="checkbox"
                    checked={notifications.systemAlerts}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, systemAlerts: e.target.checked }))}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">System and security alerts</p>
                    <p className="text-sm text-muted-foreground">Important system alerts and security notifications.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button>Save notifications</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security settings</CardTitle>
                <CardDescription>Protect your account with security options.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-start gap-4 rounded-lg border border-input p-4">
                  <Input
                    id="twoFactorAuth"
                    type="checkbox"
                    checked={security.twoFactorAuth}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, twoFactorAuth: e.target.checked }))}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-input p-4">
                  <Input
                    id="loginAlerts"
                    type="checkbox"
                    checked={security.loginAlerts}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, loginAlerts: e.target.checked }))}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Login alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified of logins from new devices or locations.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg border border-input p-4">
                  <Input
                    id="ipWhitelist"
                    type="checkbox"
                    checked={security.ipWhitelist}
                    onChange={(e) => setSecurity((prev) => ({ ...prev, ipWhitelist: e.target.checked }))}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">IP whitelist</p>
                    <p className="text-sm text-muted-foreground">Only allow access from specific IP addresses.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button>Save security settings</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API & Integrations</CardTitle>
                <CardDescription>Manage API keys and third-party integrations.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        readOnly
                        className="pr-10"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyApiKey}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Keep your API key secret and never share it publicly.</p>
                </div>

                <Button variant="outline" onClick={regenerateApiKey}>
                  Regenerate API Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup & Export</CardTitle>
                <CardDescription>Download your data for backup or migration purposes.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <p className="text-sm">Export your shop data in CSV or JSON format.</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button variant="outline">Export as CSV</Button>
                    <Button variant="outline">Export as JSON</Button>
                    <Button variant="outline">Schedule Backup</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Danger zone</CardTitle>
                <CardDescription>Irreversible actions that cannot be undone.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-background p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-destructive shrink-0" />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">Delete all data</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all your shop data, products, customers, and transactions. This action cannot be reversed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-background p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-destructive shrink-0" />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">Close account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently close your shop account. All data will be deleted and this cannot be undone.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="outline">Delete all data</Button>
                <Button variant="destructive">Close account</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick settings</CardTitle>
                <CardDescription>Summary of your current configuration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-foreground">Currency</p>
                  <p className="text-muted-foreground">{preferences.currency}</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-foreground">Timezone</p>
                  <p className="text-muted-foreground">{preferences.timezone}</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-foreground">Language</p>
                  <p className="text-muted-foreground">{preferences.language}</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-foreground">Low stock threshold</p>
                  <p className="text-muted-foreground">{preferences.lowStockThreshold} items</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active notifications</CardTitle>
                <CardDescription>Your enabled notification types.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {notifications.stockAlerts && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Stock alerts</span>
                  </div>
                )}
                {notifications.saleSummaries && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Sales summaries</span>
                  </div>
                )}
                {notifications.systemAlerts && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>System alerts</span>
                  </div>
                )}
                {notifications.dailyReports && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Daily reports</span>
                  </div>
                )}
                {!Object.values(notifications).some((v) => v) && (
                  <p className="text-muted-foreground">No notifications enabled</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account info</CardTitle>
                <CardDescription>Your account details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">Plan</p>
                  <p className="text-muted-foreground">Professional</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Billing cycle</p>
                  <p className="text-muted-foreground">Monthly</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Next billing</p>
                  <p className="text-muted-foreground">July 5, 2026</p>
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  Manage billing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
