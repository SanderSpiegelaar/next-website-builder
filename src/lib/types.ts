import { Notification, Prisma, Role } from "@prisma/client"
import { getAuthUserDetails, getUserPermissions } from "./queries"
import { db } from "./db"

export type NotificationWithUser =
	| ({
			user: {
				id: string
				name: string
				avatarUrl: string
				email: string
				createdAt: Date
				updatedAt: Date
				role: Role
				agencyId: string | null
			}
	  } & Notification)[]
	| undefined

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
	typeof getUserPermissions
>

export type AuthUserWithAgencySidebarOptionsSubAccounts =
	Prisma.PromiseReturnType<typeof getAuthUserDetails>

const __getUsersWithAgencySubAccountPermissionsSidebarOptions = async (
	agencyId: string
) => {
	return await db.user.findFirst({
		where: { agency: { id: agencyId } },
		include: {
			agency: { include: { subAccount: true } },
			permissions: { include: { subAccount: true } }
		}
	})
}

export type UsersWithAgencySubAccountPermissionsSidebarOptions =
	Prisma.PromiseReturnType<
		typeof __getUsersWithAgencySubAccountPermissionsSidebarOptions
	>
