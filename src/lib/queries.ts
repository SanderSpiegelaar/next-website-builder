"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { db } from "./db"
import { Agency, User } from "@prisma/client"

// * GENERIC FUNCTIONS

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

// * USER RELATED FUNCTIONS

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

// * AGENCY RELATED FUNCTIONS

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
