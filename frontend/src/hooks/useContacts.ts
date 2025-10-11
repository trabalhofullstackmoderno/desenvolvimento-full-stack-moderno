import { useState } from 'react'
import Contact from "@/components/types/Contact";
import axios from "../auth/axios";

interface GoogleContact {
  googlePersonId: string
  name: string
  email?: string
  phoneNumber?: string
  photoUrl?: string
}

export const useContacts = () => {
    const [loading, setLoading] = useState(false)
    const [contacts, setContacts] = useState<GoogleContact[]>([])

    // Legacy contact functions (keeping for backward compatibility)
    const handleIndexContacts = async () => {
        return await axios.get("/contacts")
    }

    const handleCreateContacts = (newContact: Contact) => {
        // Implementation for legacy contacts
    }

    const handleUpdateContacts = (contact: Contact) => {
        // Implementation for legacy contacts
    }

    const handleDeleteContacts = () => {
        // Implementation for legacy contacts
    }

    // New Google contacts functions
    const syncContacts = async () => {
        setLoading(true)
        try {
            await axios.post('/contacts/sync')
        } catch (error) {
            console.error('Error syncing contacts:', error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const searchContacts = async (query: string) => {
        if (!query.trim()) return []

        setLoading(true)
        try {
            const response = await axios.get('/contacts/search', {
                params: { q: query }
            })
            setContacts(response.data.contacts)
            return response.data.contacts
        } catch (error) {
            console.error('Error searching contacts:', error)
            return []
        } finally {
            setLoading(false)
        }
    }

    const getContacts = async (limit = 50, offset = 0) => {
        setLoading(true)
        try {
            const response = await axios.get('/contacts', {
                params: { limit, offset }
            })
            setContacts(response.data.contacts)
            return response.data.contacts
        } catch (error) {
            console.error('Error getting contacts:', error)
            return []
        } finally {
            setLoading(false)
        }
    }

    return {
        // Legacy functions
        handleIndexContacts,
        handleCreateContacts,
        handleUpdateContacts,
        handleDeleteContacts,

        // New Google contacts functions
        syncContacts,
        searchContacts,
        getContacts,
        contacts,
        loading
    }
}

export default useContacts