import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import { db } from "@/lib/db"
import { CheckCircleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { off } from "process"
import React from "react"

type Props = {
	params: {
		agencyId: string
	}
	searchParams: {
		code: string
	}
}

const LaunchPadPage = async ({ params, searchParams }: Props) => {
	const agencyDetails = await db.agency.findUnique({
		where: {
			id: params.agencyId
		}
	})

	if (!agencyDetails) return

	const allDetailsExist =
		agencyDetails.address &&
		agencyDetails.address &&
		agencyDetails.agencyLogo &&
		agencyDetails.city &&
		agencyDetails.companyEmail &&
		agencyDetails.companyPhone &&
		agencyDetails.country &&
		agencyDetails.name &&
		agencyDetails.state &&
		agencyDetails.zipCode

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="h-full w-full max-w-[800px]">
				<Card className="border-none">
					<CardHeader>
						<CardTitle>Lets get started!</CardTitle>
						<CardDescription>
							Follow the steps below to get your account set up.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<div className="flex w-full items-center justify-between gap-2 rounded-lg border p-4">
							<div className="flex flex-col gap-4 md:!flex-row md:items-center">
								<Image
									src="/appstore.png"
									alt="app logo"
									height={80}
									width={80}
									className="rounded-md object-contain"
								/>
								<p>Save the website as a shortcut on your mobile device</p>
							</div>
							<Button>Start</Button>
						</div>
						<div className="flex w-full items-center justify-between gap-2 rounded-lg border p-4">
							<div className="flex flex-col gap-4 md:!flex-row md:items-center">
								<Image
									src="/stripelogo.png"
									alt="app logo"
									height={80}
									width={80}
									className="rounded-md object-contain"
								/>
								<p>Connect your stripe account to accept payments</p>
							</div>
							<Button>Start</Button>
						</div>
						<div className="flex w-full items-center justify-between gap-2 rounded-lg border p-4">
							<div className="flex flex-col gap-4 md:!flex-row md:items-center">
								<Image
									src={agencyDetails.agencyLogo}
									alt="Agency Logo"
									height={80}
									width={80}
									className="rounded-md object-contain"
								/>
								<p>Fill in all your bussiness details</p>
							</div>
							{allDetailsExist ? (
								<CheckCircleIcon
									size={50}
									className="flex-shrink-0 p-2 text-primary"
								/>
							) : (
								<Link
									href={`/agency/${params.agencyId}/settings`}
									className="rounded-md bg-primary px-4 py-2 text-white"
								>
									Start
								</Link>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default LaunchPadPage
