import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from "react-router-dom"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVerticalIcon, CircleUserRoundIcon, BellIcon, SettingsIcon, SunMoonIcon } from "lucide-react"
import { ThemeSwitch } from "./themeswitcher"
import { LogoutDialogue } from "./dialogue/logoutdialogue"

const getNameInitial = (name: string) => {
  return name.trim().charAt(0).toUpperCase() || "U"
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar?: string
  }
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  return (
    <SidebarMenu>      
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-[#7C3AED] data-[state=open]:text-white hover:bg-[#6D28D9] hover:text-white focus-visible:bg-[#6D28D9]"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getNameInitial(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{getNameInitial(user.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/account")} className="cursor-pointer">
                <CircleUserRoundIcon
                />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsNotificationsOpen(true)} className="cursor-pointer">
                <BellIcon
                />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-2">
                <SunMoonIcon
                />
                Theme Mode
                </div>
                <ThemeSwitch />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings") } className="cursor-pointer">
                <SettingsIcon
                />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            
<LogoutDialogue />
          </DropdownMenuContent>
        </DropdownMenu>

        <Drawer open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen} direction={isMobile ? "bottom" : "right"}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Notifications</DrawerTitle>
              <DrawerDescription>Recent updates and alerts for your account.</DrawerDescription>
            </DrawerHeader>
            <div className="space-y-3 px-4 pb-4">
              <div className="rounded-3xl border border-border bg-card p-4">
                <p className="text-sm font-medium">No new notifications</p>
                <p className="mt-2 text-sm text-muted-foreground">You are all caught up for now.</p>
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <button className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted">
                  Close
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
