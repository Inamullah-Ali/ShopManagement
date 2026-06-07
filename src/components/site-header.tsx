import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useLocation } from "react-router"

export function SiteHeader() {
  const location = useLocation()

  const pageTitleMap: Record<string, string> = {
    dashboard: "Dashboard",
    products: "Products",
    "stock-management": "Stock Management",
    customers: "Customers",
    suppliers: "Suppliers",
    purchases: "Purchases",
    sales: "Sales",
    reports: "Reports",
    expenses: "Expenses",
    settings: "Settings",
  }

  const currentPath = location.pathname.replace(/^\//, "") || "dashboard"
  const currentPageTitle =
    pageTitleMap[currentPath] ??
    currentPath
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 py-2 sm:px-6 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator
          orientation="vertical"
          className="mx-1 hidden h-4 sm:block sm:mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="min-w-0 truncate text-lg font-bold font-sans">{currentPageTitle}</h1>
      </div>
    </header>
  )
}
