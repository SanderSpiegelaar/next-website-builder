"use client"
import * as z from "zod"
import React, { useEffect, useState } from "react"
import { Agency } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { NumberInput } from "@tremor/react"
import { Loader2 } from "lucide-react"

import { useToast } from "@/components/ui/use-toast"
import {
	deleteAgency,
	saveActivityLogNotification,
	updateAgencyDetails
} from "@/lib/queries"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "../ui/alert-dialog"
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
import FileUpload from "../global/file-upload"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"

type Props = {
	data?: Partial<Agency>
}

const FormSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Agency name must be atleast 2 characters" }),
	companyEmail: z
		.string()
		.email()
		.min(1, { message: "This field is required" }),
	companyPhone: z.string().min(1, { message: "This field is required" }),
	whiteLabel: z.boolean(),
	address: z.string().min(1, { message: "This field is required" }),
	city: z.string().min(1, { message: "This field is required" }),
	zipCode: z.string().min(1, { message: "This field is required" }),
	state: z.string().min(1, { message: "This field is required" }),
	country: z.string().min(1, { message: "This field is required" }),
	agencyLogo: z.string().min(1, { message: "This field is required" })
})

const AgencyDetailsForm = ({ data }: Props) => {
	const { toast } = useToast()
	const router = useRouter()
	const [deletingAgency, setDeletingAgency] = useState(false)

	const form = useForm<z.infer<typeof FormSchema>>({
		mode: "onChange",
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: data?.name,
			companyEmail: data?.companyEmail,
			companyPhone: data?.companyPhone,
			whiteLabel: data?.whiteLabel || false,
			address: data?.address,
			city: data?.city,
			zipCode: data?.zipCode,
			state: data?.state,
			country: data?.country,
			agencyLogo: data?.agencyLogo
		}
	})

	const isLoading = form.formState.isSubmitting

	useEffect(() => {
		if (data) form.reset(data)
	}, [data])

	const handleSubmit = async () => {}

	const handleDeleteAgency = async () => {
		if (!data?.id) return
		setDeletingAgency(true)
		// TODO: Cancel the subscription
		try {
			const res = await deleteAgency(data.id)
			toast({
				title: "Deleted Agency",
				description: "Deleted your agency and all subaccounts"
			})
			router.refresh()
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Could not delete Agency",
				description: "Something went wrong"
			})
		}
		setDeletingAgency(false)
	}

	return (
		<AlertDialog>
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Agency Information</CardTitle>
					<CardDescription>
						Lets create an agency for your business. You can edit agency
						settings later from the agency settings tab.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-4"
						>
							<FormField
								disabled={isLoading}
								control={form.control}
								name="agencyLogo"
								render={({ field }) => (
									<FormItem>
										<FormLabel>AgencyLogo</FormLabel>
										<FormControl>
											<FileUpload
												apiEndpoint="agencyLogo"
												onChange={field.onChange}
												value={field.value}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<div className="flex gap-4 md:flex-row">
								<FormField
									disabled={isLoading}
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormLabel>Agency Name</FormLabel>
											<FormControl>
												<Input
													placeholder="Your agency name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="companyEmail"
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormLabel>Agency Email</FormLabel>
											<FormControl>
												<Input
													readOnly
													placeholder="Email"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="flex gap-4 md:flex-row">
								<FormField
									disabled={isLoading}
									control={form.control}
									name="companyPhone"
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormLabel>Agency Phone Number</FormLabel>
											<FormControl>
												<Input
													placeholder="Phone"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								disabled={isLoading}
								control={form.control}
								name="whiteLabel"
								render={({ field }) => {
									return (
										<FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border p-4">
											<div>
												<FormLabel>Whitelabel Agency</FormLabel>
												<FormDescription>
													Turning on whilelabel mode will show your agency logo
													to all sub accounts by default. You can overwrite this
													functionality through sub account settings.
												</FormDescription>
											</div>

											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)
								}}
							/>
							<FormField
								disabled={isLoading}
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormLabel>Address</FormLabel>
										<FormControl>
											<Input
												placeholder="123 st..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="flex gap-4 md:flex-row">
								<FormField
									disabled={isLoading}
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormLabel>City</FormLabel>
											<FormControl>
												<Input
													placeholder="City"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									disabled={isLoading}
									control={form.control}
									name="state"
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormLabel>State</FormLabel>
											<FormControl>
												<Input
													placeholder="State"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									disabled={isLoading}
									control={form.control}
									name="zipCode"
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormLabel>Zipcpde</FormLabel>
											<FormControl>
												<Input
													placeholder="Zipcode"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								disabled={isLoading}
								control={form.control}
								name="country"
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormLabel>Country</FormLabel>
										<FormControl>
											<Input
												placeholder="Country"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{data?.id && (
								<div className="flex flex-col gap-2">
									<FormLabel>Create a Goal</FormLabel>
									<FormDescription>
										✨ Create a goal for your agency. As your business grows
										your goals grow too so dont forget to set the bar higher!
									</FormDescription>
									<NumberInput
										defaultValue={data?.goal}
										min={1}
										max={999}
										className="!border !border-input !bg-background"
										placeholder="Subaccount Goal"
										onValueChange={async (value) => {
											if (!data?.id) return
											await updateAgencyDetails(data.id, { goal: value })
											await saveActivityLogNotification({
												agencyId: data.id,
												description: `Updated the agency goal to: ${value} Subaccount(s)`,
												subAccountId: undefined
											})
											router.refresh()
										}}
									/>
								</div>
							)}
							<Button
								type="submit"
								disabled={isLoading}
							>
								{isLoading ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									"Save Agency Information"
								)}
							</Button>
						</form>
					</Form>
					{data?.id && (
						<div className="mt-4 flex flex-row items-center justify-between gap-4 rounded-lg border border-destructive p-4">
							<div>
								<div>Danger Zone</div>
							</div>
							<div className="text-muted-foreground">
								Deleting your agency cannot be undone. This will also delete all
								sub accounts and all data related to your sub accounts. Sub
								accounts will no longer have access to funnels, contacts etc.
							</div>
							<AlertDialogTrigger
								disabled={isLoading || deletingAgency}
								className="mt-2 whitespace-nowrap rounded-md p-2 text-center text-red-600 hover:bg-red-600 hover:text-white"
							>
								{deletingAgency ? "Deleting..." : "Delete Agency"}
							</AlertDialogTrigger>
						</div>
					)}
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle className="text-left">
								Are you absolutely sure?
							</AlertDialogTitle>
							<AlertDialogDescription className="text-left">
								This action cannot be undone. This will permanently delete the
								Agency account and all related sub accounts.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter className="flex items-center">
							<AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
							<AlertDialogAction
								disabled={deletingAgency}
								className="bg-destructive hover:bg-destructive"
								onClick={handleDeleteAgency}
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</CardContent>
			</Card>
		</AlertDialog>
	)
}

export default AgencyDetailsForm
