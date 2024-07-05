"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { db } from "./db"
import { Agency, Plan, SubAccount, User } from "@prisma/client"
import { v4 } from "uuid"

/**
 * *
 * * GENERICS
 * *
 */

/**
 * * Saves an activity log notification.
 * @param {Object} params - The parameters for saving the activity log notification.
 * @param {string} [params.agencyId] - The ID of the agency.
 * @param {string} params.description - The description of the activity log notification.
 * @param {string} [params.subAccountId] - The ID of the sub-account.
 * @returns {Promise<void>} - A promise that resolves when the activity log notification is saved.
 */
export const saveActivityLogNotification = async ({
	agencyId,
	description,
	subAccountId
}: {
	agencyId?: string
	description: string
	subAccountId?: string
}) => {
	const authUser = await currentUser()
	let userData
	if (!authUser) {
		const response = await db.user.findFirst({
			where: {
				agency: {
					subAccount: {
						some: { id: subAccountId }
					}
				}
			}
		})

		if (response) userData = response
	} else {
		userData = await db.user.findUnique({
			where: {
				email: authUser?.emailAddresses[0].emailAddress
			}
		})
	}

	if (!userData) {
		console.log("Could not find a user")
		return
	}

	let foundAgencyId = agencyId
	if (!foundAgencyId) {
		if (subAccountId) {
			throw new Error("You need to provide at least an agency- or subAccountId")
		}
		const response = await db.subAccount.findUnique({
			where: { id: subAccountId }
		})
		if (response) foundAgencyId = response.agencyId
	}

	if (subAccountId) {
		await db.notification.create({
			data: {
				notification: `${userData.name} | ${description}`,
				user: {
					connect: {
						id: userData.id
					}
				},
				agency: {
					connect: {
						id: agencyId
					}
				},
				subAccount: {
					connect: {
						id: subAccountId
					}
				}
			}
		})
	} else {
		await db.notification.create({
			data: {
				notification: `${userData.name} | ${description}`,
				user: {
					connect: {
						id: userData.id
					}
				},
				agency: {
					connect: {
						id: foundAgencyId
					}
				}
			}
		})
	}
}

/**
 * *
 * * USER RELATED FUNCTIONS
 * *
 */

/**
 * Retrieves the authenticated user's details from the database.
 * If the user is not authenticated, it redirects to the sign-in page.
 *
 * @returns {Promise<UserData>} The user's details from the database.
 */
export const getAuthUserDetails = async () => {
	const user = await currentUser()
	if (!user) return redirect("/sign-in")

	const userData = await db.user.findUnique({
		where: { email: user.emailAddresses[0].emailAddress },
		include: {
			agency: {
				include: {
					sidebarOption: true,
					subAccount: {
						include: {
							sidebarOption: true
						}
					}
				}
			},
			permissions: true
		}
	})

	return userData
}

/**
 * Creates a team user.
 *
 * @param agencyId - The ID of the agency.
 * @param user - The user object.
 * @returns A Promise that resolves to the created user object.
 */
const createTeamUser = async (agencyId: string, user: User) => {
	if (user.role === "AGENCY_OWNER") return null

	const response = await db.user.create({ data: { ...user } })
	return response
}

/**
 * Verifies and accepts an invitation for the current user.
 * If the user is not authenticated, it redirects to the sign-in page.
 * If the invitation exists and the user details are successfully created, it updates the user metadata,
 * deletes the invitation, and returns the agency ID.
 * @returns The agency ID if the invitation is accepted, otherwise undefined.
 */
export const verifyAndAcceptInvitation = async () => {
	const user = await currentUser()
	if (!user) return redirect("/sign-in")

	const invitationExists = await db.invitation.findUnique({
		where: {
			email: user.emailAddresses[0].emailAddress,
			status: "PENDING"
		}
	})

	if (invitationExists) {
		const userDetails = await createTeamUser(invitationExists.agencyId, {
			email: invitationExists.email,
			agencyId: invitationExists.agencyId,
			avatarUrl: user.imageUrl,
			id: user.id,
			name: `${user.firstName} ${user.lastName}`,
			role: invitationExists.role,
			createdAt: new Date(),
			updatedAt: new Date()
		})

		await saveActivityLogNotification({
			agencyId: invitationExists?.agencyId,
			description: "Joined"
		})

		if (userDetails) {
			await clerkClient.users.updateUserMetadata(user.id, {
				privateMetadata: {
					role: userDetails.role || "SUBACCOUNT_USER"
				}
			})

			await db.invitation.delete({
				where: { email: userDetails.email }
			})

			return userDetails.agencyId
		} else return null
	} else {
		const agency = await db.user.findUnique({
			where: {
				email: user.emailAddresses[0].emailAddress
			}
		})

		return agency ? agency.agencyId : null
	}
}

/**
 * * Initializes a user by updating their information in the database and updating their metadata.
 * @param newUser - The partial user object containing the updated information.
 * @returns The updated user data.
 */
export const initUser = async (newUser: Partial<User>) => {
	const user = await currentUser()
	if (!user) return
	const userData = await db.user.upsert({
		where: {
			email: user.emailAddresses[0].emailAddress
		},
		update: newUser,
		create: {
			id: user.id,
			avatarUrl: user.imageUrl,
			email: user.emailAddresses[0].emailAddress,
			name: `${user.firstName} ${user.lastName}`,
			role: newUser.role || "SUBACCOUNT_USER"
		}
	})

	await clerkClient.users.updateUserMetadata(user.id, {
		privateMetadata: {
			role: newUser.role || "SUBACCOUNT_USER"
		}
	})

	return userData
}

export const getNotificationAndUser = async (agencyId: string) => {
	try {
		const response = await db.notification.findMany({
			where: { agencyId },
			include: {
				user: true
			},
			orderBy: {
				createdAt: "desc"
			}
		})

		return response
	} catch (error) {
		console.log(error)
	}
}

/**
 * *
 * * AGENCY RELATED FUNCTIONS
 * *
 */

export const updateAgencyDetails = async (
	agencyId: string,
	agencyDetails: Partial<Agency>
) => {
	const res = await db.agency.update({
		data: { ...agencyDetails },
		where: {
			id: agencyId
		}
	})

	return res
}

export const deleteAgency = async (agencyId: string) => {
	const res = await db.agency.delete({
		where: {
			id: agencyId
		}
	})

	return res
}

export const upsertAgency = async (agency: Agency, price?: Plan) => {
	if (!agency?.companyEmail) return null

	try {
		const agencyDetails = await db.agency.upsert({
			where: {
				id: agency.id
			},
			update: agency,
			create: {
				users: {
					connect: { email: agency.companyEmail }
				},
				...agency,
				sidebarOption: {
					create: [
						{
							name: "Dashboard",
							icon: "category",
							link: `/agency/${agency.id}`
						},
						{
							name: "Launchpad",
							icon: "clipboardIcon",
							link: `/agency/${agency.id}/launchpad`
						},
						{
							name: "Billing",
							icon: "payment",
							link: `/agency/${agency.id}/billing`
						},
						{
							name: "Settings",
							icon: "settings",
							link: `/agency/${agency.id}/settings`
						},
						{
							name: "Sub Accounts",
							icon: "person",
							link: `/agency/${agency.id}/all-subaccounts`
						},
						{
							name: "Team",
							icon: "shield",
							link: `/agency/${agency.id}/team`
						}
					]
				}
			}
		})
		return agencyDetails
	} catch (error) {
		console.log(error)
	}
}

/**
 * *
 * * SUBACCOUNT RELATED FUNCTIONS
 * *
 */

export const upsertSubAccount = async (subAccount: SubAccount) => {
	if (!subAccount.companyEmail) return null
	const agencyOwner = await db.user.findFirst({
		where: {
			agency: {
				id: subAccount.agencyId
			},
			role: "AGENCY_ADMIN"
		}
	})

	if (!agencyOwner) throw new Error("No agency owner found 🔴")

	const permissionId = v4()
	const response = await db.subAccount.upsert({
		where: { id: subAccount.id },
		update: subAccount,
		create: {
			...subAccount,
			permissions: {
				create: {
					access: true,
					email: agencyOwner.email,
					id: permissionId
				},
				connect: {
					subAccountId: subAccount.id,
					id: permissionId
				}
			},
			pipeline: {
				create: { name: "Lead Cycle" }
			},
			sidebarOption: {
				create: [
					{
						name: "Launchpad",
						icon: "clipboardIcon",
						link: `/subaccount/${subAccount.id}/launchpad`
					},
					{
						name: "Settings",
						icon: "settings",
						link: `/subaccount/${subAccount.id}/settings`
					},
					{
						name: "Funnels",
						icon: "pipelines",
						link: `/subaccount/${subAccount.id}/funnels`
					},
					{
						name: "Media",
						icon: "database",
						link: `/subaccount/${subAccount.id}/media`
					},
					{
						name: "Automations",
						icon: "chip",
						link: `/subaccount/${subAccount.id}/automations`
					},
					{
						name: "Pipelines",
						icon: "flag",
						link: `/subaccount/${subAccount.id}/pipelines`
					},
					{
						name: "Contacts",
						icon: "person",
						link: `/subaccount/${subAccount.id}/contacts`
					},
					{
						name: "Dashboard",
						icon: "category",
						link: `/subaccount/${subAccount.id}`
					}
				]
			}
		}
	})

	return response
}
