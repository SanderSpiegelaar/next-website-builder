"use client"
import * as z from "zod"
import React, { useEffect, useState } from "react"
import { Agency } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useToast } from "@/components/ui/use-toast"
import { AlertDialog } from "../ui/alert-dialog"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "../ui/card"
import { Form, FormItem, FormLabel } from "../ui/form"

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
	const isLoading = form.formState.isSubmitting
	const [deleteAgency, setDeleteAgency] = useState(false)

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

	useEffect(() => {
		if (data) form.reset(data)
	}, [data])

	const handleSubmit = async () => {}

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
									</FormItem>
								)}
							></FormField>
						</form>
					</Form>
				</CardContent>
			</Card>
		</AlertDialog>
	)
}

export default AgencyDetailsForm
