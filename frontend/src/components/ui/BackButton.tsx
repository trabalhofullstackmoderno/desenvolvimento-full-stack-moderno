"use client";

import { Box, Avatar, Typography, IconButton, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import InterfaceBackButton from "../interfaces/interfaceBackButton";

export default function BackButton(props:InterfaceBackButton) {
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
