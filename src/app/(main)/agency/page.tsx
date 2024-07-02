import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import React from "react"

type Props = {}

const AgencyDashboardPage = async (props: Props) => {
	const agencyId = await verifyAndAcceptInvitation()

	console.log(agencyId)

	const user = getAuthUserDetails()

	return <div>AgencyDashboardPage</div>
}

export default AgencyDashboardPage
