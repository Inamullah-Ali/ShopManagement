import { Link, useLocation } from "react-router-dom"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
  }[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const itemPath = item.url.startsWith("/") ? item.url : `/${item.url}`;
          const isActive = location.pathname === itemPath;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`${
                  isActive
                    ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                    : "hover:bg-[#6D28D9]"
                }`}
              >
                <Link
                  to={itemPath}
                  className="flex items-center gap-2"
                >
                  {item.icon}
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
