interface IContato{
    id: string;
    ownerId: string;
    linkedUserId?: string;
    email?: string;
    name: string;
    createdAt: string;
}

export default IContato