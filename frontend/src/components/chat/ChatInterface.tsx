"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  Fab,
  Badge,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Circle as OnlineIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import Image from 'next/image'
import ChatWindow from "./ChatWindow";
import ContactSearch from "./ContactSearch";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useRouter } from "next/navigation";
import axios from "@/auth/axios";

interface Contact {
  id: string;
  name: string;
  email: string;
  picture: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface Conversation {
  id: string;
  contact: Contact;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
    isRead: boolean;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
  createdAt: string;
}

const ChatInterface: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [contactsSynced, setContactsSynced] = useState(false);
  const [syncingContacts, setSyncingContacts] = useState(false);

  const router = useRouter();

  const {
    isConnected,
    sendMessage: sendWebSocketMessage,
    lastMessage,
    onlineUsers,
    typingUsers,
  } = useWebSocket();

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
      // Check if contacts need to be synced
      checkAndSyncContacts();
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        new URLSearchParams(window.location.search).get("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Verify token by calling /me endpoint
      await axios.get("/me");
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Authentication check failed:", error);
      localStorage.removeItem("accessToken");
      router.push("/login");
    }
  };

  const checkAndSyncContacts = async () => {
    try {
      // Check if user has any contacts
      const response = await axios.get("/contacts/registered");
      const contacts = response.data.contacts || [];

      if (contacts.length === 0) {
        // No contacts found, trigger sync
        await syncContacts();
      } else {
        setContactsSynced(true);
      }
    } catch (error) {
      console.error("Error checking contacts:", error);
      // If error, still allow manual sync
      setContactsSynced(true);
    }
  };

  const syncContacts = async () => {
    setSyncingContacts(true);
    setError(null);

    try {
      await axios.post("/contacts/sync");
      setContactsSynced(true);

      // Reload conversations after sync to show new contacts
      await loadConversations();
    } catch (error) {
      console.error("Error syncing contacts:", error);
      setError("Failed to sync contacts. Please try again.");
    } finally {
      setSyncingContacts(false);
    }
  };

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage);
    }
  }, [lastMessage]);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/conversations");
      setConversations(response.data.conversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case "new_message":
        handleNewMessage(message.data);
        break;
      case "message_sent":
        // Update message status to sent
        break;
      case "message_read":
        // Update message status to read
        break;
      case "contact_status":
        handleContactStatusChange(message.data);
        break;
      case "typing_indicator":
        // Handle typing indicator
        break;
    }
  };

  const handleNewMessage = (message: any) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            lastMessage: {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              senderName: message.sender.name,
              createdAt: message.createdAt,
              isRead: false,
            },
            unreadCount: conv.unreadCount + 1,
            lastMessageAt: message.createdAt,
          };
        }
        return conv;
      }),
    );
  };

  const handleContactStatusChange = (data: any) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.contact.id === data.userId) {
          return {
            ...conv,
            contact: {
              ...conv.contact,
              isOnline: data.isOnline,
              lastSeen: data.lastSeen,
            },
          };
        }
        return conv;
      }),
    );
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);

    // Mark conversation as read
    if (conversation.unreadCount > 0) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    }
  };

  const handleNewConversation = async (contactEmail: string) => {
    try {
      const response = await axios.post("/conversations", {
        contactEmail,
      });

      const newConversation = response.data.conversation;

      // Add to conversations list
      setConversations((prev) => [
        {
          id: newConversation.id,
          contact:
            newConversation.user1.email === contactEmail
              ? newConversation.user1
              : newConversation.user2,
          lastMessage: null,
          unreadCount: 0,
          lastMessageAt: newConversation.createdAt,
          createdAt: newConversation.createdAt,
        },
        ...prev,
      ]);

      setContactSearchOpen(false);
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError("Failed to create conversation");
    }
  };

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeen).getTime();
    const hours = diff / (1000 * 3600);

    if (hours < 1) {
      return "Just now";
    } else if (hours < 24) {
      return `${Math.floor(hours)}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Show syncing state
  if (syncingContacts) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            p: 4,
            backgroundColor: "rgba(112, 235, 218, 0.96)",
          }}
        >
        </Box>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Syncing your Google contacts...
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ maxWidth: 400 }}
        >
          Were importing your Google contacts to find friends who are also
          using this app. This may take a moment.
        </Typography>
      </Box>
    );
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.contact.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar with conversations */}
      <Box
        sx={{ width: 400, borderRight: "1px solid #e0e0e0", bgcolor: "white" }}
      >
        <Box
          sx={{
            textAlign: "center",
            p: 4,
            backgroundColor: "rgba(112, 235, 218, 0.96)",
          }}
        >
        </Box>
        {/* Header */}
        <Box
          sx={{ p: 2, borderBottom: "1px solid #e0e0e0", bgcolor: "#f5f5f5" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box>

              <Typography variant="h6" fontWeight="bold">
                Chats
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: isConnected ? "success.main" : "error.main",
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {isConnected ? "Connected" : "Disconnected"}
                </Typography>
              </Box>
            </Box>
          </Box>


          <TextField
            fullWidth
            size="small"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "white", borderRadius: 1 }}
          />
        </Box>

        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* Conversations list */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List disablePadding>
              {filteredConversations.length === 0 && !loading ? (
                <Box
                  sx={{
                    textAlign: "center",
                    p: 4,
                    backgroundColor: "rgba(112, 235, 218, 0.96)",
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No conversations yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Start a new conversation by entering someone`s email
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setContactSearchOpen(true)}
                  >
                    New Chat
                  </Button>
                </Box>
              ) : (
                filteredConversations.map((conversation) => (
                  <React.Fragment key={conversation.id}>
                    <ListItemButton
                      selected={selectedConversation?.id === conversation.id}
                      onClick={() => handleConversationSelect(conversation)}
                      sx={{ px: 2, py: 1.5 }}
                    >
                      <ListItemAvatar>
                        
                        <Badge
                          overlap="circular"
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          badgeContent={
                            conversation.contact.isOnline ? (
                              <OnlineIcon
                                sx={{
                                  width: 12,
                                  height: 12,
                                  color: "success.main",
                                  border: "2px solid white",
                                  borderRadius: "50%",
                                }}
                              />
                            ) : null
                          }
                        >
                          <Avatar
                            src={conversation.contact.picture}
                            alt={conversation.contact.name}
                            sx={{ width: 48, height: 48 }}
                          >
                            {conversation.contact.name[0]?.toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              component="span"
                              sx={{
                                fontWeight:
                                  conversation.unreadCount > 0
                                    ? "bold"
                                    : "normal",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "200px",
                              }}
                            >
                              {conversation.contact.name}
                            </Typography>
                            <Box
                              component="span"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              {conversation.lastMessage && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  component="span"
                                >
                                  {formatMessageTime(
                                    conversation.lastMessage.createdAt,
                                  )}
                                </Typography>
                              )}
                              {conversation.unreadCount > 0 && (
                                <Badge
                                  badgeContent={conversation.unreadCount}
                                  color="primary"
                                  sx={{ ml: 0.5 }}
                                />
                              )}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box component="span">
                            {conversation.lastMessage ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontWeight:
                                    conversation.unreadCount > 0
                                      ? "medium"
                                      : "normal",
                                  display: "block"
                                }}
                              >
                                {conversation.lastMessage.content}
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                                sx={{ display: "block" }}
                              >
                                {conversation.contact.isOnline
                                  ? "Online"
                                  : `Last seen ${formatLastSeen(conversation.contact.lastSeen)}`}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          )}
        </Box>
      </Box>

      {/* Main chat area */}
      <Box sx={{ flex: 1, bgcolor: "#f5f5f5" }}>
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",

              textAlign: "center",
              p: 4,
              backgroundColor: "rgba(161, 243, 232, 0.96)", // Cor de fundo adicionada aqui

            }}
            
          >
           
        <Typography variant="h6" gutterBottom>
          Select a conversation to start chatting
        </Typography>
        <Typography variant="body2">
          Choose a contact from your list or start a new conversation
        </Typography>
      </Box>
        )}
    </Box>

      {/* New conversation button */ }
  <Fab
    color="primary"
    aria-label="new chat"
    sx={{ position: "fixed", bottom: 24, right: 24 }}
    onClick={() => setContactSearchOpen(true)}
  >
    <EditIcon />
  </Fab>

  {/* Contact search dialog */ }
  <ContactSearch
    open={contactSearchOpen}
    onClose={() => setContactSearchOpen(false)}
    onSelectContact={handleNewConversation}
  />
    </Box >
  );
};

export default ChatInterface;
