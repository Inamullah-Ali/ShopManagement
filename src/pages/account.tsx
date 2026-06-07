import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Upload, Camera, LogIn, LockKeyhole, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/store/authstore";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function Account() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  // Profile State
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    avatar: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const shopLogoInputRef = useRef<HTMLInputElement | null>(null);

  // Business State
  const [business, setBusiness] = useState({
    shopName: "",
    shopLogo: "",
    businessType: "retail",
    taxNumber: "",
    currency: "PKR",
    address: "",
  });

  // Password State
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    language: "English",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    timezone: "UTC+5",
    emailNotifications: true,
    lowStockAlerts: true,
    dailySummary: true,
  });

  // UI State
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const shopLogo = "/api/placeholder/100/100";

  useEffect(() => {
    if (!currentUser) return;

    setProfile({
      fullName: currentUser.fullName,
      email: currentUser.email,
      phoneNumber: currentUser.phoneNumber,
      address: currentUser.address || "",
      avatar: currentUser.avatar || "",
    });

    setBusiness({
      shopName: currentUser.shopName,
      shopLogo: currentUser.shopLogo || "",
      businessType: currentUser.businessType || "retail",
      taxNumber: currentUser.taxNumber || "",
      currency: currentUser.currency || "PKR",
      address: currentUser.businessAddress || "",
    });
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold">
            No account information available
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in again or contact support.
          </p>
        </div>
      </div>
    );
  }

  const handleSaveChanges = async () => {
    setStatusMessage(null);

    const result = await updateUser(currentUser.id, {
      fullName: profile.fullName.trim(),
      email: profile.email.trim(),
      phoneNumber: profile.phoneNumber.trim(),
      address: profile.address.trim(),
      avatar: profile.avatar,
      shopName: business.shopName.trim(),
      shopLogo: business.shopLogo,
      businessType: business.businessType,
      taxNumber: business.taxNumber.trim(),
      currency: business.currency,
      businessAddress: business.address.trim(),
    });

    setStatusMessage({
      type: result.success ? "success" : "error",
      message: result.success
        ? "Changes saved successfully."
        : (result.error ?? "Unable to save changes."),
    });
  };

  const handlePasswordUpdate = async () => {
    setStatusMessage(null);

    if (!password.current || !password.new || !password.confirm) {
      setStatusMessage({
        type: "error",
        message: "Please fill all password fields.",
      });
      return;
    }

    if (password.current !== currentUser.password) {
      setStatusMessage({
        type: "error",
        message: "Current password is incorrect.",
      });
      return;
    }

    if (password.new !== password.confirm) {
      setStatusMessage({
        type: "error",
        message: "New passwords do not match.",
      });
      return;
    }

    if (password.new.length < 6) {
      setStatusMessage({
        type: "error",
        message: "Password must be at least 6 characters.",
      });
      return;
    }

    const result = await updateUser(currentUser.id, { password: password.new });

    if (result.success) {
      setPassword({ current: "", new: "", confirm: "" });
    }

    setStatusMessage({
      type: result.success ? "success" : "error",
      message: result.success
        ? "Password updated successfully."
        : (result.error ?? "Unable to update password."),
    });
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prevProfile) => ({
        ...prevProfile,
        avatar: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleShopLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setBusiness((prevBusiness) => ({
        ...prevBusiness,
        shopLogo: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const activityData =
    currentUser.loginHistory?.slice(0, 5).map((login) => ({
      activity:
        login.action === "Password Change"
          ? "Password Change"
          : login.status === "Success"
            ? "Login"
            : "Login Failed",
      device: login.device,
      ipAddress: login.ipAddress,
      dateTime: `${login.date} ${login.time}`,
      icon: login.action === "Password Change" ? LockKeyhole : LogIn,
      status: login.status,
    })) || [];

  return (
    <div className="flex flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
            <p className="text-muted-foreground">
              Manage your account information and security settings
            </p>
          </div>
          <Button onClick={handleSaveChanges} size="lg">
            Save Changes
          </Button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              statusMessage.type === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {statusMessage.message}
          </div>
        )}

        {/* Top Section: Profile & Password */}
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Profile Information */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 lg:flex-row lg:gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4 lg:w-72">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-3 border-muted">
                    <img
                      src={
                        profile.avatar ||
                        currentUser?.avatar ||
                        business.shopLogo ||
                        shopLogo
                      }
                      alt={profile.fullName || currentUser?.fullName || "User"}
                      className="aspect-square size-full object-cover rounded-full"
                      width={96}
                      height={96}
                    />
                  </div>

                  <label
                    htmlFor="profile-avatar-upload"
                    className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white hover:bg-primary/90 cursor-pointer"
                  >
                    <Camera size={16} />
                  </label>
                  <input
                    id="profile-avatar-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="text-center">
                  <p className="font-semibold">{profile.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} className="mr-2" />
                  Change Profile Photo
                </Button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-2 -mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        email: e.target.value,
                      }))
                    }
                    placeholder="your@email.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        phoneNumber: e.target.value,
                      }))
                    }
                    placeholder="03001234567"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        address: e.target.value,
                      }))
                    }
                    placeholder="Your address"
                    className="min-h-15"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password securely</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>

                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword.current ? "text" : "password"}
                    value={password.current}
                    onChange={(e) =>
                      setPassword((p) => ({ ...p, current: e.target.value }))
                    }
                    placeholder="Enter current password"
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((p) => ({
                        ...p,
                        current: !p.current,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    value={password.new}
                    onChange={(e) =>
                      setPassword((p) => ({ ...p, new: e.target.value }))
                    }
                    placeholder="Enter new password"
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((p) => ({
                        ...p,
                        new: !p.new,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    value={password.confirm}
                    onChange={(e) =>
                      setPassword((p) => ({ ...p, confirm: e.target.value }))
                    }
                    placeholder="Confirm new password"
                    className="pr-10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((p) => ({
                        ...p,
                        confirm: !p.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                onClick={handlePasswordUpdate}
                variant="outline"
                className="h-8 border-2 border-purple-300 text-purple-600 hover:bg-purple-50 cursor-pointer hover:text-purple-700 text-sm font-semibold"
              >
                <LockKeyhole size={16} />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section: Business & Preferences */}
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Business Information */}
          <Card className="lg:col-span-3 h-fit">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Store your business details</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8 lg:flex-row lg:gap-8">
              {/* Business Fields */}
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="shopName">Shop Name</Label>
                    <Input
                      id="shopName"
                      value={business.shopName}
                      onChange={(e) =>
                        setBusiness((b) => ({
                          ...b,
                          shopName: e.target.value,
                        }))
                      }
                      placeholder="Your shop name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="businessType">Business Type</Label>

                    <Select
                      value={business.businessType}
                      onValueChange={(v) =>
                        setBusiness((b) => ({
                          ...b,
                          businessType: v,
                        }))
                      }
                    >
                      <SelectTrigger id="businessType" className="w-full">
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="online">Online Store</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="taxNumber">Tax Number (NTN)</Label>
                    <Input
                      id="taxNumber"
                      value={business.taxNumber}
                      onChange={(e) =>
                        setBusiness((b) => ({
                          ...b,
                          taxNumber: e.target.value,
                        }))
                      }
                      placeholder="Enter NTN"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={business.currency}
                      onValueChange={(v) =>
                        setBusiness((b) => ({ ...b, currency: v }))
                      }
                    >
                      <SelectTrigger id="currency" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PKR">
                          PKR - Pakistani Rupee
                        </SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={business.address}
                    onChange={(e) =>
                      setBusiness((b) => ({ ...b, address: e.target.value }))
                    }
                    placeholder="Your business address"
                    className="min-h-24"
                  />
                </div>
              </div>
              {/* Shop Logo */}
              <div className="flex flex-col gap-4 lg:self-end ">
                <p className="text-md font-semibold">Shop Logo</p>
                <img
                  src={business.shopLogo || shopLogo}
                  alt="Shop Logo"
                  className="h-24 w-24 rounded-lg border-2 border-muted object-cover"
                />

                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                  onClick={() => shopLogoInputRef.current?.click()}
                >
                  <Camera size={16} className="mr-2" />
                  Change Logo
                </Button>
                <input
                  ref={shopLogoInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleShopLogoChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Preferences */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(v) =>
                      setPreferences((p) => ({ ...p, language: v }))
                    }
                  >
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Urdu">Urdu</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(v) =>
                      setPreferences((p) => ({ ...p, dateFormat: v }))
                    }
                  >
                    <SelectTrigger id="dateFormat" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select
                    value={preferences.timeFormat}
                    onValueChange={(v) =>
                      setPreferences((p) => ({ ...p, timeFormat: v }))
                    }
                  >
                    <SelectTrigger id="timeFormat" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24-Hour (15:30)</SelectItem>
                      <SelectItem value="12h">12-Hour (3:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(v) =>
                      setPreferences((p) => ({ ...p, timezone: v }))
                    }
                  >
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC+5">UTC+5 (Pakistan)</SelectItem>
                      <SelectItem value="UTC">UTC (London)</SelectItem>
                      <SelectItem value="UTC-5">UTC-5 (Eastern)</SelectItem>
                      <SelectItem value="UTC+8">UTC+8 (China)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Receive email updates
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences((p) => ({
                        ...p,
                        emailNotifications: checked,
                      }))
                    }
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Low Stock Alerts</p>
                    <p className="text-xs text-muted-foreground">
                      Alert when stock is low
                    </p>
                  </div>
                  <Switch
                    checked={preferences.lowStockAlerts}
                    onCheckedChange={(checked) =>
                      setPreferences((p) => ({
                        ...p,
                        lowStockAlerts: checked,
                      }))
                    }
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Daily Summary</p>
                    <p className="text-xs text-muted-foreground">
                      Daily summary notifications
                    </p>
                  </div>
                  <Switch
                    checked={preferences.dailySummary}
                    onCheckedChange={(checked) =>
                      setPreferences((p) => ({
                        ...p,
                        dailySummary: checked,
                      }))
                    }
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Activity</CardTitle>
                <CardDescription>
                  Recent login and security events
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All Activity
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Device / Browser</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityData.length > 0 ? (
                    activityData.map((activity, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {activity.activity}
                            </span>
                            {activity.status === "Success" ? (
                              <p className="bg-green-100 text-green-500 px-2 rounded-md">
                                Success
                              </p>
                            ) : (
                              <p className="bg-amber-100 text-amber-500 px-2 rounded-md">
                                Failed
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {activity.device}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {activity.ipAddress}
                        </TableCell>
                        <TableCell className="text-sm">
                          {activity.dateTime}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-4 text-sm text-muted-foreground"
                      >
                        No activity recorded yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
