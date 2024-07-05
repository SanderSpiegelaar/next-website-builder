import { getAuthUserDetails } from "@/lib/queries"
import React from "react"
import MenuOptions from "./menu-options"

type Props = {
	id: string
	type: "agency" | "subaccount"
}

const Sidebar = async ({ id, type }: Props) => {
	const user = await getAuthUserDetails()

	if (!user) return null
	if (!user.agency) return

	const details =
		type === "agency"
			? user?.agency
			: user?.agency.subAccount.find((subaccount) => subaccount.id === id)

	if (!details) return

	let sidebarLogo = user.agency.agencyLogo || "/assets/plura-logo.svg"
	const isWhiteLabeled = user.agency.whiteLabel

	if (!isWhiteLabeled) {
		if (type === "subaccount") {
			sidebarLogo =
				user?.agency.subAccount.find((subaccount) => subaccount.id === id)
					?.subAccountLogo || user.agency.agencyLogo
		}
	}

	const sidebarOptions =
		type === "agency"
			? user.agency.sidebarOption || []
			: user.agency.subAccount.find((subaccount) => subaccount.id === id)
					?.sidebarOption || []

	const subAccounts = user.agency.subAccount.filter((subaccount) =>
		user.permissions.find(
			(permission) =>
				permission.subAccountId === subaccount.id && permission.access
		)
	)

	return (
		<>
			<MenuOptions
				defaultOpen={true}
				subAccounts={subAccounts}
				sidebarOptions={sidebarOptions}
				sidebarLogo={sidebarLogo}
				details={details}
				user={user}
				id={id}
			/>
			<MenuOptions
				subAccounts={subAccounts}
				sidebarOptions={sidebarOptions}
				sidebarLogo={sidebarLogo}
				details={details}
				user={user}
				id={id}
			/>
		</>
	)
}

export default Sidebar
