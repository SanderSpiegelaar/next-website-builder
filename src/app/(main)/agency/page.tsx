import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import React from "react"

type Props = {}

const AgencyDashboardPage = async (props: Props) => {
	const authUser = await currentUser()
	if (!authUser) return redirect("/sign-in")

	return <div>AgencyDashboardPage</div>
}

export default AgencyDashboardPage
