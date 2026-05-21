import config from '@payload-config'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap.js'
import type { ServerFunctionClientArgs } from 'payload'
import '@payloadcms/next/css'
import '@payloadcms/ui/styles.css'
import React from 'react'

type Args = {
  children: React.ReactNode
}

const serverFunction = async function (args: ServerFunctionClientArgs) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

export default async function PayloadLayout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
