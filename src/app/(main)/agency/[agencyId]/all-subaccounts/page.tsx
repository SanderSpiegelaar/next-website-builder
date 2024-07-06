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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "@/components/ui/command"
import { getAuthUserDetails } from "@/lib/queries"
import { SubAccount } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import DeleteSubAccountButton from "./_components/delete-button"
import CreateSubAccountButton from "./_components/create-subaccount-button"

type Props = {
	params: {
		agencyId: string
	}
}

const AllSubAccountsPage = async ({ params }: Props) => {
	const user = await getAuthUserDetails()
	if (!user) return
	return (
		<AlertDialog>
			<div className="flex flex-col">
				<CreateSubAccountButton
					user={user}
					id={params.agencyId}
					className="m-6 w-[200px] self-end"
				/>
				<Command className="bg-transparant rounded-lg">
					<CommandInput placeholder="Search Accounts..." />
					<CommandList>
						<CommandEmpty>No results.</CommandEmpty>
						<CommandGroup>
							{!!user.agency?.subAccount.length ? (
								user.agency.subAccount.map((subaccount: SubAccount) => (
									<CommandItem
										key={subaccount.id}
										className="my-2 h-32 cursor-pointer rounded-lg border-[1px] border-border !bg-background text-primary transition-all hover:!bg-background"
									>
										<Link
											href={`/subaccount/${subaccount.id}`}
											className="flex h-full w-full gap-4"
										>
											<div className="relative w-32">
												<Image
													src={subaccount.subAccountLogo}
													alt="subaccount logo"
													fill
													className="rounded-md bg-muted/50 object-contain p-4"
												/>
											</div>
											<div className="flex flex-col justify-between">
												<div className="flex flex-col">
													{subaccount.name}{" "}
													<span className="text-xs text-muted-foreground">
														{subaccount.address}
													</span>
												</div>
											</div>
										</Link>
										<AlertDialogTrigger asChild>
											<Button
												variant={"destructive"}
												size="sm"
												className="w-20 text-red-200 hover:bg-red-600"
											>
												Delete
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle className="text-left">
													Are you absolutely sure
												</AlertDialogTitle>
												<AlertDialogDescription className="text-left">
													This action cannot be undone. This will delete the
													subaccount and all data related to the subaccount.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter className="flex items-center">
												<AlertDialogCancel className="">
													Cancel
												</AlertDialogCancel>
												<AlertDialogAction className="bg-destructive hover:bg-destructive/80">
													<DeleteSubAccountButton
														subAccountId={subaccount.id}
													/>
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</CommandItem>
								))
							) : (
								<div className="text-center text-muted-foreground">
									No Sub Accounts
								</div>
							)}
						</CommandGroup>
					</CommandList>
				</Command>
			</div>
		</AlertDialog>
	)
}

export default AllSubAccountsPage
