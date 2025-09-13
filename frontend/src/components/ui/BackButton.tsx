"use client";

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import IBackButton from "../interfaces/IBackButton";

export default function BackButton(props:IBackButton) {
    const router= useRouter();
    return (
        <Button
            onClick={() => {
                router.replace(props.urlSaida);
            }}
        >
            Voltar
        </Button>
    );
}
