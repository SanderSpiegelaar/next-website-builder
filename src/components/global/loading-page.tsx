import { Loader2 } from "lucide-react"
import React from "react"

const LoadingPage = () => {
	return (
		<div className="flex h-full w-full items-center justify-center">
			<Loader2 className="size-8 animate-spin" />
		</div>
	)
}

export default LoadingPage
