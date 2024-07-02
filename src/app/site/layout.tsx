import Navigation from "@/components/site/navigation"
import React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

const SiteLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<ClerkProvider appearance={{ baseTheme: dark }}>
			<main className="h-full">
				<Navigation />
				{children}
			</main>
		</ClerkProvider>
	)
}

export default SiteLayout
