import { Notification, Prisma, Role } from "@prisma/client"

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
