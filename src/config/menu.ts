import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { routes } from '../router'

export interface MenuItem {
  title: string
  path: string
  icon?: Component
  children?: MenuItem[]
}

const resolvePath = (basePath: string, routePath: string): string => {
  // Handle absolute paths
  if (routePath.startsWith('/')) return routePath
  // Handle root parent
  if (basePath === '/') return `/${routePath}`
  // Handle standard concatenation
  return `${basePath}/${routePath}`.replace(/\/+/g, '/')
}

const generateMenuFromRoutes = (routes: RouteRecordRaw[], basePath = ''): MenuItem[] => {
  const menu: MenuItem[] = []

  routes.forEach(route => {
    // Skip hidden routes
    if (route.meta?.hidden) return

    // Special handling for root route '/' to flatten its children into the main menu
    if (route.path === '/') {
      if (route.children) {
        menu.push(...generateMenuFromRoutes(route.children, ''))
      }
      return
    }

    const fullPath = resolvePath(basePath, route.path)
    const item: MenuItem = {
      title: (route.meta?.title as string) || '',
      path: fullPath,
      icon: route.meta?.icon as Component
    }

    // Recursively process children
    if (route.children && route.children.length > 0) {
      const children = generateMenuFromRoutes(route.children, fullPath)
      if (children.length > 0) {
        item.children = children
      }
    }

    // Only add if it has a title (valid menu item)
    if (item.title) {
      menu.push(item)
    }
  })

  return menu
}

export const sidebarMenu = generateMenuFromRoutes(routes)
