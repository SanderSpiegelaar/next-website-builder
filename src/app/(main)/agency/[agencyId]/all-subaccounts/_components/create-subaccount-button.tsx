"use client"
import SubAccountDetailsForm from "@/components/forms/subaccount-details-form"
import CustomModal from "@/components/global/custom-modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useModal } from "@/providers/modal-provider"
import { Agency, AgencySidebarOption, SubAccount, User } from "@prisma/client"
import { PlusCircleIcon } from "lucide-react"
import React from "react"

type Props = {
	user: User & {
		agency:
			| (
					| Agency
					| (null & {
							subAccount: SubAccount[]
							sidebarOption: AgencySidebarOption[]
					  })
			  )
			| null
	}
	id: string
	className: string
}

const CreateSubAccountButton = ({ className, id, user }: Props) => {
	const { setOpen } = useModal()
	const agencyDetails = user.agency

	if (!agencyDetails) return

	const handleClick = () => {
		setOpen(
			<CustomModal
				title="Create a Sub Account"
				subheading="You can switch between accounts and subaccounts"
			>
				<SubAccountDetailsForm
					agencyDetails={agencyDetails}
					userId={user.id}
					userName={user.name}
				/>
			</CustomModal>
		)
	}

	return (
		<Button
			className={cn("flex w-full gap-4", className)}
			onClick={handleClick}
		>
			<PlusCircleIcon size={15} />
			Create Sub Account
		</Button>
	)
}

export default CreateSubAccountButton
