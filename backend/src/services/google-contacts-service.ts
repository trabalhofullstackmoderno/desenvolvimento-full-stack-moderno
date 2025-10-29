import { google } from "googleapis";
import { decryptToken } from "@/http/controllers/users/authenticate";
import { prisma } from "@/lib/prisma";

export interface GoogleContactData {
  googlePersonId: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
  isRegistered?: boolean;
  registeredUser?: {
    id: string;
    name: string;
    picture: string;
    isOnline: boolean;
    lastSeen: Date;
  };
}

export class GoogleContactsService {
  async syncUserContacts(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { googleId: userId },
      select: { accessToken: true },
    });

    if (!user?.accessToken) {
      throw new Error("User access token not found");
    }

    const accessToken = decryptToken(user.accessToken);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const people = google.people({ version: "v1", auth: oauth2Client });

    try {
      const response = await people.people.connections.list({
        resourceName: "people/me",
        pageSize: 2000,
        personFields: "names,emailAddresses,phoneNumbers,photos",
      });

      const connections = response.data.connections || [];
      const contactsData: GoogleContactData[] = [];

      for (const person of connections) {
        console.log(person);
        const resourceName = person.resourceName;
        if (!resourceName) continue;

        const googlePersonId = resourceName.replace("people/", "");
        const name = person.names?.[0]?.displayName || "Unknown";
        const email = person.emailAddresses?.[0]?.value;
        const phoneNumber = person.phoneNumbers?.[0]?.value;
        const photoUrl = person.photos?.[0]?.url;

        if (email) {
          contactsData.push({
            googlePersonId,
            name,
            email,
            phoneNumber: phoneNumber || undefined,
            photoUrl: photoUrl || undefined,
          });
        }
      }

      // Bulk upsert contacts
      for (const contact of contactsData) {
        await prisma.googleContact.upsert({
          where: {
            userId_googlePersonId: {
              userId,
              googlePersonId: contact.googlePersonId,
            },
          },
          create: {
            userId,
            ...contact,
          },
          update: {
            name: contact.name,
            email: contact.email,
            phoneNumber: contact.phoneNumber,
            photoUrl: contact.photoUrl,
          },
        });
      }
    } catch (error) {
      console.error("Error syncing contacts:", error);
      throw new Error("Failed to sync contacts from Google");
    }
  }

  async getRegisteredContacts(
    userId: string,
    query?: string,
  ): Promise<GoogleContactData[]> {
    const whereClause: any = {
      userId,
      email: { not: null },
    };

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ];
    }

    const contacts = await prisma.googleContact.findMany({
      where: whereClause,
      take: 50,
      orderBy: { name: "asc" },
    });

    // Check which contacts are registered users
    const contactEmails = contacts.map((c) => c.email).filter((email): email is string => Boolean(email));
    const registeredUsers = await prisma.user.findMany({
      where: {
        email: { in: contactEmails },
        id: { not: userId }, // Exclude self
      },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    const registeredUsersByEmail = new Map(
      registeredUsers.map((user) => [user.email, user]),
    );

    return contacts
      .map((contact) => {
        const registeredUser = registeredUsersByEmail.get(contact.email!);
        return {
          googlePersonId: contact.googlePersonId,
          name: contact.name,
          email: contact.email || undefined,
          phoneNumber: contact.phoneNumber || undefined,
          photoUrl: contact.photoUrl || undefined,
          isRegistered: !!registeredUser,
          registeredUser: registeredUser
            ? {
                id: registeredUser.id,
                name: registeredUser.name || registeredUser.email,
                picture: registeredUser.picture || "",
                isOnline: registeredUser.isOnline,
                lastSeen: registeredUser.lastSeen,
              }
            : undefined,
        };
      })
      .filter((contact) => contact.isRegistered); // Only return registered users
  }

  async searchContacts(
    userId: string,
    query: string,
  ): Promise<GoogleContactData[]> {
    return this.getRegisteredContacts(userId, query);
  }

  async getContacts(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<GoogleContactData[]> {
    return this.getRegisteredContacts(userId);
  }

  async findUserByEmail(email: string): Promise<any> {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        isOnline: true,
        lastSeen: true,
      },
    });
  }
}
