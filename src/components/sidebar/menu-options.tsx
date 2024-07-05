"use client"

import {
	Agency,
	AgencySidebarOption,
	SubAccount,
	SubAccountSidebarOption
} from "@prisma/client"
import React, { useEffect, useMemo, useState } from "react"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet"
import { Button } from "../ui/button"
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AspectRatio } from "../ui/aspect-ratio"
import Image from "next/image"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "../ui/command"
import Link from "next/link"
import { useModal } from "@/providers/modal-provider"
import CustomModal from "../global/custom-modal"
import SubAccountDetailsForm from "../forms/subaccount-details"
import { Separator } from "../ui/separator"
import { type ClassValue } from "clsx"
import { icons } from "@/lib/constants"

type Props = {
	defaultOpen?: boolean
	subAccounts: SubAccount[]
	sidebarOptions: AgencySidebarOption[] | SubAccountSidebarOption[]
	sidebarLogo: string
	details: any
	user: any
	id: string
}

const MenuOptions = ({
	defaultOpen,
	subAccounts,
	sidebarOptions,
	sidebarLogo,
	details,
	user,
	id
}: Props) => {
	//  * STATE DECLARATIONS
	const { setOpen } = useModal()
	const [isMounted, setIsMounted] = useState(false)
	const openState = useMemo(
		() => (defaultOpen ? { open: true } : {}),
		[defaultOpen]
	)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	if (!isMounted) return

	return (
		<Sheet
			modal={false}
			{...openState}
		>
			<SheetTrigger
				asChild
				className="absolute left-4 top-4 z-[100] flex md:!hidden"
			>
				<Button
					variant="outline"
					size={"icon"}
				>
					<Menu />
				</Button>
			</SheetTrigger>

			<SheetContent
				showX={!defaultOpen}
				side={"left"}
				className={cn(
					"fixed top-0 border-r-[1px] bg-background/80 p-6 backdrop-blur-xl",
					defaultOpen && "z-0 hidden w-[300px] md:inline-block",
					!defaultOpen && "z-[100] inline-block w-full md:hidden"
				)}
			>
				<div>
					<AspectRatio ratio={16 / 5}>
						<Image
							src={sidebarLogo}
							alt="Sidebar Logo"
							fill
							className="rounded-md object-contain"
						/>
					</AspectRatio>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								className="my-4 flex w-full items-center justify-between py-8"
								variant="ghost"
							>
								<div className="flex items-center gap-2 text-left">
									<Compass />
									<div className="flex flex-col">
										{details.name}{" "}
										<span className="text-muted-foreground">
											{details.address}
										</span>
									</div>
								</div>
								<div>
									<ChevronsUpDown
										size={16}
										className="text-muted-foreground"
									/>
								</div>
							</Button>
						</PopoverTrigger>
						<PopoverContent className="z-[200] mt-4 h-80 w-80">
							<Command className="rounded-lg">
								<CommandInput placeholder="Search Accounts..." />
								<CommandList className="pb-16">
									<CommandEmpty>No results found</CommandEmpty>
									{(user?.role === "AGENCY_OWNER" ||
										user?.role === "AGENCY_ADMIN") &&
										user?.agency && (
											<CommandGroup heading="Agency">
												<CommandItem className="!bg-transparant my-2 cursor-pointer rounded-md border-[1px] border-border p-2 text-primary transition-all hover:!bg-muted">
													{defaultOpen ? (
														<Link
															href={`/agency/${user?.agency.id}`}
															className="flex h-full w-full gap-4"
														>
															<div className="relative w-16">
																<Image
																	src={user?.agency?.agencyLogo}
																	alt="Agency Logo"
																	fill
																	className="rounded-md object-contain"
																/>
															</div>
															<div className="flex flex-1 flex-col">
																{user?.agency?.name}{" "}
																<span className="text-muted-foreground">
																	{user?.agency?.address}
																</span>
															</div>
														</Link>
													) : (
														<SheetClose asChild>
															<Link
																href={`/agency/${user?.agency.id}`}
																className="flex h-full w-full gap-4"
															>
																<div className="relative w-16">
																	<Image
																		src={user?.agency?.agencyLogo}
																		alt="Agency Logo"
																		fill
																		className="rounded-md object-contain"
																	/>
																</div>
																<div className="flex flex-1 flex-col">
																	{user?.agency?.name}{" "}
																	<span className="text-muted-foreground">
																		{user?.agency?.address}
																	</span>
																</div>
															</Link>
														</SheetClose>
													)}
												</CommandItem>
											</CommandGroup>
										)}
									<CommandGroup heading="Accounts">
										{!!subAccounts
											? subAccounts.map((subAccount) => (
													<CommandItem key={subAccount.id}>
														{defaultOpen ? (
															<Link
																href={`/subaccount/${subAccount.id}`}
																className="flex h-full w-full gap-4"
															>
																<div className="relative w-16">
																	<Image
																		src={subAccount?.subAccountLogo}
																		alt="SubAccount Logo"
																		fill
																		className="rounded-md object-contain"
																	/>
																</div>
																<div className="flex flex-1 flex-col">
																	{subAccount?.name}{" "}
																	<span className="text-muted-foreground">
																		{subAccount?.address}
																	</span>
																</div>
															</Link>
														) : (
															<SheetClose asChild>
																<Link
																	href={`/subaccount/${subAccount.id}`}
																	className="flex h-full w-full gap-4"
																>
																	<div className="relative w-16">
																		<Image
																			src={subAccount?.subAccountLogo}
																			alt="SubAccount Logo"
																			fill
																			className="rounded-md object-contain"
																		/>
																	</div>
																	<div className="flex flex-1 flex-col">
																		{subAccount?.name}{" "}
																		<span className="text-muted-foreground">
																			{subAccount?.address}
																		</span>
																	</div>
																</Link>
															</SheetClose>
														)}
													</CommandItem>
												))
											: "No Accounts found"}
									</CommandGroup>
								</CommandList>
								{(user?.role === "AGENCY_OWNER" ||
									user?.role === "AGENCY_ADMIN") && (
									<SheetClose>
										<Button
											className="flex w-full gap-2"
											onClick={() => {
												setOpen(
													<CustomModal
														title="Create A Sub Account"
														subheading="You can switch between your agency account and the subaccount from the sidebar"
													>
														<SubAccountDetailsForm
															agencyDetails={user?.Agency as Agency}
															userId={user?.id as string}
															userName={user?.name}
														/>
													</CustomModal>
												)
											}}
										>
											<PlusCircleIcon size={16} />
											Create a Sub Account
										</Button>
									</SheetClose>
								)}
							</Command>
						</PopoverContent>
					</Popover>
					<span className="mb-2 block text-xs text-muted-foreground">
						MENU LINKS
					</span>
					<Separator className="mb-4" />
					<nav className="relative">
						<Command className="overflow-visible rounded-lg bg-transparent">
							<CommandInput placeholder="Search menu items..." />
							<CommandList className="overflow-visible py-4">
								<CommandEmpty>No results found</CommandEmpty>
								<CommandGroup className="overflow-visible">
									{sidebarOptions.map((sidebarOption) => {
										let value
										const result = icons.find(
											(icon) => icon.value === sidebarOption.icon
										)
										if (result) value = <result.path />

										return (
											<CommandItem
												key={sidebarOption.id}
												className="w-full md:w-[320px]"
											>
												<Link
													href={sidebarOption.link}
													className="flex w-[320px] items-center gap-2 rounded-md transition-all hover:bg-transparent md:w-full"
												>
													{value}
													<span>{sidebarOption.name}</span>
												</Link>
											</CommandItem>
										)
									})}
								</CommandGroup>
							</CommandList>
						</Command>
					</nav>
				</div>
			</SheetContent>
		</Sheet>
	)
}

export default MenuOptions
