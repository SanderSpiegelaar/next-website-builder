"use client"
import { useModal } from "@/providers/modal-provider"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle
} from "../ui/dialog"
import React from "react"
import { DialogHeader } from "../ui/dialog"

type Props = {
	title: string
	subheading: string
	children: React.ReactNode
	defaultOpen?: boolean
}

const CustomModal = ({ title, subheading, children, defaultOpen }: Props) => {
	const { isOpen, setClose } = useModal()
	return (
		<Dialog
			open={isOpen || defaultOpen}
			onOpenChange={setClose}
		>
			<DialogContent className="h-screen overflow-scroll bg-card md:h-fit md:max-h-[700px]">
				<DialogHeader className="pt-8 text-left">
					<DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
					<DialogDescription>{subheading}</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	)
}

export default CustomModal
