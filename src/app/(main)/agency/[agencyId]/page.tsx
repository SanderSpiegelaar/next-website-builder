import React from "react"

type Props = {
	params: {
		agencyId: string
	}
}

const AgencyIdPage = ({ params }: Props) => {
	return <div>{params.agencyId}</div>
}

export default AgencyIdPage
