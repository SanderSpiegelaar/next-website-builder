import Image from "next/image"
import { pricingCards } from "@/lib/constants"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import Link from "next/link"

export default function Home() {
	return (
		<>
			<section className="relative flex h-full w-full flex-col items-center justify-center pt-36">
				<div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
				<span className="block text-center">Run your agency, in one place</span>
				<div className="relative bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent">
					<h1 className="text-center text-9xl font-bold md:text-[300px]">
						Plura
					</h1>
				</div>
				<div className="relative flex items-center justify-center md:mt-[-70px]">
					<Image
						src={"/assets/preview.png"}
						alt="banner image"
						height={1200}
						width={1200}
						className="rounded-t-2xl border-2 border-muted"
					/>
					<div className="absolute bottom-0 left-0 right-0 top-[50%] z-10 bg-gradient-to-t dark:from-background"></div>
				</div>
			</section>
			<section className="mt-[-60px] flex flex-col items-center justify-center gap-4 md:!mt-20">
				<h2 className="text-center text-4xl">Choose what fits you right</h2>
				<p className="text-center text-muted-foreground">
					Our straightforward pricing plans are tailored to meet your needs. If
					{" you're"} not <br />
					ready to commit you can get started for free.
				</p>
				<div className="mt-6 flex flex-wrap justify-center gap-4">
					{pricingCards.map((card) => (
						// TODO: Wire up free product from stripe
						<Card
							key={card.title}
							className={cn(
								"flex w-[300px] flex-col justify-between",
								card.title === "Unlimited SaaS" && "border-2 border-primary"
							)}
						>
							<CardHeader>
								<CardTitle
									className={cn(
										card.title !== "Unlimited SaaS" && "text-muted-foreground"
									)}
								>
									{card.title}
								</CardTitle>
								<CardDescription>{card.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<span className="text-4xl font-bold">{card.price}</span>
								<span className="text-4xl font-bold">/month</span>
							</CardContent>
							<CardFooter className="flex flex-col items-start justify-end gap-4">
								<div>
									{card.features.map((feature) => (
										<div
											key={feature}
											className="flex items-center gap-2"
										>
											<Check className="text-muted-foreground" />
											<span className="inline-block">{feature}</span>
										</div>
									))}
								</div>
								<Link
									href={`/agency?plan=${card.priceId}`}
									className={cn(
										"w-full rounded-md bg-primary p-2 text-center",
										card.title !== "Unlimited SaaS" && "!bg-muted-foreground"
									)}
								>
									Get started
								</Link>
							</CardFooter>
						</Card>
					))}
				</div>
			</section>
			p
		</>
	)
}
