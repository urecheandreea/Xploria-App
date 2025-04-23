import { generatedSecret } from './Config';

export type GeneratedSecret = typeof generatedSecret;

export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    friendsList: User[];
    hobbies: string[];
    biography: string;
    profilePicture: string;
    dateCreated: Date;
}

export interface Group {
    id: string;
    creatorId: string;
    category: string;
    dateCreated: string;
    description: string;
    eventDate: Date;
    image: string;
    location: string;
    noParticipants: number;
    title: string;
    participants: [];
    pendingRequests: [];
}

export interface Comment {
    id: string;
    creatorId: string;
    groupId: string;
    text: string;
    dateCreated: string;
}
