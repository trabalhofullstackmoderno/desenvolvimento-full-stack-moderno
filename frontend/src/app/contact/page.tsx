"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Container,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import BackButton from "@/components/ui/BackButton";
import Contact from "@/components/types/Contact";
import useContacts from "@/hooks/useContacts";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: "bold",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));



export default function ContactPage() {
  const hook = useContacts();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAddOrUpdateContact = () => {
    if (!name || !phone || !email) {
      alert("Preencha todos os campos!");
      return;
    }

    if (editingId !== null) {
      // Atualizar contato existente
      setContacts((prev) =>
        prev.map((contact) =>{
          if(contact.id === editingId){
            //chamar função para update do hook
            hook.handleUpdateContacts(contact)
            return { ...contact, name, phone, email }
          } else{
            return contact
          }  
        } 
          

        )
      );
      setEditingId(null);
    } else {
      // Adicionar novo contato
      const newContact: Contact = {
        id: Date.now(), // Usando timestamp como ID único
        name,
        phone,
        email,
      };
      setContacts((prev) => [...prev, newContact]);
      
      //chamar função de criação da api do hook useContact passar newContact por parametro
      hook.handleCreateContacts(newContact)

    }

    // Limpar formulário
    setName("");
    setPhone("");
    setEmail("");
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setEmail(contact.email);
  };

  const handleDelete = (id: number) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
    setName("");
    setPhone("");
    setEmail("");
    setEditingId(null);
  };

  return (
    <Box
      sx={{
        bgcolor: "#f0f2f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <BackButton urlSaida="/" />

        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
              mb: 4,
            }}
          >
            Cadastro de Contatos
          </Typography>

          {/* Formulário */}
          <Stack
            spacing={3}
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleAddOrUpdateContact();
            }}
          >
            <TextField
              label="Nome"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Telefone"
              variant="outlined"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <TextField
              label="E-mail"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              sx={{
                mt: 2,
                py: 1.5,
                fontWeight: "bold",
                letterSpacing: 1,
              }}
            >
              {editingId !== null ? "Atualizar Contato" : "Adicionar Contato"}
            </Button>
          </Stack>
        </Paper>

        {/* Tabela de Contatos */}
        <Box sx={{ mt: 4 }}>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <Table aria-label="tabela de contatos">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Nome</StyledTableCell>
                  <StyledTableCell>Telefone</StyledTableCell>
                  <StyledTableCell>E-mail</StyledTableCell>
                  <StyledTableCell align="right">Ações</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <StyledTableRow key={contact.id}>
                    <StyledTableCell>{contact.name}</StyledTableCell>
                    <StyledTableCell>{contact.phone}</StyledTableCell>
                    <StyledTableCell>{contact.email}</StyledTableCell>
                    <StyledTableCell align="right">
                      <IconButton
                        aria-label="edit"
                        color="info"
                        onClick={() => {
                          handleEdit(contact)
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={() => handleDelete(contact.id)}
                        disabled={editingId === contact.id}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </Box>
  );
}