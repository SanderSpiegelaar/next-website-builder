import { db } from "@/lib/db"
import React from "react"
import DataTable from "./data-table"
import { Plus } from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"
import { columns } from "./columns"

type Props = {
	params: {
		agencyId: string
	}
}

const AgencyTeamPage = async ({ params }: Props) => {
	const authUser = await currentUser()
	const teamMembers = await db.user.findMany({
		where: {
			agency: {
				id: params.agencyId
			}
		},
		include: {
			agency: { include: { subAccount: true } },
			permissions: { include: { subAccount: true } }
		}
	})
	if (!authUser) return null

	const agencyDetails = await db.agency.findUnique({
		where: { id: params.agencyId },
		include: { subAccount: true }
	})
	if (!agencyDetails) return null

	return (
		<DataTable
			actionButtonText={
				<>
					<Plus size={15} /> Add
				</>
			}
			modalChildren={<></>}
			filterValue="name"
			columns={columns}
			data={teamMembers}
		></DataTable>
	)
}

export default AgencyTeamPage
