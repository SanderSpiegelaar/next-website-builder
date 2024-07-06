"use client"
import {
	getSubAccountDetails,
	saveActivityLogNotification,
	deleteSubAccount
} from "@/lib/queries"
import { useRouter } from "next/navigation"
import React from "react"

type Props = {
	subAccountId: string
}

const DeleteSubAccountButton = ({ subAccountId }: Props) => {
	const router = useRouter()

	const handleDelete = async () => {
		const response = await getSubAccountDetails(subAccountId)
		await saveActivityLogNotification({
			agencyId: undefined,
			description: `Deleted a subaccount | ${response?.name}`,
			subAccountId
		})

		await deleteSubAccount(subAccountId)
		router.refresh()
	}
	return <div onClick={handleDelete}>Delete Sub Account</div>
}

export default DeleteSubAccountButton
