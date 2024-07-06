"use client"
import { SubAccount, User } from "@prisma/client"
import {
	AuthUserWithAgencySidebarOptionsSubAccounts,
	UserWithPermissionsAndSubAccounts
} from "@/lib/types"
import React, { useEffect, useState } from "react"
import { useModal } from "@/providers/modal-provider"
import { useToast } from "../ui/use-toast"
import {
	changeUserPermissions,
	getAuthUserDetails,
	getUserPermissions,
	saveActivityLogNotification,
	updateUser
} from "@/lib/queries"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "../ui/card"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "../ui/form"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import Loading from "../global/loading"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "../ui/select"
import { Input } from "../ui/input"
import FileUpload from "../global/file-upload"
import { v4 } from "uuid"
import { access } from "fs"

type Props = {
	id: string | null
	type: "agency" | "subaccount"
	userData?: Partial<User>
	subAccounts?: SubAccount[]
}

const userDataSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	avatarUrl: z.string(),
	role: z.enum([
		"AGENCY_OWNER",
		"AGENCY_ADMIN",
		"SUBACCOUNT_USER",
		"SUBACCOUNT_GUEST"
	])
})

const UserDetailsForm = ({ id, type, subAccounts, userData }: Props) => {
	const router = useRouter()
	const [subAccountPermissions, setSubAccountPermissions] =
		useState<UserWithPermissionsAndSubAccounts | null>(null)
	const [authUserData, setAuthUserData] =
		useState<AuthUserWithAgencySidebarOptionsSubAccounts>(null)
	const [roleState, setRoleState] = useState("")
	const [loadingPermissions, setLoadingPermissions] = useState(false)

	const { data, setClose } = useModal()
	const { toast } = useToast()

	const form = useForm<z.infer<typeof userDataSchema>>({
		resolver: zodResolver(userDataSchema),
		mode: "onChange",
		defaultValues: {
			name: userData ? userData.name : data?.user?.name,
			email: userData ? userData.email : data?.user?.email,
			avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
			role: userData ? userData.role : data?.user?.role
		}
	})

	useEffect(() => {
		if (data.user) {
			const fetchDetails = async () => {
				const response = await getAuthUserDetails()
				if (response) setAuthUserData(response)
			}
			fetchDetails()
		}
	}, [data])

	useEffect(() => {
		const getPermissions = async () => {
			if (!data.user) return
			const permission = await getUserPermissions(data.user.id)
			setSubAccountPermissions(permission)
		}
		getPermissions()
	}, [data, form])

	useEffect(() => {
		if (data.user) form.reset(data.user)
		if (userData) form.reset(userData)
	}, [userData, data])

	const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
		if (!id) return
		if (userData || data?.user) {
			const updatedUser = await updateUser(values)
			authUserData?.agency?.subAccount
				.filter((subaccount) =>
					authUserData.permissions.find(
						(p) => p.subAccountId === subaccount.id && p.access
					)
				)
				.forEach(async (subaccount) => {
					await saveActivityLogNotification({
						agencyId: undefined,
						description: `Updated ${userData?.name}'s information`,
						subAccountId: subaccount.id
					})
				})
			if (updatedUser) {
				toast({
					title: "Success",
					description: "Updated user information"
				})
				setClose()
				router.refresh()
			} else {
				toast({
					variant: "destructive",
					title: "Error",
					description: "Something went wrong"
				})
			}
		} else {
			console.log("Could not submit")
		}
	}

	const onChangePermission = async (
		subAccountId: string,
		value: boolean,
		permissionId: string | undefined
	) => {
		if (!data.user?.email) return
		setLoadingPermissions(true)
		const response = await changeUserPermissions(
			permissionId ? permissionId : v4(),
			data.user.email,
			subAccountId,
			value
		)

		if (type === "agency") {
			await saveActivityLogNotification({
				agencyId: authUserData?.agency?.id,
				description: `Gave ${userData?.name} access to | ${
					subAccountPermissions?.permissions.find(
						(p) => p.subAccountId === subAccountId
					)?.subAccount.name
				} `,
				subAccountId: subAccountPermissions?.permissions.find(
					(p) => p.subAccountId === subAccountId
				)?.subAccount.id
			})
		}

		if (response) {
			toast({
				title: "Success",
				description: "Permissions updated"
			})
			if (subAccountPermissions) {
				subAccountPermissions.permissions.find((permission) => {
					if ((permission.subAccountId = subAccountId)) {
						return { ...permission, access: !permission.access }
					}
					return permission
				})
			}
		} else {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Could not update permissions"
			})
		}
		router.refresh()
		setLoadingPermissions(false)
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>User Details</CardTitle>
				<CardDescription>Add or update your information</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							disabled={form.formState.isSubmitting}
							control={form.control}
							name="avatarUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Profile picture</FormLabel>
									<FormControl>
										<FileUpload
											apiEndpoint="avatar"
											value={field.value}
											onChange={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							disabled={form.formState.isSubmitting}
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input
											required
											placeholder="Full Name"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							disabled={form.formState.isSubmitting}
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											readOnly={
												userData?.role === "AGENCY_OWNER" ||
												form.formState.isSubmitting
											}
											placeholder="Email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							disabled={form.formState.isSubmitting}
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem className="flex-1">
									<FormLabel> User Role</FormLabel>
									<Select
										disabled={field.value === "AGENCY_OWNER"}
										onValueChange={(value) => {
											if (
												value === "SUBACCOUNT_USER" ||
												value === "SUBACCOUNT_GUEST"
											) {
												setRoleState(
													"You need to have subaccounts to assign Subaccount access to team members."
												)
											} else {
												setRoleState("")
											}
											field.onChange(value)
										}}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select user role..." />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="AGENCY_ADMING">
												Agency Admin
											</SelectItem>
											{(data?.user?.role === "AGENCY_OWNER" ||
												userData?.role === "AGENCY_OWNER") && (
												<SelectItem value="AGENCY_OWNER">
													Agency Owner
												</SelectItem>
											)}
											<SelectItem value="SUBACCOUNT_USER">
												Sub Account User
											</SelectItem>
											<SelectItem value="SUBACCOUNT_GUEST">
												Sub Account Guest
											</SelectItem>
										</SelectContent>
									</Select>
									<p className="text-muted-foreground">{roleState}</p>
								</FormItem>
							)}
						/>

						<Button
							disabled={form.formState.isSubmitting}
							type="submit"
						>
							{form.formState.isSubmitting ? <Loading /> : "Save User Details"}
						</Button>
						{authUserData?.role === "AGENCY_OWNER" && (
							<div>
								<Separator className="my-4" />
								<FormLabel> User Permissions</FormLabel>
								<FormDescription className="mb-4">
									You can give Sub Account access to team member by turning on
									access control for each Sub Account. This is only visible to
									agency owners
								</FormDescription>
								<div className="flex flex-col gap-4">
									{subAccounts?.map((subAccount) => {
										const subAccountPermissionsDetails =
											subAccountPermissions?.permissions.find(
												(p) => p.subAccountId === subAccount.id
											)
										return (
											<div
												key={subAccount.id}
												className="flex items-center justify-between rounded-lg border p-4"
											>
												<div>
													<p>{subAccount.name}</p>
												</div>
												<Switch
													disabled={loadingPermissions}
													checked={subAccountPermissionsDetails?.access}
													onCheckedChange={(permission) => {
														onChangePermission(
															subAccount.id,
															permission,
															subAccountPermissionsDetails?.id
														)
													}}
												/>
											</div>
										)
									})}
								</div>
							</div>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}

export default UserDetailsForm
