import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/authstore"
import {
  LayoutDashboardIcon,
  UsersIcon,
  Package,
  Layers,
  CreditCard,
  Truck,
  ShoppingCart,
  DollarSign,
  FileText,
  BarChart,
} from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Products",
      url: "/products",
      icon: (
        <Package />
      ),
    },
    {
      title: "Stock Management",
      url: "/stock-management",
      icon: (
        <Layers />
      ),
    },
    {
      title: "Customers",
      url: "/customers",
      icon: (
        <UsersIcon />
      ),
    },
    {
      title: "Credit Customers",
      url: "/credit-customers",
      icon: (
        <CreditCard />
      ),
    },
    {
      title: "Suppliers",
      url: "/suppliers",
      icon: (
        <Truck />
      ),
    },
    {
      title: "Purchases",
      url: "/purchase",
      icon: (
        <ShoppingCart />
      ),
    },
    {
      title: "Sales",
      url: "/sales",
      icon: (
        <DollarSign />
      ),
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: (
        <FileText />
      ),
    },
    {
      title: "Reports",
      url: "/reports",
      icon: (
        <BarChart />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentUser = useAuthStore((state) => state.currentUser)
  const shop = currentUser
    ? {
        name: currentUser.shopName || currentUser.fullName,
        logo: currentUser.shopLogo,
      }
    : {
        name: data.user.name,
        logo: undefined,
      }
  const user = currentUser
    ? {
        name: currentUser.fullName,
        email: currentUser.email,
        avatar: currentUser.avatar,
      }
    : data.user

  const getShopInitial = (name: string) => name.trim().charAt(0).toUpperCase() || "S"

  return (
    <Sidebar collapsible="icon" forceDark {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#" className="flex items-center gap-2">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={shop.logo} alt={shop.name} />
                  <AvatarFallback>{getShopInitial(shop.name)}</AvatarFallback>
                </Avatar>
                <span className="text-base font-semibold">{shop.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
