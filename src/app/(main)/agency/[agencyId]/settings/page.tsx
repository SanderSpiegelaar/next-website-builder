import AgencyDetailsForm from "@/components/forms/agency-details-form"
import UserDetailsForm from "@/components/forms/user-details-form"
import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"
import React from "react"

type Props = {
	params: { agencyId: string }
}

const SettingsPage = async ({ params }: Props) => {
	const authUser = await currentUser()
	if (!authUser) return null

	const userDetails = await db.user.findUnique({
		where: {
			email: authUser.emailAddresses[0].emailAddress
		}
	})
	if (!userDetails) return null

	const agencyDetails = await db.agency.findUnique({
		where: {
			id: params.agencyId
		},
		include: {
			subAccount: true
		}
	})
	if (!agencyDetails) return null

	const subAccounts = agencyDetails.subAccount

	return (
		<div className="flex flex-col gap-4 lg:!flex-row">
			<AgencyDetailsForm data={agencyDetails} />
			<UserDetailsForm
				type="agency"
				id={params.agencyId}
				subAccounts={subAccounts}
				userData={userDetails}
			/>
		</div>
	)
}

export default SettingsPage
