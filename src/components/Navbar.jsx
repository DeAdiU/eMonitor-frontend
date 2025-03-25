'use client'

import Link from "next/link"
import { useState } from "react"
import { Menu, X, User, LayoutDashboard, BarChart2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/toggleTheme"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import UserNav from "./userNav"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const NavLinks = [
    { 
      href: "/dashboard", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="mr-2 h-4 w-4" /> 
    },
    { 
      href: "/analytics", 
      label: "Analytics", 
      icon: <BarChart2 className="mr-2 h-4 w-4" /> 
    },
    { 
      href: "/courses", 
      label: "Courses", 
      icon: <BookOpen className="mr-2 h-4 w-4" /> 
    }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Blurry Background */}
      <div className="absolute inset-0 bg-background/10 backdrop-blur supports-[backdrop-filter]:bg-background/20 z-[-1]"></div>
      
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">eMonitor</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {NavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center text-md font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          <div className="flex items-center space-x-4 ml-4">
            <ModeToggle />
            <UserNav/>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2">
          <ModeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="min-size-120px bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold">eMonitor</SheetTitle>
              </SheetHeader>
              <div className="grid gap-2 py-4">
                {NavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex font-semibold items-center p-2 mx-3 my-1 hover:bg-accent rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center space-x-4">
                
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}