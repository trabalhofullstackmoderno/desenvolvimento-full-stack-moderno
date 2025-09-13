"use client";

import IContato from "@/components/interfaces/IContato";
import BackButton from "@/components/ui/BackButton";
import useContacts from "@/hooks/useContacts";
import { Box, Button } from "@mui/material";
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));






export default function ContactPage() {
  const hook = useContacts()

  function excluir() {
    
  }

  function editar(){

  }

  
  const rows : Array<IContato>=  [
    {
      id: "0",
      ownerId: "1",
      linkedUserId: "1",
      email: "e@gmail.com",
      name: "E",
      createdAt: "2025-05-20"
    },
    {
      id: "1",
      ownerId: "1",
      linkedUserId: "1",
      email: "e@gmail.com",
      name: "E",
      createdAt: "2025-05-20"
    },
    {
      id: "2",
      ownerId: "1",
      linkedUserId: "1",
      email: "e@gmail.com",
      name: "E",
      createdAt: "2025-05-20"
    }
  ]

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f0f2f5" }}>
      <BackButton urlSaida="/"/>

          <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell></StyledTableCell>
            <StyledTableCell>Contato </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow key={row.id}>
              <StyledTableCell component="th" scope="row">
                <Button onClick={()=> excluir()}> Excluir</Button>
                <Button onClick={()=>editar()}> Editar</Button>

              </StyledTableCell>
              <StyledTableCell component="th" scope="row">
                {row.name}
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Box>
  );
}
